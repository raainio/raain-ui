import Chart from 'chart.js/auto';
import {DateRange, Tools} from './Tools';
import {getRelativePosition} from 'chart.js/helpers';
import {ChartColors} from './ChartColors';
import {DateStatusUtils} from './DateStatusUtils';

export interface IDataSet {
    label: string;
    style: string;
    values: {date: Date; value: number}[];
}

export interface IDataPoint {
    label: string;
    type: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
}

export class DateStatusElementInput {
    constructor(
        public setOfData: IDataSet[] = [],
        public focusDate: Date = new Date(),
        public focusRange: DateRange = DateRange.CENTURY,
        public chartMinValue?: number,
        public chartMaxValue?: number
    ) {}
}

export class DateStatusElement {
    public chart: Chart<any>;
    public chartTitle = '';
    public focusReset: (dataPoints?: IDataPoint[]) => Promise<void>;
    public focusPrevious: () => Promise<void>;
    public focusNext: () => Promise<void>;
    public focusClick: (e) => Promise<void>;
    public minDate: Date;
    public maxDate: Date;
    public focusPos: number;
    public focusDate: Date;
    public focusRange: DateRange;
    public chartMinValue: number | undefined;
    public chartMaxValue: number | undefined;

    constructor(protected addSomeDebugInfos = false) {
        this.focusReset = async () => {};
        this.focusPrevious = async () => {};
        this.focusNext = async () => {};
    }

    protected _setOfData: IDataSet[];

    protected get setOfData(): IDataSet[] {
        return this._setOfData;
    }

    protected set setOfData(value: IDataSet[]) {
        this._setOfData = value;
    }

    protected _originalDataPoints: number[][];

    protected get originalDataPoints(): number[][] {
        return this._originalDataPoints;
    }

    public build(element: HTMLCanvasElement, inputs: DateStatusElementInput): void {
        if (inputs.setOfData.length > 7) {
            throw new Error('DateStatusElement: too many data to display');
        }
        this.setOfData = inputs.setOfData;
        this.chartMinValue = inputs.chartMinValue;
        this.chartMaxValue = inputs.chartMaxValue;
        const datasets = this.buildDateTimeSeries(inputs.focusDate, inputs.focusRange);

        const data = {
            datasets,
            labels: DateStatusUtils.focusLabels(
                inputs.focusDate,
                inputs.focusRange,
                this.minDate,
                this.maxDate,
                this.setOfData
            ),
        };

        const config = this.createChartConfig(data);
        this.initializeChart(element, config, inputs);
        this.setupFocusHandlers(inputs);
    }

    getFocusPosRelative(event: any, chart_: any) {
        const canvasPosition = getRelativePosition(event[0], chart_);
        return chart_.scales.x.getValueForPixel(canvasPosition.x);
    }

    protected updateChartTitle(title: string): void {
        this.chartTitle = '' + title;
        if (this.chart && this.chart.config && this.chart.config['_config']) {
            this.chart.config['_config'].options.plugins.title.text = this.chartTitle;
        }
    }

