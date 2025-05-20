import Chart from 'chart.js/auto';
import {ChartColors} from './ChartColors';

export class MonitoringLinesElementInput {
    constructor(
        public pointsLines: Array<{ label: string, points: Array<{ date: Date, percentage: number }> }> = [],
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
        if (inputs.pointsLines.length === 0) {
            throw new Error('No point lines found.');
        }

        const labels = inputs.pointsLines[0].points.map(b => b.date.toISOString());
        const datasets = inputs.pointsLines.map((pl, index) => {
            const data = pl.points.map(b => b.percentage);
            return {
                label: pl.label,
                data,
                borderColor: ChartColors[index],
                tension: 0.4,
            };
        });

        const config: any = {
            type: 'line',
            data: {
                labels,
                datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
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
                elements: {
                    point: {
                        pointBorderWidth: 0,
                        pointRadius: 0,
                    },
                },
                plugins: {
                    legend: {
                        display: true,
                    },
                },
            }
        };

        this.chart = new Chart(element, config);
    }

    public add(linesPoint: Array<{ label: string, percentage: number }>, date: Date = new Date())
        : Array<{ label: string, points: Array<{ date: Date, percentage: number }> }> {
        let allLabels = JSON.parse(JSON.stringify(this.chart.data.labels));
        const allLinesPoints = this.chart.data.datasets;

        if (allLabels.length >= this.limit) {
            allLabels = allLabels.slice(1);
        }
        allLabels.push(date.toISOString());

        allLinesPoints.forEach((line, index) => {
            let allPoints = JSON.parse(JSON.stringify(line.data));
            if (allPoints.length >= this.limit) {
                allPoints = allPoints.slice(1);
            }
            const found = linesPoint.filter(l => l.label === line.label);
            if (found.length === 1) {
                allPoints.push(found[0].percentage);
            } else {
                allPoints.push(0);
            }
            line.data = allPoints;
        });

        this.chart.data.labels = allLabels;
        this.chart.update();

        return allLinesPoints.map(line => {
            const points = line.data.map((data: number, index: number) => {
                return {date: new Date(allLabels[index]), percentage: data};
            });
            return {label: line.label, points};
        });
    }

}
