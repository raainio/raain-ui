import {canvas, LatLng, map, tileLayer} from 'leaflet';
import {CartesianLayer} from '../layers/CartesianLayer';
import {TimeframeContainers} from '../timeframes/TimeframeContainers';
import {PolarLayer} from '../layers/PolarLayer';
import {MarkersLayer} from '../layers/MarkersLayer';
import {CompositeLayer} from '../layers/CompositeLayer';
import {PolarLayerConfig} from '../layers/PolarLayerConfig';
import colorLib from '@kurkle/color';
import Chart, {ChartTypeRegistry} from 'chart.js/auto';
import chartDragData from 'chartjs-plugin-dragdata';
import {MapLatLng} from '../tools/MapLatLng';

const CHART_COLORS = {
    red: 'rgb(255, 99, 132)',
    orange: 'rgb(255, 159, 64)',
    yellow: 'rgb(255, 205, 86)',
    green: 'rgb(75, 192, 192)',
    blue: 'rgb(54, 162, 235)',
    purple: 'rgb(153, 102, 255)',
    grey: 'rgb(201, 203, 207)',
};

function getTransparency(value, opacity) {
    const alpha = opacity === undefined ? 0.5 : 1 - opacity;
    return colorLib(value).alpha(alpha).rgbString();
}

export class ElementsFactory {

    constructor(
        public center: LatLng | { lat: number, lng: number } | { latitude: number, longitude: number } | any = {lat: 0, lng: 0},
        protected addSomeDebugInfos = false,
    ) {
        const lat = typeof this.center.lat !== 'undefined' ? this.center.lat : this.center.latitude;
        const lng = typeof this.center.lng !== 'undefined' ? this.center.lng : this.center.longitude;
        this.center = new LatLng(lat, lng);
    }

    public createMap(element: HTMLElement,
                     markers: MapLatLng[] = [],
                     timeframeContainers: TimeframeContainers = null) {

        let markersLayer: MarkersLayer;
        let compositeLayer: CompositeLayer;
        const mapLeaflet = map(element, {
            preferCanvas: true, zoomControl: true, zoomAnimation: true, trackResize: false, boxZoom: false,
            renderer: canvas(),
        }).setView([this.center.lat, this.center.lng], 10);

        // tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        //    attribution: '&copy;<a href="https://www.openstreetmap.org/copyright">osm</a>',
        // }).addTo(mapLeaflet);

        //   // https://leaflet-extras.github.io/leaflet-providers/preview/
        //     const OpenTopoMap = tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        //       maxZoom: 17,
        //       attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
        //    '<a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> ' +
        //         '(<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
        //     });
        //  const Stamen_TerrainBackground = tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain-background/{z}/{x}/{y}{r}.{ext}',
        //       {
        //         attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, ' +
        //           '<a href="http://creativecommons.org/licenses/by/3.0">' +
        //           'CC BY 3.0</a> &mdash; Map data &copy; ' +
        //           '<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        //         subdomains: 'abcd',
        //         minZoom: 0,
        //         maxZoom: 18,
        //         // ext: 'png'
        //       });
        const Esri_WorldTopoMap = tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile' +
            '/{z}/{y}/{x}',
            {
                attribution: '&copy;arcgis',
            });
        Esri_WorldTopoMap.addTo(mapLeaflet);

        const width = element.offsetWidth;
        const height = element.offsetHeight;

        if (markers && markers.length) {
            markersLayer = new MarkersLayer();
            markersLayer.setCurrentWidth(width);
            markersLayer.setCurrentHeight(height);
            markersLayer.render(markers);
            markersLayer.addToMap(mapLeaflet);
        }

        if (timeframeContainers && timeframeContainers.containers.length) {
            compositeLayer = new CompositeLayer();
            compositeLayer.setCurrentWidth(width);
            compositeLayer.setCurrentHeight(height);

            let firstLayerIdPushed;
            const tfcs = timeframeContainers.containers;
            tfcs.forEach(timeFrameContainer => {
                timeFrameContainer.setCompositeLayer(compositeLayer);
                timeFrameContainer.timeframe.forEach((frameContainer, timeframeIndex) => {
                    const layerId = timeFrameContainer.getFrameId(frameContainer);
                    const values: any = frameContainer.values;

                    let layer;
                    if (frameContainer.isPolar) {
                        layer = new PolarLayer(layerId, timeFrameContainer.name, mapLeaflet, this.addSomeDebugInfos);
                        layer.setPolarValues(this.center, values, new PolarLayerConfig());
                    } else if (frameContainer.isCartesian) {
                        layer = new CartesianLayer(layerId, timeFrameContainer.name, mapLeaflet, this.addSomeDebugInfos);
                        layer.setCartesianGridValues(this.center, values);
                    }

                    if (!firstLayerIdPushed) {
                        firstLayerIdPushed = layerId;
                    }
                    compositeLayer.addLayer(layer);
                });
            });
            compositeLayer.addToMap(mapLeaflet);
            compositeLayer.showTheFistMatchingId(firstLayerIdPushed);
        }

