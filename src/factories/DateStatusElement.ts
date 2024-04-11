import Chart from 'chart.js/auto';
import {ChartColors, DateRange, Tools} from './Tools';
import {getRelativePosition} from 'chart.js/helpers';

export class DateStatusElementInput {
    constructor(
        public setOfData: {
            label: string,
            style: string,
            values: { date: Date, value: number }[],
        }[] = [],
        public focusDate: Date = new Date(),
        public focusRange: DateRange = DateRange.CENTURY
    ) {
    }
}

export class DateStatusElement {

    public chart: Chart<any>;
    public focusReset: () => void;
    public focusPrevious: () => void;
    public focusNext: () => void;

    constructor(protected addSomeDebugInfos = false) {
        this.focusReset = () => {
        };
        this.focusPrevious = () => {
        };
        this.focusNext = () => {
        };
    }

    protected static filterFocus(mapToFilter: Array<{ date: Date, value: number }>, focusDate: Date, focusRange: DateRange): Array<{
        date: Date,
        value: number
    }> {

        return mapToFilter
            .filter(e => {
                let isIn = true;
                if (isIn && focusRange >= DateRange.YEAR) {
                    isIn = e.date.getFullYear() === focusDate.getFullYear();
                }
                if (isIn && focusRange >= DateRange.MONTH) {
                    isIn = e.date.getMonth() === focusDate.getMonth();
                }
                if (isIn && focusRange >= DateRange.DAY) {
                    isIn = e.date.getDate() === focusDate.getDate();
                }
                if (isIn && focusRange >= DateRange.HOUR) {
                    isIn = e.date.getHours() === focusDate.getHours();
                }
                return isIn;
            })
            .sort((a, b) => a.date.getTime() - b.date.getTime());
    }

    protected static groupFocus(
        mapToFilter: Array<{ date: Date, value: number }>,
        focusDate: Date,
        focusRange: DateRange,
        min: Date,
        max: Date) {

        console.log('groupFocus:', mapToFilter.length, focusDate, focusRange);
        const filteredAndSorted = DateStatusElement.filterFocus(mapToFilter, focusDate, focusRange);

        if (focusRange === DateRange.CENTURY) {
            const groupedByYear = [];
            for (let i = min.getFullYear(); i <= max.getFullYear(); i++) {
                const yearDate = new Date(focusDate);
                yearDate.setFullYear(i);
                const sum = DateStatusElement.filterFocus(filteredAndSorted, yearDate, DateRange.YEAR)
                    .reduce((partialSum, a) => partialSum + a.value, 0);
                groupedByYear.push(sum);
            }
            return groupedByYear;
        }

        if (focusRange === DateRange.YEAR) {
            const groupedByMonth = [];
            for (let i = 0; i < 12; i++) {
                const monthDate = new Date(focusDate);
                monthDate.setMonth(i);
                const sum = DateStatusElement.filterFocus(filteredAndSorted, monthDate, DateRange.MONTH)
                    .reduce((partialSum, a) => partialSum + a.value, 0);
                groupedByMonth.push(sum);
            }
            return groupedByMonth;
        }

        if (focusRange === DateRange.MONTH) {
            const groupedByDay = [];
            const daysInMonth = new Date(focusDate.getFullYear(), focusDate.getMonth(), 0).getDate();
            for (let i = 0; i < daysInMonth; i++) {
                const dayDate = new Date(focusDate);
                dayDate.setDate(i);
                const sum = DateStatusElement.filterFocus(filteredAndSorted, dayDate, DateRange.DAY)
                    .reduce((partialSum, a) => partialSum + a.value, 0);
                groupedByDay.push(sum);
            }
            return groupedByDay;
        }

        if (focusRange === DateRange.DAY) {
            const groupedByHour = [];
            for (let i = 0; i < 24; i++) {
                const hourDate = new Date(focusDate);
                hourDate.setHours(i);
                const sum = DateStatusElement.filterFocus(filteredAndSorted, hourDate, DateRange.HOUR)
                    .reduce((partialSum, a) => partialSum + a.value, 0);
                groupedByHour.push(sum);
            }
            return groupedByHour;
        }

        // if (focusRange === DateRange.HOUR) {
        return filteredAndSorted.map(e => e.value);
    }

