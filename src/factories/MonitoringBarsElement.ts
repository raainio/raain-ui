import Chart from 'chart.js/auto';
import {ChartColors} from './ChartColors';

export class MonitoringBarsElementInput {
    constructor(
        public bars: Array<{ label: string, percentage: number }> = []
    ) {
    }
}

export class MonitoringBarsElement {

    public chart: Chart<any>;

    constructor(protected addSomeDebugInfos = false) {
    }

    public build(element: HTMLCanvasElement, inputs: MonitoringBarsElementInput): void {

        const labels = inputs.bars.map(b => b.label);
        const data = inputs.bars.map(b => b.percentage);

        const config: any = {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    data,
                    borderColor: ChartColors.greenCpu,
                    backgroundColor: ChartColors.greenCpu,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                aspectRatio: 1,
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        min: 0,
                        beginAtZero: true,
                        max: 100,
                        display: false,
                    }
                },
                grid: {
                    display: false,
                    drawTicks: false,
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

    public add(bars: Array<{ percentage: number }>) {
        this.chart.data.datasets[0].data = bars.map(b => b.percentage);
        this.chart.update();
    }

}
