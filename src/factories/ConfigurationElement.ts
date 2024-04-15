import Chart from 'chart.js/auto';
import chartDragData from 'chartjs-plugin-dragdata';
import {ChartColors, Tools} from './Tools';

export class ConfigurationElementInput {
    constructor(
        public points: { x: number, y: number }[] = [],
        public minPoint: { x: number, y: number } = {x: 0, y: 0},
        public maxPoint: { x: number, y: number } = {x: 100, y: 100},
        public dragCallback?: any
    ) {
    }
}

export class ConfigurationElement {

    public chart: Chart<any>;

    constructor(protected addSomeDebugInfos = false) {
    }

    public build(element: HTMLCanvasElement, inputs: ConfigurationElementInput): void {

        const data = {
            datasets: [
                {
                    type: 'scatter',
                    data: inputs.points,
                    borderColor: Tools.getTransparency(ChartColors.blue, 0.5),
                },
                {
                    type: 'line',
                    data: inputs.points,
                    borderColor: ChartColors.blue,
                    fill: false,
                    tension: 0.4,
                }],
        };

        const config: any = {
            data,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false,
                    },
                    dragData: {
                        // round: 1, // rounds the values to n decimal places; in this case 1, e.g 0.1234 => 0.1)
                        magnet: {
                            to: (value: { x: number, y: number }) => {
                                return {x: value.x, y: Math.round(value.y * 10) / 10};
                            }
                        },
                        showTooltip: false, // show the tooltip while dragging [default = true]
                        dragX: true, // also enable dragging along the x-axis.
                        onDrag: (e: any, datasetIndex: number, index: number, value: { x: number, y: number }) => {
                            const done = inputs.dragCallback ? inputs.dragCallback(e) : null;
                            return true;
                        },
                        // this solely works for continous, numerical x-axis scales (no categories or dates)!
                        // onDrag: (e, datasetIndex, index, value) => {
                        //     console.log('onDrag : ', e, datasetIndex, index, value);
                        //     if (points && index > 0) {
                        //         const pointBefore = points[index - 1];
                        //         if (pointBefore.y > value.y) {
                        //             return false;
                        //         }
                        //     }
                        //     if (points && index < points.length) {
                        //         const pointAfter = points[index + 1];
                        //         if (pointAfter.y < value.y) {
                        //             return false;
                        //         }
                        //     }
                        //     return true;
                        // },
                    },
                    tooltip: {
                        enabled: true,
                        filter: (t) => {
                            return t.datasetIndex === 0;
                        }
                    },
                },

                scales: {
                    x: {
                        display: true,
                        suggestedMin: inputs.minPoint.x, suggestedMax: inputs.maxPoint.x,
                    },
                    y: {
                        display: true,
                        suggestedMin: inputs.minPoint.y, suggestedMax: inputs.maxPoint.y,
                        // type: 'logarithmic',
                    },
                },

                // onClick(e) {
                // console.log('onClick ', e);
                // const canvasPosition = Chart.helpers.getRelativePosition(e, chart);
                // Substitute the appropriate scale IDs
                // const dataX = chart.scales.x.getValueForPixel(canvasPosition.x);
                // const dataY = chart.scales.y.getValueForPixel(canvasPosition.y);
                //  },

            },
            plugins: [chartDragData],
        };

        //   window.removePoint = (x, y) => {
        //   console.log('removePoint', x, y);
        //   chart.data.datasets.forEach(dataset => {
        //       let indexToRemove = -1;
        //       dataset.data.forEach((d, index) => {
        //           if (x === d.x) {
        //               indexToRemove = index;
        //           }
        //       });
        //       if (indexToRemove > -1) {
        //           console.log('remove ', indexToRemove);
        //           dataset.data.splice(indexToRemove, 1);
        //       }
        //   });

        // chart.update();

        this.chart = new Chart(element, config);
    }


}