    protected static focusLabels(focusDate: Date, focusRange: DateRange, min: Date, max: Date, data: {
        label: string,
        style: string,
        values: { date: Date, value: number }[],
    }[]) {
        if (focusRange === DateRange.CENTURY) {
            const groupedByYear = [];
            for (let i = min.getFullYear(); i <= max.getFullYear(); i++) {
                groupedByYear.push(DateStatusElement.buildLabelYear(new Date(focusDate), i));
            }
            return groupedByYear;
        } else if (focusRange === DateRange.YEAR) {
            const groupedByMonth = [];
            for (let i = 0; i < 12; i++) {
                groupedByMonth.push(DateStatusElement.buildLabelMonth(new Date(focusDate), i));
            }
            return groupedByMonth;
        } else if (focusRange === DateRange.MONTH) {
            const groupedByDay = [];
            const daysInMonth = new Date(focusDate.getFullYear(), focusDate.getMonth(), 0).getDate();
            for (let i = 0; i < daysInMonth; i++) {
                groupedByDay.push(DateStatusElement.buildLabelDay(new Date(focusDate), i));
            }
            return groupedByDay;
        } else if (focusRange === DateRange.DAY) {
            const groupedByHour = [];
            for (let i = 0; i < 24; i++) {
                groupedByHour.push(DateStatusElement.buildLabelHour(new Date(focusDate), i));
            }
            return groupedByHour;
        }

        // all dates that are in the current hour
        let allDates = [];
        data.forEach(d => {
            allDates = allDates.concat(d.values);
        });
        const filteredHourDates = DateStatusElement.filterFocus(allDates, focusDate, DateRange.HOUR);
        const filteredHourDatesISO = filteredHourDates
            .map(v => DateStatusElement.buildLabel(v.date));
        return filteredHourDatesISO.filter((item, pos, self) => {
            return self.indexOf(item) === pos;
        });
    }

    protected static getFocusDateAndTitle(oldFocusDate: Date, focusRange: DateRange, index: number, min: Date, max: Date) {

        const newFocusDate = new Date(oldFocusDate);
        let newTitle = '....';

        if (focusRange === DateRange.CENTURY) {
            newTitle = DateStatusElement.buildLabelYear(newFocusDate, min.getFullYear() + index);
        } else if (focusRange === DateRange.YEAR) {
            newTitle = DateStatusElement.buildLabelMonth(newFocusDate, index);
        } else if (focusRange === DateRange.MONTH) {
            newTitle = DateStatusElement.buildLabelDay(newFocusDate, index);
        } else if (focusRange === DateRange.DAY) {
            newTitle = DateStatusElement.buildLabelHour(newFocusDate, index);
        } else if (focusRange === DateRange.HOUR) {
            newTitle = DateStatusElement.buildLabel(newFocusDate);
        }

        console.log('getFocusDateAndTitle:', index, oldFocusDate?.toISOString(), newFocusDate.toISOString(), newTitle);
        return {newFocusDate, newTitle};
    }

    protected static buildLabel(date: Date): string {
        // "2024-03-28 13:02:48 CET"  l=23
        return Tools.formatDate(date, DateRange.MINUTE);
    }

    protected static buildLabelYear(date: Date, year: number): string {
        date.setFullYear(year);
        return Tools.formatDate(date, DateRange.YEAR);
    }

    protected static buildLabelMonth(date: Date, month: number): string {
        date.setMonth(month);
        return Tools.formatDate(date, DateRange.MONTH);
    }

    protected static buildLabelDay(date: Date, day: number): string {
        date.setDate(day + 1);
        return Tools.formatDate(date, DateRange.DAY);
    }

    protected static buildLabelHour(date: Date, hour: number): string {
        date.setHours(hour);
        return Tools.formatDate(date, DateRange.HOUR);
    }

