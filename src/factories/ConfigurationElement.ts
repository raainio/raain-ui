import Chart from 'chart.js/auto';
import chartDragData from 'chartjs-plugin-dragdata';
import {Tools} from './Tools';
import {ChartColors} from './ChartColors';

export class ConfigurationElementInput {
    constructor(
        public points: { x: number, y: number }[] = [],
        public minPoint: { x: number, y: number } = {x: 0, y: 0},
        public maxPoint: { x: number, y: number } = {x: 100, y: 100},
        public logAdded = false,
        public backgroundColors: { color: string, yStart: number, yEnd: number }[] = [],
        public dragCallback?: any
    ) {
    }
}

const plugin = {
    id: 'customCanvasBackgroundColor',
    beforeDraw: (chart, args, options) => {
        // console.log('customCanvasBackgroundColor.beforeDraw', args, options);
        const {ctx, chartArea: {top, bottom, left, right}, scales: {y}} = chart;
        //  ctx.save();
//
        //  const yScales = [];
        //  const yTos = [150, 90, 50, 30, 10];
        //  for (const yTo of yTos) {
        //      let pos = y.getPixelForValue(yTo);
        //      if (pos < top) {
        //          pos = top;
        //      }
        //      yScales.push(pos);
        //  }
//
        //  let previousYScale = top;
        //  for (const yScale of yScales) {
        //      // Add color stops with varying alpha values
        //      const gradient = ctx.createLinearGradient(left, previousYScale, right - left, yScale - previousYScale);
        //      gradient.addColorStop(0, 'rgba(255, 205, 86, 0)'); // Transparent at the top
        //      gradient.addColorStop(0.5, 'rgba(255, 205, 86, 1)' + '0.5)'); // Semi-transparent in the middle
        //      gradient.addColorStop(1, 'rgba(255, 205, 86, 1)' + '1)'); // Opaque at the bottom
//
        //      ctx.fillStyle = gradient;
        //      // ctx.fillStyle = chart.options.plugins.customBackground.color;
        //      // ctx.fillStyle = options.color || '#99ffff';
//
        //      ctx.fillRect(left, previousYScale, right - left, yScale - previousYScale);
        //      previousYScale = yScale;
        //  }
//
        //  ctx.restore();

        const colors = options.colors;

        ctx.save();
        colors.forEach(colorConfig => {
            const yStartPixel = y.getPixelForValue(colorConfig.yStart);
            const yEndPixel = y.getPixelForValue(colorConfig.yEnd);
            ctx.fillStyle = colorConfig.color;
            ctx.fillRect(left, yStartPixel, right - left, yEndPixel - yStartPixel);
        });
        ctx.restore();
    }
};

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
                    tension: 0,
                }],
        };

        const yType = inputs.logAdded ? 'logarithmic' : '';

        const config: any = {
            data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
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
                        filter: (t: any) => {
                            return t.datasetIndex === 0;
                        }
                    },
                    customCanvasBackgroundColor: {
                        colors: inputs.backgroundColors
                        //  [
                        //      {color: Tools.getTransparency(ChartColors.grey, 0.8), yStart: 5, yEnd: 10},
                        //      {color: Tools.getTransparency(ChartColors.blue, 0.8), yStart: 10, yEnd: 20},
                        //      {color: Tools.getTransparency(ChartColors.red, 0.8), yStart: 50, yEnd: 70},
                        //      {color: Tools.getTransparency(ChartColors.orange, 0.8), yStart: 100, yEnd: 240}
                        //  ]
                    }
                },

                scales: {
                    x: {
                        display: true,
                        suggestedMin: inputs.minPoint.x, suggestedMax: inputs.maxPoint.x,
                    },
                    y: {
                        display: true,
                        suggestedMin: inputs.minPoint.y, suggestedMax: inputs.maxPoint.y,
                        // type: yType,

                        ticks: {
                            // For a category axis, the val is the index so the lookup via getLabelForValue is needed
                            callback: function(val: number, index: number) {
                                if (inputs.logAdded) {
                                    // Hide every 2nd tick label
                                    return this.getLabelForValue(Math.pow(10, val)) + ' => ' + val;
                                }
                                return this.getLabelForValue(val);
                            },
                            // color: 'red',
                        }

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
            plugins: [chartDragData, plugin],
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

        this.chart = new Chart(element, config);
    }


}
