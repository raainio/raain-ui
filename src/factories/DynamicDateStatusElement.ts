import {DateRange} from './Tools';
import {DateStatusElement, DateStatusElementInput} from './DateStatusElement';
import {DateStatusUtils} from './DateStatusUtils';

export class DynamicDateStatusElementInput extends DateStatusElementInput {
    constructor(
        public fetchDataFn: (focusDate: Date, focusRange: DateRange) => Promise<{
            label: string,
            style: string,
            values: { date: Date, value: number }[],
        }[]>,
        public options: {
            dataLength?: number,
            focusDate?: Date,
            focusRange?: DateRange,
            chartMinValue?: number,
            chartMaxValue?: number
        } = {
            dataLength: 1,
            focusDate: new Date(),
            focusRange: DateRange.YEAR,
            chartMinValue: 0,
            chartMaxValue: 100,
        },
    ) {
        super(
            [{label: '...', style: 'bar', values: []}],
            options.focusDate ?? new Date(),
            options.focusRange ?? DateRange.YEAR,
            options.chartMinValue,
            options.chartMaxValue
        );
    }
}

export class DynamicDateStatusElement extends DateStatusElement {
    protected element: HTMLCanvasElement;
    protected inputs: DynamicDateStatusElementInput;
    protected fetchDataFn: (focusDate: Date, focusRange: DateRange) => Promise<{
        label: string,
        style: string,
        values: { date: Date, value: number }[],
    }[]>;

    constructor(addSomeDebugInfos = false) {
        super(addSomeDebugInfos);
    }

    public build(element: HTMLCanvasElement, inputs: DynamicDateStatusElementInput) {
        console.log('DynamicDateStatusElement.build');
        this.element = element;
        this.inputs = inputs;
        this.fetchDataFn = this.inputs.fetchDataFn;

        // Call the parent build method with the fetched data
        super.build(element, this.inputs);

        // Override focus methods to fetch data asynchronously
        this.overrideFocusMethods();

        this.focusReset().then();
    }

    private overrideFocusMethods(): void {
        // Store original methods
        const originalFocusReset = this.focusReset;
        const originalFocusNext = this.focusNext;
        const originalFocusPrevious = this.focusPrevious;
        const originalFocusClick = this.focusClick;

        // Override focusReset
        this.focusReset = async () => {
            // Show loading state
            this.setLoadingState(true);

            // Reset to top view
            this.focusPos = 0;
            this.focusDate = new Date(this.inputs.focusDate);
            this.focusRange = this.inputs.focusRange;

            try {
                this.setOfData = await this.fetchDataFn(this.focusDate, this.focusRange);
                const dataPoints = this.buildDateTimeSeries(this.inputs.focusDate, this.inputs.focusRange);
                await originalFocusReset(dataPoints);
            } catch (error) {
                if (!document || !document['mocked']) {
                    console.error('Error fetching data and focus reset:', error);
                }
            } finally {
                this.setLoadingState(false);
            }
        };

        // Override focusNext
        this.focusNext = async () => {
            // Show loading state
            this.setLoadingState(true);

            const eFocusRange = this.focusRange;
            const {pos, newFocusDate} = this.getFocusPosAdded(1, this.focusDate, eFocusRange);

            try {
                // Fetch new data
                this.setOfData = await this.fetchDataFn(newFocusDate, eFocusRange);

                // Call original's method
                await originalFocusNext();
            } catch (error) {
                console.error('Error fetching data:', error);
                // Handle error state
            } finally {
                // Hide loading state
                this.setLoadingState(false);
            }
        };

        // Override focusPrevious
        this.focusPrevious = async () => {
            // Show loading state
            this.setLoadingState(true);

            const eFocusRange = this.focusRange;
            const {pos, newFocusDate} = this.getFocusPosAdded(-1, this.focusDate, eFocusRange);

            try {
                // Fetch new data
                this.setOfData = await this.fetchDataFn(newFocusDate, eFocusRange);

                // Call original's method
                await originalFocusPrevious();
            } catch (error) {
                console.error('Error fetching data:', error);
                // Handle error state
            } finally {
                // Hide loading state
                this.setLoadingState(false);
            }
        };

        // Override focusClick
        this.focusClick = async (e) => {

            if (this.focusRange >= DateRange.HOUR) {
                return;
            }

            // Show loading state
            this.setLoadingState(true);

            try {
                // Fetch new data
                const focusPos = this.getFocusPosRelative(e, this.chart);
                const {newFocusDate} = DateStatusUtils.getFocusDateAndTitle(
                    this.focusDate,
                    this.focusRange + 1,
                    focusPos,
                    this.minDate, this.maxDate
                );
                this.setOfData = await this.fetchDataFn(newFocusDate, this.focusRange + 1);

                // Call original's method
                await originalFocusClick(e);
            } catch (error) {
                console.error('Error fetching data:', error);
                // Handle error state
            } finally {
                // Hide loading state
                this.setLoadingState(false);
            }
        };
    }

    private setLoadingState(isLoading: boolean): void {
        if (this.chart && (!document || !document['mocked'])) {
            // Update chart title to show loading state
            if (isLoading) {
                this.updateChartTitle('Loading...');
                this.chart.update();
            }
        }
    }
}
