import Chart from 'chart.js/auto';
import {ChartColors} from './Tools';

export class MonitoringLinesElementInput {
    constructor(
        public points: Array<{ date: Date, percentage: number }> = [],
        public limit = 100,
    ) {
    }
}

export class MonitoringLinesElement {

    public chart: Chart<any>;
    public limit: number;

    constructor(protected addSomeDebugInfos = false) {
    }

    public build(element: HTMLCanvasElement, inputs: MonitoringLinesElementInput): void {

        this.limit = inputs.limit;
        const labels = inputs.points.map(b => b.date.toISOString());
        const data = inputs.points.map(b => b.percentage);

        const config: any = {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    data,
                    borderColor: ChartColors.greenCpu,
                    tension: 0.1,
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        // display: false,
                        grid: {
                            // display: false,
                        },
                        ticks: {
                            display: false,
                        },
                    },
                    y: {
                        min: 0,
                        beginAtZero: true,
                        max: 100,
                        // display: false,
                        grid: {
                            // display: false,
                        },
                        ticks: {
                            display: false,
                        },
                    }
                },
                grid: {
                    display: true,
                    // drawTicks: false,
                },
                plugins: {
                    legend: {
                        display: false,
                    },
                },
            }
        };

        this.chart = new Chart(element, config);
    }

    public add(percentage: number, date: Date = new Date()) {
        let allLabels = JSON.parse(JSON.stringify(this.chart.data.labels));
        let allPoints = JSON.parse(JSON.stringify(this.chart.data.datasets[0].data));

        if (allLabels.length >= this.limit) {
            allLabels = allLabels.slice(1);
            allPoints = allPoints.slice(1);
        }

        allLabels.push(date.toISOString());
        allPoints.push(percentage);

        this.chart.data.labels = allLabels;
        this.chart.data.datasets[0].data = allPoints;
        this.chart.update();
    }


}
