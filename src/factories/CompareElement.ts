import Chart from 'chart.js/auto';
import {Tools} from './Tools';
import {ChartColors} from './ChartColors';

export class CompareElementInput {
    constructor(
        public points: { x: number, y: number, r: number, name: string, id: string }[] = [],
        public topPoint: { x: number, y: number } = {
            x: 100,
            y: 100
        },
        public clickCallback?: any
    ) {
    }
}

export class CompareElement {

    public chart: Chart<any>;

    constructor(protected addSomeDebugInfos = false) {
    }

    public build(element: HTMLCanvasElement, inputs: CompareElementInput): void {
        const bijectivePoints = [{x: 0, y: 0}, {x: inputs.topPoint.x, y: inputs.topPoint.y}];
        const data = {
            datasets: [
                {
                    type: 'bubble',
                    data: inputs.points,
                    borderColor: Tools.getTransparency(ChartColors.grey, 0.2),
                    backgroundColor: Tools.getTransparency(ChartColors.grey, 0.7),
                    pointStyle: 'circle',
                    pointHoverRadius: 15,
                },
                {
                    type: 'line',
                    data: bijectivePoints,
                    borderColor: ChartColors.red,
                    backgroundColor: Tools.getTransparency(ChartColors.red, 0.9),
                    pointStyle: false,
                    borderDash: [2, 2],
                },
            ],
            selectedPoint: undefined,
        };

        const config: any = {
            data,
            options: {
                responsive: true,
                aspectRatio: 2,
                plugins: {
                    legend: {
                        display: false,
                    },

                    tooltip: {
                        // filter: (a) => {
                        //     return a.dataIndex === 0;
                        // },
                        callbacks: {
                            label: (context: any) => {
                                let label = '';
                                if (context.dataset.data[context.dataIndex]) {
                                    data.selectedPoint = context.dataset.data[context.dataIndex];
                                    label = context.dataset.data[context.dataIndex].name;
                                    if (!label) {
                                        label = '';
                                    }
                                }
                                return label;
                            }
                        }
                    },

                },
                onClick(e: any) {
                    if (data.selectedPoint && inputs.clickCallback) {
                        inputs.clickCallback(data.selectedPoint);
                    }
                },
            },
        };

        this.chart = new Chart(element, config);
    }


}