    protected createChartConfig(data: {datasets: IDataPoint[]; labels: string[]}): any {
        const options: any = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: ' ',
                },
                dragData: false,
            },
            onClick: (...args: any[]) => {
                return this.focusClick(args);
            },
            scales: {
                x: {},
                y: {},
            },
        };

        // Add min/max configuration if chartMinValue or chartMaxValue is provided
        if (this.chartMinValue !== undefined || this.chartMaxValue !== undefined) {
            options.scales.y.min = this.chartMinValue;
            options.scales.y.max = this.chartMaxValue;
        }

        return {
            data,
            options,
        };
    }

    protected initializeChart(
        element: HTMLCanvasElement,
        config: any,
        inputs: DateStatusElementInput
    ): void {
        this.chart = new Chart(element, config);
        this.focusPos = this.getInitialFocusPos(inputs.focusDate, inputs.focusRange, this.minDate);
        this.focusDate = inputs.focusDate;
        this.focusRange = inputs.focusRange;
        this.updateChartTitle(' ');
    }

    protected setupFocusHandlers(inputs: DateStatusElementInput): void {
        this.setupFocusClickHandler();
        this.setupFocusResetHandler(inputs);
        this.setupFocusNavigationHandlers();
    }

    protected setupFocusClickHandler(): void {
        this.focusClick = async (e) => {
            if (this.focusRange >= DateRange.HOUR) {
                return;
            }

            const focusPos = this.getFocusPosRelative(e, this.chart);

            const {newFocusDate, newTitle} = DateStatusUtils.getFocusDateAndTitle(
                this.focusDate,
                this.focusRange + 1,
                focusPos,
                this.minDate,
                this.maxDate
            );

            this.focusRange++;
            this.focusPos = focusPos;
            this.focusDate = new Date(newFocusDate);
            this.updateChartTitle(newTitle);
            this.updateChartData();
        };
    }

    protected setupFocusResetHandler(inputs: DateStatusElementInput): void {
        this.focusReset = async (dataPoints?: IDataPoint[]) => {
            this.updateChartTitle(' ');
            this.focusPos = 0;
            this.focusDate = new Date(inputs.focusDate);
            this.focusRange = inputs.focusRange;

            this.chart.data.datasets.forEach((dataPoint: IDataPoint, index) => {
                dataPoint.data = this.originalDataPoints[index];
                if (dataPoints) {
                    dataPoint.type = dataPoints[index].type;
                    dataPoint.borderColor = dataPoints[index].borderColor;
                    dataPoint.backgroundColor = dataPoints[index].backgroundColor;
                    dataPoint.label = dataPoints[index].label;
                }
            });

            // Ensure we have valid min and max dates
            if (this.minDate && this.maxDate) {
                this.chart.data.labels = DateStatusUtils.focusLabels(
                    this.focusDate,
                    this.focusRange,
                    this.minDate,
                    this.maxDate,
                    this.setOfData
                );
            }

            this.chart.update();
        };
    }

    protected setupFocusNavigationHandlers(): void {
        this.focusNext = async () => {
            const {pos, newFocusDate} = this.getFocusPosAdded(1);
            this.updateChart(pos, newFocusDate);
        };

        this.focusPrevious = async () => {
            const {pos, newFocusDate} = this.getFocusPosAdded(-1);
            this.updateChart(pos, newFocusDate);
        };
    }

    protected updateChartData(): void {
        // Ensure we have valid min and max dates
        if (!(this.minDate && this.maxDate)) {
            return;
        }

        this.chart.data.datasets.forEach((dataset: any, index: number) => {
            dataset.data = DateStatusUtils.groupFocus(
                this.setOfData[index].values,
                this.focusDate,
                this.focusRange,
                this.minDate,
                this.maxDate
            );
        });
        this.chart.data.labels = DateStatusUtils.focusLabels(
            this.focusDate,
            this.focusRange,
            this.minDate,
            this.maxDate,
            this.setOfData
        );

        this.chart.update();
    }

    protected updateChart(
        eFocusPos: number,
        eFocusDate: Date,
        eFocusRange: DateRange = this.focusRange
    ): void {
        const {newFocusDate, newTitle} = DateStatusUtils.getFocusDateAndTitle(
            eFocusDate,
            eFocusRange,
            eFocusPos,
            this.minDate,
            this.maxDate
        );

        this.focusPos = eFocusPos;
        this.focusDate = new Date(newFocusDate);
        this.updateChartTitle(newTitle);
        this.updateChartData();
    }

    protected buildDateTimeSeries(focusDate: Date, focusRange: DateRange) {
        const colors = [
            Tools.getTransparency(ChartColors.status1, 0.5),
            Tools.getTransparency(ChartColors.status2, 0.5),
            Tools.getTransparency(ChartColors.status3, 0.5),
            Tools.getTransparency(ChartColors.status4, 0.5),
            Tools.getTransparency(ChartColors.status5, 0.5),
            Tools.getTransparency(ChartColors.status6, 0.5),
            Tools.getTransparency(ChartColors.status7, 0.5),
        ];

        let min: number, max: number;
        this.setOfData.forEach((s) => {
            s.values.forEach((v) => {
                min = min ? Math.min(min, v.date.getTime()) : v.date.getTime();
                max = max ? Math.max(max, v.date.getTime()) : v.date.getTime();
            });
        });
        this.minDate = new Date(min);
        this.maxDate = new Date(max);

        const datasets: IDataPoint[] = [];
        const originalDataPoints: number[][] = [];
        for (const [index, dataContainer] of this.setOfData.entries()) {
            const borderColor = colors[index];
            const data = DateStatusUtils.groupFocus(
                dataContainer.values,
                focusDate,
                focusRange,
                this.minDate,
                this.maxDate
            );
            datasets.push({
                label: dataContainer.label,
                type: dataContainer.style,
                data,
                borderColor,
                backgroundColor: borderColor,
            });
            originalDataPoints.push(data);
        }
        this._originalDataPoints = originalDataPoints;
        return datasets;
    }

    protected getInitialFocusPos(focusDate: Date, focusRange: DateRange, min: Date) {
        let pos = 0;
        if (focusRange === DateRange.YEAR) {
            pos = focusDate.getUTCFullYear() - min.getUTCFullYear();
        } else if (focusRange === DateRange.MONTH) {
            pos = focusDate.getUTCMonth();
        } else if (focusRange === DateRange.DAY) {
            pos = focusDate.getUTCDate() - 1;
        } else if (focusRange === DateRange.HOUR) {
            pos = focusDate.getUTCHours();
        } else if (focusRange === DateRange.MINUTE) {
            pos = focusDate.getUTCMinutes();
        }
        return pos;
    }

    protected getFocusPosAdded(
        toAdd: number,
        focusDate: Date = this.focusDate,
        focusRange: DateRange = this.focusRange
    ) {
        let pos = this.focusPos || 0;
        const newFocusDate = new Date(focusDate);
        const min = this.minDate;

        if (focusRange === DateRange.YEAR) {
            newFocusDate.setUTCFullYear(focusDate.getUTCFullYear() + toAdd);
            pos = newFocusDate.getUTCFullYear() - min.getUTCFullYear();
        } else if (focusRange === DateRange.MONTH) {
            newFocusDate.setUTCMonth(focusDate.getUTCMonth() + toAdd);
            pos = newFocusDate.getUTCMonth();
        } else if (focusRange === DateRange.DAY) {
            newFocusDate.setUTCDate(focusDate.getUTCDate() + toAdd);
            pos = newFocusDate.getUTCDate() - 1;
        } else if (focusRange === DateRange.HOUR) {
            newFocusDate.setUTCHours(focusDate.getUTCHours() + toAdd);
            pos = newFocusDate.getUTCHours();
        } else if (focusRange === DateRange.MINUTE) {
            newFocusDate.setUTCMinutes(focusDate.getUTCMinutes() + toAdd);
            pos = newFocusDate.getUTCMinutes();
        }

        return {pos, newFocusDate};
    }
}
