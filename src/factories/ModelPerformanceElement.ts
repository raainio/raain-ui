import Chart from 'chart.js/auto';
import {ChartColors} from './ChartColors';

export class ModelPerformanceElementInput {
    constructor(
        public models: Array<{
            name: string;
            date: Date;
            KPEi: number | null;
            KPE1: number | null;
        }> = []
    ) {}
}

export class ModelPerformanceElement {
    public chart: Chart<any>;

    constructor(protected addSomeDebugInfos = false) {}

    public build(element: HTMLCanvasElement, inputs: ModelPerformanceElementInput): void {
        const sorted = [...inputs.models].sort((a, b) => a.date.getTime() - b.date.getTime());
        const labels = sorted.map((m) => m.name);
        const kpeIData = sorted.map((m) => m.KPEi);
        const kpe1Data = sorted.map((m) => m.KPE1);

        const config: any = {
            type: 'line',
            data: {
                labels,
                datasets: [
                    {
                        label: 'KPEi (5 min)',
                        data: kpeIData,
                        borderColor: ChartColors.lineRed,
                        backgroundColor: ChartColors.lineRed,
                        tension: 0.4,
                        spanGaps: true,
                    },
                    {
                        label: 'KPE1 (1h)',
                        data: kpe1Data,
                        borderColor: ChartColors.greenCpu,
                        backgroundColor: ChartColors.greenCpu,
                        tension: 0.4,
                        spanGaps: true,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        ticks: {
                            maxRotation: 45,
                            autoSkip: true,
                        },
                    },
                    y: {
                        min: -2,
                        max: 1,
                        title: {
                            display: true,
                            text: 'KPE',
                        },
                    },
                },
                plugins: {
                    legend: {
                        display: true,
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                    },
                },
            },
        };

        this.chart = new Chart(element, config);
    }
}