        mapLeaflet.invalidateSize({animate: true});
        return {mapLeaflet, markersLayer, compositeLayer};
    }

    public createCompare(element: HTMLCanvasElement,
                         points: { x: number, y: number, r: number }[] = [],
                         topPoint: { x: number, y: number } = {
                             x: 100,
                             y: 100
                         }): Chart<'bar' | 'line' | 'scatter' | 'bubble' | 'pie' | 'doughnut' | 'polarArea' | 'radar', [ChartTypeRegistry['bar' | 'line' | 'scatter' | 'bubble' | 'pie' | 'doughnut' | 'polarArea' | 'radar']['defaultDataPoint']] extends [unknown] ? Array<ChartTypeRegistry['bar' | 'line' | 'scatter' | 'bubble' | 'pie' | 'doughnut' | 'polarArea' | 'radar']['defaultDataPoint']> : never, unknown> {

        const bijectivePoints = [{x: 0, y: 0}, {x: topPoint.x, y: topPoint.y}];
        const data = {
            datasets: [
                {
                    type: 'bubble',
                    data: points,
                    borderColor: CHART_COLORS.grey,
                    backgroundColor: getTransparency(CHART_COLORS.grey, 0.5),
                    pointStyle: 'circle',
                    pointHoverRadius: 15,
                },
                {
                    type: 'line',
                    data: bijectivePoints,
                    borderColor: CHART_COLORS.red,
                    backgroundColor: getTransparency(CHART_COLORS.red, 0.9),
                    pointStyle: false,
                    borderDash: [2, 2],
                },
            ],
        };

        const config: any = {
            data,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false,
                    },
                },
            },
        };

        return new Chart(element, config);
    }


    public createConfiguration(element: HTMLCanvasElement,
                               points: { x: number, y: number }[] = [],
                               minPoint: { x: number, y: number } = {x: 0, y: 0},
                               maxPoint: { x: number, y: number } = {x: 100, y: 100}): Chart {

        const data = {
            datasets: [
                {
                    type: 'scatter',
                    data: points,
                    borderColor: getTransparency(CHART_COLORS.blue, 0.5),
                    fill: false,
                },
                {
                    type: 'line',
                    data: points,
                    borderColor: CHART_COLORS.blue,
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
                            to: (value) => {
                                return {x: value.x, y: Math.round(value.y * 10) / 10};
                            }
                        },
                        showTooltip: false, // show the tooltip while dragging [default = true]
                        // dragX: true // also enable dragging along the x-axis.
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
                        enabled: false
                    },
                },

                scales: {
                    x: {
                        display: true,
                        suggestedMin: minPoint.x, suggestedMax: maxPoint.x,
                    },
                    y: {
                        display: true,
                        suggestedMin: minPoint.y, suggestedMax: maxPoint.y,
                    },
                },

                onClick(e) {
                    console.log('onClick ', e);

                    // const canvasPosition = Chart.helpers.getRelativePosition(e, chart);

                    // Substitute the appropriate scale IDs
                    // const dataX = chart.scales.x.getValueForPixel(canvasPosition.x);
                    // const dataY = chart.scales.y.getValueForPixel(canvasPosition.y);
                },

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

        return new Chart(element, config);
    }


    public createSpeedIndicator(element: HTMLCanvasElement, angleDegrees: number, speedMetersPerSec: number): Chart {

        const data = {
            datasets: [
                {
                    type: 'pie',
                    labels: [
                        '' + speedMetersPerSec,
                        ''
                    ],
                    data: [5, 355],
                    backgroundColor: [
                        'rgb(99,255,193)',
                        'rgb(255,255,255)'
                    ],
                    rotation: angleDegrees,
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
                    tooltip: {
                        filter: (a) => {
                            return a.dataIndex === 0;
                        },
                        callbacks: {
                            label: (context) => {
                                return context.dataIndex === 0 ? 'angle (deg):' + angleDegrees + ' speed(m/s):' + speedMetersPerSec : '';
                            }
                        }
                    }
                },
            }
        };

        return new Chart(element, config);
    }

    public createQualityIndicator(element: HTMLCanvasElement, indicator: number): Chart {
        const data = {
            datasets: [
                {
                    type: 'doughnut',
                    labels: [
                        '' + indicator,
                        ''
                    ],
                    data: [indicator, 100 - indicator],
                    backgroundColor: [
                        'rgb(99,255,242)',
                        'rgb(255,255,255)'
                    ],
                    rotation: -90,
                    circumference: 180,
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
                    tooltip: {
                        filter: (a) => {
                            return a.dataIndex === 0;
                        },
                        callbacks: {
                            label: (context) => {
                                return context.dataIndex === 0 ? indicator : '';
                            }
                        }
                    }
                },
            }
        };

        return new Chart(element, config);

    }

}