    public build(element: HTMLCanvasElement, inputs: DateStatusElementInput): void {

        if (inputs.setOfData.length > 7) {
            return null;
        }

        const datasets = [];
        const colors = [
            Tools.getTransparency(ChartColors.blue, 0.5),
            Tools.getTransparency(ChartColors.red, 0.5),
            Tools.getTransparency(ChartColors.green, 0.5),
            Tools.getTransparency(ChartColors.grey, 0.5),
            Tools.getTransparency(ChartColors.orange, 0.5),
            Tools.getTransparency(ChartColors.purple, 0.5),
            Tools.getTransparency(ChartColors.yellow, 0.5),
        ];
        const originalDataPoints = [];

        let min, max;
        inputs.setOfData.forEach(s => {
            s.values.forEach(v => {
                min = min ? Math.min(min, v.date.getTime()) : v.date.getTime();
                max = max ? Math.max(max, v.date.getTime()) : v.date.getTime();
            });
        });
        min = new Date(min);
        max = new Date(max);

        for (const [index, dataContainer] of inputs.setOfData.entries()) {
            const borderColor = colors[index];
            const dataPoints = DateStatusElement.groupFocus(dataContainer.values, inputs.focusDate, inputs.focusRange, min, max);
            datasets.push(
                {
                    label: dataContainer.label,
                    type: dataContainer.style,
                    data: dataPoints,
                    borderColor,
                    backgroundColor: borderColor,
                });
            originalDataPoints.push(dataPoints);
        }

        const data = {
            datasets,
            labels: DateStatusElement.focusLabels(inputs.focusDate, inputs.focusRange, min, max, inputs.setOfData)
        };

        const config: any = {
            data,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        // display: false,
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                //  if (context.dataset.type === 'bubble') {
                                //      return new Date(context.parsed.x).toISOString() + ': '
                                //          + context.parsed.y + ' , ' + context.parsed._custom;
                                //  }
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: ' '
                    }
                },
                // scales: {
                //    x: {
                //        ticks: {
                //            callback: labelCallBack,
                //        }
                //    }
                // },
                onClick: (e) => {
                    const eChart = e.chart;
                    const eFocusRange = eChart['focusRange'];
                    const canvasPosition = getRelativePosition(e, eChart);
                    const pos = chart.scales.x.getValueForPixel(canvasPosition.x);

                    const {newFocusDate, newTitle} = DateStatusElement.getFocusDateAndTitle(eChart['focusDate'],
                        eFocusRange,
                        pos,
                        eChart['focusDateMin'],
                        eChart['focusDateMax']);

                    eChart['focusPos'] = pos;
                    eChart['focusRange'] = eFocusRange + 1;
                    eChart['focusDate'] = new Date(newFocusDate);
                    eChart.config['_config'].options.plugins.title.text = '' + newTitle;

                    eChart.data.datasets.forEach((dataset, index) => {
                        dataset.data = DateStatusElement.groupFocus(inputs.setOfData[index].values,
                            eChart['focusDate'], eChart['focusRange'],
                            eChart['focusDateMin'], eChart['focusDateMax']);
                    });
                    eChart.data.labels = DateStatusElement.focusLabels(eChart['focusDate'], eChart['focusRange'],
                        eChart['focusDateMin'], eChart['focusDateMax'], inputs.setOfData);

                    // console.log('update...');
                    eChart.update();
                }
            },
        };

        const chart = new Chart(element, config);
        chart['focusDate'] = inputs.focusDate;
        chart['focusRange'] = inputs.focusRange;
        chart['focusDateMin'] = min;
        chart['focusDateMax'] = max;

        this.focusReset = () => {
            chart.config['_config'].options.plugins.title.text = '...';
            chart['focusDate'] = inputs.focusDate;
            chart['focusRange'] = DateRange.CENTURY;
            chart.data.datasets.forEach((dataset, index) => {
                dataset.data = originalDataPoints[index];
            });
            chart.data.labels = DateStatusElement.focusLabels(chart['focusDate'], chart['focusRange'],
                chart['focusDateMin'], chart['focusDateMax'], inputs.setOfData);
            chart.update();
        };

        this.focusPrevious = () => {

            const eFocusRange = chart['focusRange'] - 1;
            let eFocusPos = chart['focusPos'] ? chart['focusPos'] : 0;
            eFocusPos = eFocusPos - 1;

            const {newFocusDate, newTitle} = DateStatusElement.getFocusDateAndTitle(chart['focusDate'],
                eFocusRange, eFocusPos,
                chart['focusDateMin'], chart['focusDateMax']);

            chart['focusPos'] = eFocusPos;
            chart['focusDate'] = new Date(newFocusDate);
            chart.config['_config'].options.plugins.title.text = '' + newTitle;

            chart.data.datasets.forEach((dataset, index) => {
                dataset.data = DateStatusElement.groupFocus(inputs.setOfData[index].values,
                    chart['focusDate'], chart['focusRange'],
                    chart['focusDateMin'], chart['focusDateMax']);
            });
            chart.data.labels = DateStatusElement.focusLabels(chart['focusDate'], chart['focusRange'],
                chart['focusDateMin'], chart['focusDateMax'], inputs.setOfData);

            chart.update();
        };

        this.focusNext = () => {

            const eFocusRange = chart['focusRange'] - 1;
            let eFocusPos = chart['focusPos'] ? chart['focusPos'] : 0;
            eFocusPos = eFocusPos + 1;

            const {newFocusDate, newTitle} = DateStatusElement.getFocusDateAndTitle(chart['focusDate'],
                eFocusRange, eFocusPos,
                chart['focusDateMin'], chart['focusDateMax']);

            chart['focusPos'] = eFocusPos;
            chart['focusDate'] = new Date(newFocusDate);
            chart.config['_config'].options.plugins.title.text = '' + newTitle;

            chart.data.datasets.forEach((dataset, index) => {
                dataset.data = DateStatusElement.groupFocus(inputs.setOfData[index].values,
                    chart['focusDate'], chart['focusRange'],
                    chart['focusDateMin'], chart['focusDateMax']);
            });

            chart.data.labels = DateStatusElement.focusLabels(chart['focusDate'],
                chart['focusRange'], chart['focusDateMin'], chart['focusDateMax'], inputs.setOfData);

            chart.update();
        };

        this.chart = chart;
    }

}
