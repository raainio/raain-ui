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
    public focusClick: (e) => void;

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
                if (isIn && focusRange >= DateRange.MINUTE) {
                    isIn = e.date.getMinutes() === focusDate.getMinutes();
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

        if (focusRange === DateRange.HOUR) {
            const groupedByMinutes = [];
            for (let i = 0; i < 60; i++) {
                const minuteDate = new Date(focusDate);
                minuteDate.setMinutes(i);
                const sum = DateStatusElement.filterFocus(filteredAndSorted, minuteDate, DateRange.MINUTE)
                    .reduce((partialSum, a) => partialSum + a.value, 0);
                groupedByMinutes.push(sum);
            }
            return groupedByMinutes;
        }

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

        // all minutes that are in the current hour
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
        let newTitle = '...';

        if (focusRange === DateRange.YEAR) {
            newTitle = DateStatusElement.buildLabelYear(newFocusDate, min.getFullYear() + index);
        } else if (focusRange === DateRange.MONTH) {
            newTitle = DateStatusElement.buildLabelMonth(newFocusDate, index);
        } else if (focusRange === DateRange.DAY) {
            newTitle = DateStatusElement.buildLabelDay(newFocusDate, index);
        } else if (focusRange === DateRange.HOUR) {
            newTitle = DateStatusElement.buildLabelHour(newFocusDate, index);
        } else if (focusRange === DateRange.MINUTE) {
            newTitle = DateStatusElement.buildLabel(newFocusDate);
        }

        // console.log('getFocusDateAndTitle:', focusRange, index, oldFocusDate?.toISOString(), newFocusDate.toISOString(), newTitle);
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

        this.focusClick = (e) => {
            const eChart = e?.chart ? e.chart : chart;
            const eFocusRange = eChart['focusRange'] + 1;
            const focusPos = this.getFocusPosRelative(e, eChart);

            const {newFocusDate, newTitle} = DateStatusElement.getFocusDateAndTitle(eChart['focusDate'],
                eFocusRange,
                focusPos,
                eChart['focusDateMin'],
                eChart['focusDateMax']);

            eChart['focusPos'] = focusPos;
            eChart['focusRange'] = eFocusRange;
            eChart['focusDate'] = new Date(newFocusDate);
            eChart.config['_config'].options.plugins.title.text = '' + newTitle;

            eChart.data.datasets.forEach((dataset: any, index: number) => {
                dataset.data = DateStatusElement.groupFocus(inputs.setOfData[index].values,
                    eChart['focusDate'], eChart['focusRange'],
                    eChart['focusDateMin'], eChart['focusDateMax']);
            });
            eChart.data.labels = DateStatusElement.focusLabels(eChart['focusDate'], eChart['focusRange'],
                eChart['focusDateMin'], eChart['focusDateMax'], inputs.setOfData);

            eChart.update();
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
                onClick: this.focusClick
            },
        };

        const chart = new Chart(element, config);
        chart['focusPos'] = this.getInitialFocusPos(inputs.focusDate, inputs.focusRange, min);
        chart['focusDate'] = inputs.focusDate;
        chart['focusRange'] = inputs.focusRange;
        chart['focusDateMin'] = min;
        chart['focusDateMax'] = max;

        this.focusReset = () => {
            chart.config['_config'].options.plugins.title.text = '...';
            chart['focusPos'] = 0;
            chart['focusDate'] = inputs.focusDate;
            chart['focusRange'] = DateRange.CENTURY;
            chart.data.datasets.forEach((dataset, index) => {
                dataset.data = originalDataPoints[index];
            });
            chart.data.labels = DateStatusElement.focusLabels(chart['focusDate'], chart['focusRange'],
                chart['focusDateMin'], chart['focusDateMax'], inputs.setOfData);

            chart.update();
        };

        const chartUpdate = (chartToUpdate: Chart, eFocusRange: DateRange, eFocusPos: number, eFocusDate: Date) => {
            const {newFocusDate, newTitle} = DateStatusElement.getFocusDateAndTitle(eFocusDate,
                eFocusRange, eFocusPos,
                chartToUpdate['focusDateMin'], chartToUpdate['focusDateMax']);

            chartToUpdate['focusPos'] = eFocusPos;
            chartToUpdate['focusDate'] = new Date(newFocusDate);
            chartToUpdate.config['_config'].options.plugins.title.text = '' + newTitle;

            chartToUpdate.data.datasets.forEach((dataset, index) => {
                dataset.data = DateStatusElement.groupFocus(inputs.setOfData[index].values,
                    chartToUpdate['focusDate'], chartToUpdate['focusRange'],
                    chartToUpdate['focusDateMin'], chartToUpdate['focusDateMax']);
            });

            chartToUpdate.data.labels = DateStatusElement.focusLabels(chartToUpdate['focusDate'],
                chartToUpdate['focusRange'], chartToUpdate['focusDateMin'], chartToUpdate['focusDateMax'], inputs.setOfData);

            chartToUpdate.update();
        };

        this.focusNext = () => {
            const eFocusRange = chart['focusRange'];
            const {pos, newFocusDate} = this.getFocusPosAdded(chart, eFocusRange, 1, chart['focusDate'], min);
            chartUpdate(chart, eFocusRange, pos, newFocusDate);
        };

        this.focusPrevious = () => {
            const eFocusRange = chart['focusRange'];
            const {pos, newFocusDate} = this.getFocusPosAdded(chart, eFocusRange, -1, chart['focusDate'], min);
            chartUpdate(chart, eFocusRange, pos, newFocusDate);
        };

        this.chart = chart;
    }

    getFocusPosRelative(event: any, chart: any) {
        const canvasPosition = getRelativePosition(event, chart);
        return chart.scales.x.getValueForPixel(canvasPosition.x);
    }

    protected getInitialFocusPos(focusDate: Date, focusRange: DateRange, min: Date) {
        let pos = 0;
        if (focusRange === DateRange.YEAR) {
            pos = focusDate.getFullYear() - min.getFullYear();
        } else if (focusRange === DateRange.MONTH) {
            pos = focusDate.getMonth();
        } else if (focusRange === DateRange.DAY) {
            pos = focusDate.getDate() - 1;
        } else if (focusRange === DateRange.HOUR) {
            pos = focusDate.getHours();
        } else if (focusRange === DateRange.MINUTE) {
            pos = focusDate.getMinutes();
        }
        return pos;
    }

    protected getFocusPosAdded(chart: any, focusRange: DateRange, toAdd: number, focusDate: Date, min: Date) {
        let pos = chart['focusPos'] || 0;
        const newFocusDate = new Date(focusDate);

        if (focusRange === DateRange.YEAR) {
            newFocusDate.setFullYear(focusDate.getFullYear() + toAdd);
            pos = newFocusDate.getFullYear() - min.getFullYear();
        } else if (focusRange === DateRange.MONTH) {
            newFocusDate.setMonth(focusDate.getMonth() + toAdd);
            pos = newFocusDate.getMonth();
        } else if (focusRange === DateRange.DAY) {
            newFocusDate.setDate(focusDate.getDate() + toAdd);
            pos = newFocusDate.getDate() - 1;
        } else if (focusRange === DateRange.HOUR) {
            newFocusDate.setHours(focusDate.getHours() + toAdd);
            pos = newFocusDate.getHours();
        } else if (focusRange === DateRange.MINUTE) {
            newFocusDate.setMinutes(focusDate.getMinutes() + toAdd);
            pos = newFocusDate.getMinutes();
        }

        return {pos, newFocusDate};
    }

}
