import {canvas, LatLng, map, tileLayer} from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {CartesianLayer} from '../layers/CartesianLayer';
import {TimeframeContainers} from '../timeframes/TimeframeContainers';
import {PolarLayer} from '../layers/PolarLayer';
import {MarkersLayer} from '../layers/MarkersLayer';
import {CompositeLayer} from '../layers/CompositeLayer';
import {PolarLayerConfig} from '../layers/PolarLayerConfig';
import {PolarMapValue} from '../tools/PolarMapValue';
import colorLib from '@kurkle/color';
import Chart from 'chart.js/auto';
import chartDragData from 'chartjs-plugin-dragdata';

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
        public center: LatLng | { lat: number, lng: number } | { latitude: number, longitude: number } | any,
        protected addSomeDebugInfos = false,
    ) {
        const lat = this.center.lat || this.center.latitude;
        const lng = this.center.lng || this.center.longitude;
        this.center = new LatLng(lat, lng);
    }

    public createMap(element: HTMLElement,
                     markers: PolarMapValue[] = [],
                     timeframeContainers: TimeframeContainers = null) {

        let markersLayer;
        let compositeLayer;
        const mapLeaflet = map(element, {
            preferCanvas: true, zoomControl: true, zoomAnimation: true, trackResize: false, boxZoom: false,
            renderer: canvas(),
        }).setView([this.center.lat, this.center.lng], 10);

        tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy;<a href="https://www.openstreetmap.org/copyright">osm</a>',
        }).addTo(mapLeaflet);

        //   // https://leaflet-extras.github.io/leaflet-providers/preview/
        //     const OpenTopoMap = tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        //       maxZoom: 17,
        //       attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
        //         '<a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> ' +
        //         '(<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
        //     });
        //     const Stamen_TerrainBackground = tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain-background/{z}/{x}/{y}{r}.{ext}',
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
        //     const Esri_WorldTopoMap = tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile' +
        //       '/{z}/{y}/{x}',
        //       {
        //         attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, ' +
        //           'Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
        //       });
        //     Esri_WorldTopoMap.addTo(this.map);

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
                         topPoint: { x: number, y: number } = {x: 100, y: 100}): Chart {

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
                        dragX: true,
                    },
                    tooltip: {
                        enabled: false,
                        external: (context) => {
                            // Tooltip Element
                            // console.log('tooltip ', context);
                            const tooltipModel = context.tooltip;
                            // Tooltip Element
                            //    let tooltipEl = document.getElementById('chartjs-tooltip');
//
                            //    // Substitute the appropriate scale IDs
                            //    const dataX = chart.scales.x.getValueForPixel(tooltipModel.caretX);
                            //    const dataY = chart.scales.y.getValueForPixel(tooltipModel.caretY);
                            //    const pointAsString = '' + dataX + ' , ' + dataY;
                            //    console.log('pointAsString:', pointAsString);
                            //    const body = '<div>' +
                            //        '<button onclick="removePoint(' + pointAsString + ')">del.</button>' +
                            //        '</div>';
//
                            //    // Create element on first render
                            //    if (!tooltipEl) {
                            //        tooltipEl = document.createElement('div');
                            //        tooltipEl.id = 'chartjs-tooltip';
                            //        // tooltipEl.innerHTML = '<table></table>';
                            //        // tooltipEl.innerHTML = body;
                            //        tooltipEl.style = '-webkit-transition: opacity 1s ease-out;\n' +
                            //            '    -moz-transition: opacity 1s ease-out;\n' +
                            //            '    transition: opacity 1s ease-out;';
                            //        document.body.appendChild(tooltipEl);
                            //    }
//
                            //    // Hide if no tooltip
                            //    if (tooltipModel.opacity === 0) {
                            //        setTimeout(() => {
                            //            tooltipEl.style.opacity = 0;
                            //        }, 5000);
                            //        return;
                            //    }
//
                            //    // Set caret Position
                            //    tooltipEl.classList.remove('above', 'below', 'no-transform');
                            //    if (tooltipModel.yAlign) {
                            //        tooltipEl.classList.add(tooltipModel.yAlign);
                            //    } else {
                            //        tooltipEl.classList.add('no-transform');
                            //    }
//
                            //    tooltipEl.innerHTML = body;
//
                            //    const position = context.chart.canvas.getBoundingClientRect();
                            //    tooltipEl.style.opacity = 1;
                            //    tooltipEl.style.position = 'absolute';
                            //    tooltipEl.style.left = 10 + position.left + window.pageXOffset + tooltipModel.caretX + 'px';
                            //    tooltipEl.style.top = 10 + position.top + window.pageYOffset + tooltipModel.caretY + 'px';
                            //    tooltipEl.style.font = 'arial';
                            //    tooltipEl.style.padding = tooltipModel.padding + 'px ' + tooltipModel.padding + 'px';

                        },
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


}
