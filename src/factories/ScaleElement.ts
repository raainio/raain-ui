import Chart from 'chart.js/auto';

export class ScaleElementInput {
    constructor(
        public colors: { color: string }[],
        public labels: string[],
        public label: string
    ) {
    }
}

function getGradient(chart, y1, color1, y2, color2) {
    const {ctx, scales: {y}} = chart;
    const gradient = ctx.createLinearGradient(0, y.getPixelForValue(y1), 0, y.getPixelForValue(y2));
    // const gradient = ctx.createLinearGradient(0, y1, 0, y2);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    return gradient;
}

export class ScaleElement {

    public chart: Chart<any>;

    constructor(protected addSomeDebugInfos = false) {
    }

    public build(element: HTMLCanvasElement, inputs: ScaleElementInput): void {

        const data = {
            labels: [inputs.label],
            datasets: inputs.colors.map((c, index) => {
                return {
                    type: 'bar',
                    data: [1],
                    backgroundColor(context: any) {
                        const chart = context.chart;
                        const {ctx, chartArea} = chart;
                        if (!chartArea) {
                            // This case happens on initial chart load
                            return;
                        }
                        const color1 = inputs.colors[index].color;
                        let color2 = color1;
                        if (inputs.colors.length > index + 1) {
                            color2 = inputs.colors[index + 1].color;
                        }
                        return getGradient(chart, index, color1, index + 1, color2);
                    },
                };
            })
        };

        const config: any = {
            data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false,
                    },
                    tooltip: {
                        enabled: false,
                    }
                },
                layout: {
                    padding: 0 // Remove padding around the chart
                },
                scales: {
                    x: {
                        stacked: true,
                        border: {
                            display: false // Hide the y-axis borderline
                        },
                        grid: {
                            drawBorder: false, // Hide the y-axis grid border
                            drawOnChartArea: false, // Hide the y-axis grid lines on the chart area
                            drawTicks: false // Hide the y-axis ticks
                        },
                        ticks: {
                            // display: false // Hide the y-axis tick labels
                        }
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        border: {
                            display: false // Hide the y-axis borderline
                        },
                        grid: {
                            drawBorder: false, // Hide the y-axis grid border
                            drawOnChartArea: false, // Hide the y-axis grid lines on the chart area
                            // drawTicks: false // Hide the y-axis ticks
                        },
                        ticks: {
                            // display: false // Hide the y-axis tick labels
                            callback(value: number) {
                                if (value >= 0 && value < inputs.labels.length) {
                                    return inputs.labels[value];
                                }
                                return '';
                            }
                        }
                    },
                },
            },
            plugins: [],
        };
        this.chart = new Chart(element, config);
    }


}
