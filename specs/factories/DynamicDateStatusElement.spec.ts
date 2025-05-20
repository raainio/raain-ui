import {expect} from 'chai';
import {JSDOM} from 'jsdom';
import * as sinon from 'sinon';
import {DateRange, DynamicDateStatusElement, DynamicDateStatusElementInput} from '../../src';

describe('Factories.DynamicDateStatusElement', () => {
    let element: HTMLCanvasElement | any;
    let dynamicElement: DynamicDateStatusElement;
    let fetchDataFnSpy: any;

    beforeEach(() => {
        // Create a canvas element using JSDOM
        const fakeDom = new JSDOM(`<!DOCTYPE html><canvas id="myChart" width="400" height="400"></canvas>`);
        element = fakeDom.window.document.querySelector('#myChart');
        (element as any).getContext = () => {
            return {};
        };

        // Create a spy for the fetchDataFn
        fetchDataFnSpy = sinon.stub().callsFake(async (focusDate: Date, focusRange: DateRange) => {
            // Return different data based on the focus range
            const baseData = [
                {
                    date: new Date('2023-01-01'),
                    value: 10
                },
                {
                    date: new Date('2023-02-01'),
                    value: 20
                },
                {
                    date: new Date('2023-03-01'),
                    value: 30
                }
            ];

            // Add more data points for more detailed focus ranges
            if (focusRange >= DateRange.MONTH) {
                baseData.push(
                    {
                        date: new Date('2023-03-15'),
                        value: 35
                    }
                );
            }

            return [
                {
                    label: 'Test Data',
                    style: 'line',
                    values: baseData
                }
            ];
        });

        // We'll mock the chart property after build is called

        // Create the dynamic element
        dynamicElement = new DynamicDateStatusElement();
    });

    afterEach(() => {
        // Clean up
        sinon.restore();
    });

    it('should fetch data on initialization', async () => {
        // Create input with the spy
        const input = new DynamicDateStatusElementInput(fetchDataFnSpy);

        // Create a mock chart object
        const mockChart = {
            config: {
                _config: {
                    options: {
                        plugins: {
                            title: {
                                text: ''
                            }
                        }
                    }
                }
            },
            data: {
                datasets: [],
                labels: []
            },
            update: sinon.stub()
        };

        // Stub the DateStatusElement.prototype.build method to avoid Chart.js initialization
        const originalBuild = dynamicElement.build;
        dynamicElement.build = async function(htmlCanvasElement, inputs) {
            // Call the original build method
            await originalBuild.call(this, htmlCanvasElement, inputs);

            // Replace the chart property with our mock
            this.chart = mockChart;

            return;
        };

        // Build the element
        dynamicElement.build(element, input);

        expect(fetchDataFnSpy.callCount).to.equal(1);
    });

    it('should fetch data when focusReset is called', async () => {
        // Create input with the spy
        const input = new DynamicDateStatusElementInput(
            fetchDataFnSpy
        );

        // Create a mock chart object
        const mockChart = {
            config: {
                _config: {
                    options: {
                        plugins: {
                            title: {
                                text: ''
                            }
                        }
                    }
                }
            },
            data: {
                datasets: [],
                labels: []
            },
            update: sinon.stub()
        };

        // Stub the DateStatusElement.prototype.build method to avoid Chart.js initialization
        const originalBuild = dynamicElement.build;
        dynamicElement.build = async function(htmlCanvasElement, inputs) {
            // Call the original build method
            await originalBuild.call(this, htmlCanvasElement, inputs);

            // Replace the chart property with our mock
            this.chart = mockChart;

            return;
        };

        // Build the element
        await dynamicElement.build(element, input);

        // Reset the spy to clear the initial call
        fetchDataFnSpy.resetHistory();

        // Call focusReset
        await dynamicElement.focusReset();

        // Verify that fetchDataFn was called with the reset focus date and range
        expect(fetchDataFnSpy.calledWith(input.focusDate, DateRange.YEAR)).to.eq(true);
        expect(fetchDataFnSpy.callCount).to.equal(1);
    });

    it('should fetch data when focusNext is called', async () => {
        // Create input with the spy
        const input = new DynamicDateStatusElementInput(
            fetchDataFnSpy
        );

        // Create a mock chart object
        const mockChart = {
            config: {
                _config: {
                    options: {
                        plugins: {
                            title: {
                                text: ''
                            }
                        }
                    }
                }
            },
            data: {
                datasets: [],
                labels: []
            },
            update: sinon.stub(),
            // Add properties needed for focusNext
            focusRange: DateRange.CENTURY,
            focusDate: new Date('2023-01-01'),
            focusDateMin: new Date('2022-01-01'),
            focusPos: 0
        };

        // Stub the DateStatusElement.prototype.build method to avoid Chart.js initialization
        const originalBuild = dynamicElement.build;
        dynamicElement.build = async function(htmlCanvasElement, inputs) {
            // Call the original build method
            await originalBuild.call(this, htmlCanvasElement, inputs);

            // Replace the chart property with our mock
            this.chart = mockChart;

            return;
        };

        // Build the element
        await dynamicElement.build(element, input);

        // Reset the spy to clear the initial call
        fetchDataFnSpy.resetHistory();

        // Call focusNext
        await dynamicElement.focusNext();

        // Verify that fetchDataFn was called
        expect(fetchDataFnSpy.callCount).to.equal(1);
    });

    it('should fetch data when focusPrevious is called', async () => {
        // Create input with the spy
        const input = new DynamicDateStatusElementInput(
            fetchDataFnSpy
        );

        // Create a mock chart object
        const mockChart = {
            config: {
                _config: {
                    options: {
                        plugins: {
                            title: {
                                text: ''
                            }
                        }
                    }
                }
            },
            data: {
                datasets: [],
                labels: []
            },
            update: sinon.stub(),
            // Add properties needed for focusPrevious
            focusRange: DateRange.CENTURY,
            focusDate: new Date('2023-01-01'),
            focusDateMin: new Date('2022-01-01'),
            focusPos: 0
        };

        // Stub the DateStatusElement.prototype.build method to avoid Chart.js initialization
        const originalBuild = dynamicElement.build;
        dynamicElement.build = async function(htmlCanvasElement, inputs) {
            // Call the original build method
            await originalBuild.call(this, htmlCanvasElement, inputs);

            // Replace the chart property with our mock
            this.chart = mockChart;

            return;
        };

        // Build the element
        dynamicElement.build(element, input);

        // Reset the spy to clear the initial call
        fetchDataFnSpy.resetHistory();

        // Call focusPrevious
        await dynamicElement.focusPrevious();

        // Verify that fetchDataFn was called
        expect(fetchDataFnSpy.callCount).to.equal(1);
    });
});
