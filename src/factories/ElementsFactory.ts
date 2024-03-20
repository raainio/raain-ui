import {canvas, IconOptions, map, Map, Marker, tileLayer} from 'leaflet';
import {CartesianLayer} from '../layers/CartesianLayer';
import {TimeframeContainers} from '../timeframes/TimeframeContainers';
import {PolarLayer} from '../layers/PolarLayer';
import {MarkersLayer} from '../layers/MarkersLayer';
import {CompositeLayer} from '../layers/CompositeLayer';
import {PolarLayerConfig} from '../layers/PolarLayerConfig';
import colorLib from '@kurkle/color';
import Chart from 'chart.js/auto';
import {getRelativePosition} from 'chart.js/helpers';
import chartDragData from 'chartjs-plugin-dragdata';
import {MapLatLng} from '../tools/MapLatLng';
import {Application, Graphics, Text} from 'pixi.js';
import {MapTools} from '../tools/MapTools';
import {TimeframeContainer} from '../timeframes/TimeframeContainer';

const CHART_COLORS = {
    red: 'rgb(255, 99, 132)',
    orange: 'rgb(255, 159, 64)',
    yellow: 'rgb(255, 205, 86)',
    green: 'rgb(75, 192, 192)',
    blue: 'rgb(54, 162, 235)',
    purple: 'rgb(153, 102, 255)',
    grey: 'rgb(163,163,164)',
    dark: 'rgb(68,72,80)',
};

export enum FocusRange {
    CENTURY,
    YEAR,
    MONTH,
    DAY,
    HOUR
}

export class ElementsFactory {

    constructor(
        public center: MapLatLng | { lat: number, lng: number } | { latitude: number, longitude: number } | any = {lat: 0, lng: 0},
        protected addSomeDebugInfos = false,
    ) {
        const lat = typeof this.center.lat !== 'undefined' ? this.center.lat : this.center.latitude;
        const lng = typeof this.center.lng !== 'undefined' ? this.center.lng : this.center.longitude;
        this.center = new MapLatLng(lat, lng);
    }

    static focusLabel(focusDate: Date, focusRange: FocusRange, index: number, min: Date, max: Date, data) {
        return this.focusLabels(focusDate, focusRange, min, max, data)[index];
    }

    protected static getTransparency(value, opacity) {
        const alpha = opacity === undefined ? 0.5 : 1 - opacity;
        return colorLib(value).alpha(alpha).rgbString();
    }

    protected static filterFocus(mapToFilter: Array<{ date: Date, value: number }>, focusDate: Date, focusRange: FocusRange): Array<{
        date: Date,
        value: number
    }> {

        return mapToFilter
            .filter(e => {
                let isIn = true;
                if (isIn && focusRange >= FocusRange.YEAR) {
                    isIn = e.date.getFullYear() === focusDate.getFullYear();
                }
                if (isIn && focusRange >= FocusRange.MONTH) {
                    isIn = e.date.getMonth() === focusDate.getMonth();
                }
                if (isIn && focusRange >= FocusRange.DAY) {
                    isIn = e.date.getDate() === focusDate.getDate();
                }
                if (isIn && focusRange >= FocusRange.HOUR) {
                    isIn = e.date.getHours() === focusDate.getHours();
                }
                return isIn;
            })
            .sort((a, b) => a.date.getTime() - b.date.getTime());
    }

    protected static groupFocus(
        mapToFilter: Array<{ date: Date, value: number }>,
        focusDate: Date,
        focusRange: FocusRange,
        min: Date,
        max: Date) {

        const filteredAndSorted = this.filterFocus(mapToFilter, focusDate, focusRange);

        if (focusRange === FocusRange.CENTURY) {
            const groupedByYear = [];
            for (let i = min.getFullYear(); i <= max.getFullYear(); i++) {
                const yearDate = new Date(focusDate);
                yearDate.setFullYear(i);
                const sum = this.filterFocus(filteredAndSorted, yearDate, FocusRange.YEAR)
                    .reduce((partialSum, a) => partialSum + a.value, 0);
                groupedByYear.push(sum);
            }
            return groupedByYear;
        }

        if (focusRange === FocusRange.YEAR) {
            const groupedByMonth = [];
            for (let i = 0; i < 12; i++) {
                const monthDate = new Date(focusDate);
                monthDate.setMonth(i);
                const sum = this.filterFocus(filteredAndSorted, monthDate, FocusRange.MONTH)
                    .reduce((partialSum, a) => partialSum + a.value, 0);
                groupedByMonth.push(sum);
            }
            return groupedByMonth;
        }

        if (focusRange === FocusRange.MONTH) {
            const groupedByDay = [];
            const daysInMonth = new Date(focusDate.getFullYear(), focusDate.getMonth(), 0).getDate();
            for (let i = 0; i < daysInMonth; i++) {
                const dayDate = new Date(focusDate);
                dayDate.setDate(i);
                const sum = this.filterFocus(filteredAndSorted, dayDate, FocusRange.DAY)
                    .reduce((partialSum, a) => partialSum + a.value, 0);
                groupedByDay.push(sum);
            }
            return groupedByDay;
        }

        if (focusRange === FocusRange.DAY) {
            const groupedByHour = [];
            for (let i = 0; i < 24; i++) {
                const hourDate = new Date(focusDate);
                hourDate.setHours(i);
                const sum = this.filterFocus(filteredAndSorted, hourDate, FocusRange.HOUR)
                    .reduce((partialSum, a) => partialSum + a.value, 0);
                groupedByHour.push(sum);
            }
            return groupedByHour;
        }

        // if (focusRange === FocusRange.HOUR) {
        return filteredAndSorted.map(e => e.value);
    }

    protected static focusLabels(focusDate: Date, focusRange: FocusRange, min: Date, max: Date, data: {
        label: string,
        style: string,
        values: { date: Date, value: number }[],
    }[]) {
        if (focusRange === FocusRange.CENTURY) {
            const groupedByYear = [];
            for (let i = min.getFullYear(); i <= max.getFullYear(); i++) {
                const yearDate = new Date(focusDate);
                yearDate.setFullYear(i);
                groupedByYear.push(yearDate.toLocaleString('sv', {timeZoneName: 'short'}).substring(0, 4));
            }
            return groupedByYear;
        }

        if (focusRange === FocusRange.YEAR) {
            const groupedByMonth = [];
            for (let i = 0; i < 12; i++) {
                const monthDate = new Date(focusDate);
                monthDate.setMonth(i);
                groupedByMonth.push(monthDate.toLocaleString('sv', {timeZoneName: 'short'}).substring(0, 7));
            }
            return groupedByMonth;
        }

        if (focusRange === FocusRange.MONTH) {
            const groupedByDay = [];
            const daysInMonth = new Date(focusDate.getFullYear(), focusDate.getMonth(), 0).getDate();
            for (let i = 0; i < daysInMonth; i++) {
                const dayDate = new Date(focusDate);
                dayDate.setDate(i);
                groupedByDay.push(dayDate.toLocaleString('sv', {timeZoneName: 'short'}).substring(0, 10));
            }
            return groupedByDay;
        }

        if (focusRange === FocusRange.DAY) {
            const groupedByHour = [];
            for (let i = 0; i < 24; i++) {
                const hourDate = new Date(focusDate);
                hourDate.setHours(i);
                groupedByHour.push(hourDate.toLocaleString('sv', {timeZoneName: 'short'}).substring(0, 13));
            }
            return groupedByHour;
        }

        // all dates that are in the current hour
        let allDates = [];
        data.forEach(d => {
            allDates = allDates.concat(d.values);
        });
        const filteredHourDates = this.filterFocus(allDates, focusDate, FocusRange.HOUR);
        const filteredHourDatesISO = filteredHourDates.map(v => v.date.toLocaleString('sv', {timeZoneName: 'short'}));
        return filteredHourDatesISO.filter((item, pos, self) => {
            return self.indexOf(item) === pos;
        });
    }

    protected static getFocusDateAndTitle(oldFocusDate: Date, focusRange: FocusRange, index: number, min: Date, max: Date) {

        const newFocusDate = new Date(oldFocusDate);
        let newTitle = '....';

        if (focusRange === FocusRange.CENTURY) {
            newFocusDate.setFullYear(min.getFullYear() + index);
            newTitle = newFocusDate.toLocaleString('sv', {timeZoneName: 'short'}).substring(0, 4);
        } else if (focusRange === FocusRange.YEAR) {
            newFocusDate.setMonth(index);
            newTitle = newFocusDate.toLocaleString('sv', {timeZoneName: 'short'}).substring(0, 7);
        } else if (focusRange === FocusRange.MONTH) {
            newFocusDate.setDate(index);
            newTitle = newFocusDate.toLocaleString('sv', {timeZoneName: 'short'}).substring(0, 10);
        } else if (focusRange === FocusRange.DAY) {
            newFocusDate.setHours(index);
            newTitle = newFocusDate.toLocaleString('sv', {timeZoneName: 'short'}).substring(0, 13);
        } else if (focusRange === FocusRange.HOUR) {
            newTitle = newFocusDate.toLocaleString('sv', {timeZoneName: 'short'});
        }

        return {newFocusDate, newTitle};
    }

    public createMap(element: HTMLElement, inputs?: {
        timeframeContainers?: TimeframeContainers,
        markers?: {
            iconsLatLng: MapLatLng[],
            iconsOptions?: IconOptions
        }[]
    }): {
        mapLeaflet: Map,
        markersLayer?: MarkersLayer,
        compositeLayer?: CompositeLayer,
        markersProduced?: Marker[]
    } {

        // Map default
        let mapLeaflet: Map;
        let markersLayer: MarkersLayer;
        const compositeLayer = new CompositeLayer();

        mapLeaflet = map(element, {
            preferCanvas: true,
            zoomControl: true,
            zoomAnimation: true,
            trackResize: false,
            boxZoom: false,
            scrollWheelZoom: false,
            renderer: canvas(),
        }).setView([this.center.lat, this.center.lng], 10);

        tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy;<a href="https://www.openstreetmap.org/copyright">osm</a>',
        }).addTo(mapLeaflet);

        // Composite timeframes
        const width = element.offsetWidth;
        const height = element.offsetHeight;
        compositeLayer.setCurrentWidth(width);
        compositeLayer.setCurrentHeight(height);

        let firstLayerIdPushed: string;
        if (inputs?.timeframeContainers?.containers.length) {
            for (const timeFrameContainer of inputs.timeframeContainers.containers) {

                const layerId = this.addCompositeLayer(mapLeaflet, timeFrameContainer, compositeLayer);
                if (!firstLayerIdPushed) {
                    firstLayerIdPushed = layerId;
                }
            }
        }

        compositeLayer.addToMap(mapLeaflet);
        if (firstLayerIdPushed) {
            compositeLayer.showTheFistMatchingId(firstLayerIdPushed);
        }

        // Markers
        let markersProduced = [];
        markersLayer = new MarkersLayer();
        markersLayer.setCurrentWidth(width);
        markersLayer.setCurrentHeight(height);
        markersProduced = markersLayer.render(inputs.markers).markers;
        markersLayer.addToMap(mapLeaflet);

        mapLeaflet.invalidateSize({animate: true});

        return {mapLeaflet, markersLayer, compositeLayer, markersProduced};
    }

    public updateMapTimeframe(
        mapLeaflet: Map,
        compositeLayer: CompositeLayer,
        timeframeContainers: TimeframeContainers): void {

        if (!compositeLayer || !timeframeContainers?.containers.length) {
            return;
        }

        compositeLayer.removeAllLayers();

        let firstLayerIdPushed: string;
        for (const timeFrameContainer of timeframeContainers.containers) {
            const layerId = this.addCompositeLayer(mapLeaflet, timeFrameContainer, compositeLayer);

            if (!firstLayerIdPushed) {
                firstLayerIdPushed = layerId;
            }

        }
        compositeLayer.showTheFistMatchingId(firstLayerIdPushed);

        compositeLayer.redraw();
        mapLeaflet.invalidateSize({animate: true});
    }

    public createCompare(element: HTMLCanvasElement,
                         points: { x: number, y: number, r: number, name: string }[] = [],
                         topPoint: { x: number, y: number } = {
                             x: 100,
                             y: 100
                         },
                         clickCallback?: any): Chart<any> {


        const bijectivePoints = [{x: 0, y: 0}, {x: topPoint.x, y: topPoint.y}];
        const data = {
            datasets: [
                {
                    type: 'bubble',
                    data: points,
                    borderColor: CHART_COLORS.dark,
                    backgroundColor: ElementsFactory.getTransparency(CHART_COLORS.grey, 0.2),
                    pointStyle: 'circle',
                    pointHoverRadius: 15,
                },
                {
                    type: 'line',
                    data: bijectivePoints,
                    borderColor: CHART_COLORS.red,
                    backgroundColor: ElementsFactory.getTransparency(CHART_COLORS.red, 0.9),
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
                            label: (context) => {
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

                onClick(e) {
                    const eChart = e.chart;
                    const canvasPosition = getRelativePosition(e, eChart);
                    const posX = chart.scales.x.getValueForPixel(canvasPosition.x);
                    const posY = chart.scales.y.getValueForPixel(canvasPosition.y);
                    if (data.selectedPoint && clickCallback) {
                        clickCallback(data.selectedPoint);
                    }
                },
            },
        };

        const chart = new Chart(element, config);
        return chart;
    }

    public createConfiguration(element: HTMLCanvasElement,
                               points: { x: number, y: number }[] = [],
                               minPoint: { x: number, y: number } = {x: 0, y: 0},
                               maxPoint: { x: number, y: number } = {x: 100, y: 100},
                               dragCallback?: any): Chart {

        const data = {
            datasets: [
                {
                    type: 'scatter',
                    data: points,
                    borderColor: ElementsFactory.getTransparency(CHART_COLORS.blue, 0.5),
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
                        dragX: true, // also enable dragging along the x-axis.
                        onDrag: (e, datasetIndex, index, value) => {
                            const done = dragCallback ? dragCallback(e) : null;
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
                        // type: 'logarithmic',
                    },
                },

                onClick(e) {
                    // console.log('onClick ', e);
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

    public createDateStatus(element: HTMLCanvasElement,
                            setOfData: {
                                label: string,
                                style: string,
                                values: { date: Date, value: number }[],
                            }[] = [],
                            focusDate: Date,
                            focusRange: FocusRange = FocusRange.CENTURY): Chart {

        if (setOfData.length > 7) {
            return null;
        }

        const datasets = [];
        const colors = [
            ElementsFactory.getTransparency(CHART_COLORS.blue, 0.5),
            ElementsFactory.getTransparency(CHART_COLORS.red, 0.5),
            ElementsFactory.getTransparency(CHART_COLORS.green, 0.5),
            ElementsFactory.getTransparency(CHART_COLORS.grey, 0.5),
            ElementsFactory.getTransparency(CHART_COLORS.orange, 0.5),
            ElementsFactory.getTransparency(CHART_COLORS.purple, 0.5),
            ElementsFactory.getTransparency(CHART_COLORS.yellow, 0.5),
        ];
        const originalDataPoints = [];
        let min, max;
        setOfData.forEach(s => {
            s.values.forEach(v => {
                min = min ? Math.min(min, v.date.getTime()) : v.date.getTime();
                max = max ? Math.max(max, v.date.getTime()) : v.date.getTime();
            });
        });
        min = new Date(min);
        max = new Date(max);

        for (const [index, dataContainer] of setOfData.entries()) {
            const borderColor = colors[index];
            const dataPoints = ElementsFactory.groupFocus(dataContainer.values, focusDate, focusRange, min, max);
            datasets.push(
                {
                    label: dataContainer.label,
                    type: dataContainer.style,
                    data: dataPoints,
                    borderColor,
                    backgroundColor: borderColor,
                });
            originalDataPoints.push(dataPoints);
        }

        const data = {
            datasets,
            labels: ElementsFactory.focusLabels(focusDate, focusRange, min, max, setOfData)
        };

        const config: any = {
            data,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        // display: false,
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                //  if (context.dataset.type === 'bubble') {
                                //      return new Date(context.parsed.x).toISOString() + ': '
                                //          + context.parsed.y + ' , ' + context.parsed._custom;
                                //  }
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: ' '
                    }
                },
                // scales: {
                //    x: {
                //        ticks: {
                //            callback: labelCallBack,
                //        }
                //    }
                // },
                onClick: (e) => {
                    const eChart = e.chart;
                    const eFocusRange = eChart['focusRange'];
                    // if (eFocusRange >= FocusRange.DAY) {
                    //     return;
                    // }

                    const canvasPosition = getRelativePosition(e, eChart);
                    const pos = chart.scales.x.getValueForPixel(canvasPosition.x);

                    const {
                        newFocusDate,
                        newTitle
                    } = ElementsFactory.getFocusDateAndTitle(eChart['focusDate'], eFocusRange, pos, eChart['focusDateMin'], eChart['focusDateMax']);

                    eChart['focusPos'] = pos;
                    eChart['focusRange'] = eFocusRange + 1;
                    eChart['focusDate'] = new Date(newFocusDate);
                    eChart.config['_config'].options.plugins.title.text = '' + newTitle;

                    eChart.data.datasets.forEach((dataset, index) => {
                        const newFocusData = ElementsFactory.groupFocus(setOfData[index].values, eChart['focusDate'], eChart['focusRange'],
                            eChart['focusDateMin'], eChart['focusDateMax']);
                        dataset.data = newFocusData;
                    });
                    eChart.data.labels = ElementsFactory.focusLabels(eChart['focusDate'], eChart['focusRange'],
                        eChart['focusDateMin'], eChart['focusDateMax'], setOfData);

                    // console.log('update...');
                    eChart.update();
                }
            },
        };

        const chart = new Chart(element, config);
        chart['focusDate'] = focusDate;
        chart['focusRange'] = focusRange;
        chart['focusDateMin'] = min;
        chart['focusDateMax'] = max;
        chart['focusReset'] = () => {
            chart.config['_config'].options.plugins.title.text = '...';
            chart['focusDate'] = focusDate;
            chart['focusRange'] = FocusRange.CENTURY;
            chart.data.datasets.forEach((dataset, index) => {
                dataset.data = originalDataPoints[index];
            });
            chart.data.labels = ElementsFactory.focusLabels(chart['focusDate'], chart['focusRange'],
                chart['focusDateMin'], chart['focusDateMax'], setOfData);
            chart.update();
        };
        chart['focusPrevious'] = () => {

            const eFocusRange = chart['focusRange'] - 1;
            let eFocusPos = chart['focusPos'] ? chart['focusPos'] : 0;
            eFocusPos = eFocusPos - 1;

            const {
                newFocusDate,
                newTitle
            } = ElementsFactory.getFocusDateAndTitle(chart['focusDate'], eFocusRange, eFocusPos,
                chart['focusDateMin'], chart['focusDateMax']);

            chart['focusPos'] = eFocusPos;
            chart['focusDate'] = new Date(newFocusDate);
            chart.config['_config'].options.plugins.title.text = '' + newTitle;

            chart.data.datasets.forEach((dataset, index) => {
                const newFocusData = ElementsFactory.groupFocus(setOfData[index].values, chart['focusDate'], chart['focusRange'],
                    chart['focusDateMin'], chart['focusDateMax']);
                dataset.data = newFocusData;
            });
            chart.data.labels = ElementsFactory.focusLabels(chart['focusDate'], chart['focusRange'],
                chart['focusDateMin'], chart['focusDateMax'], setOfData);

            chart.update();
        };
        chart['focusNext'] = () => {

            const eFocusRange = chart['focusRange'] - 1;
            let eFocusPos = chart['focusPos'] ? chart['focusPos'] : 0;
            eFocusPos = eFocusPos + 1;

            const {
                newFocusDate,
                newTitle
            } = ElementsFactory.getFocusDateAndTitle(chart['focusDate'], eFocusRange, eFocusPos,
                chart['focusDateMin'], chart['focusDateMax']);

            chart['focusPos'] = eFocusPos;
            chart['focusDate'] = new Date(newFocusDate);
            chart.config['_config'].options.plugins.title.text = '' + newTitle;

            chart.data.datasets.forEach((dataset, index) => {
                const newFocusData = ElementsFactory.groupFocus(setOfData[index].values, chart['focusDate'], chart['focusRange'],
                    chart['focusDateMin'], chart['focusDateMax']);
                dataset.data = newFocusData;
            });
            chart.data.labels = ElementsFactory.focusLabels(chart['focusDate'], chart['focusRange'],
                chart['focusDateMin'], chart['focusDateMax'], setOfData);

            chart.update();
        };
        return chart;
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

    public createSpeedMatrixIndicator(element: HTMLCanvasElement,
                                      positionValuesMatrix: { x: number, y: number, value: number }[],
                                      trustIndicator: number = 1): void {

        const wh = 10;
        let minX, maxX, minY, maxY, minValue, maxValue;
        for (const value of positionValuesMatrix
            ) {
            if (!minX || minX !== Math.min(value.x, minX)) {
                minX = value.x;
            }
            if (!maxX || maxX !== Math.max(value.x, maxX)) {
                maxX = value.x;
            }
            if (!minY || minY !== Math.min(value.x, minY)) {
                minY = value.y;
            }
            if (!maxY || maxY !== Math.max(value.x, maxY)) {
                maxY = value.y;
            }
            if (!minValue || minValue !== Math.min(value.value, minValue)) {
                minValue = value.value;
            }
            if (!maxValue || maxValue !== Math.max(value.value, maxValue)) {
                maxValue = value.value;
            }
        }
        const width = maxX - minX + 1;
        const height = maxY - minY + 1;
        const range = maxValue - minValue;

        const app = new Application({
            width: width * wh,
            height: height * wh,
            view: element,
            // antialias: true,
            backgroundColor: MapTools.hexStringToNumber('#FFFFFF')
        });
        app.stage.removeChildren();

        const translateX = x => {
            const v = (x - minX) * wh;
            return v;
        };
        const translateY = y => {
            const v = (maxY - minY - (y - minY)) * wh;
            return v;
        };
        const translateColor = value => {
            const valueOpt = maxValue ? value / maxValue : 0;
            if (valueOpt >= 1) {
                return '#01d331';
            } else if (valueOpt >= 0.85) {
                return '#1bc041';
            } else if (valueOpt >= 0.7) {
                return '#30a64b';
            } else if (valueOpt >= 0.55) {
                return '#3f884f';
            } else if (valueOpt >= 0.4) {
                return '#487953';
            } else if (valueOpt >= 0.25) {
                return '#4b6751';
            } else if (valueOpt >= 0.1) {
                return '#48544a';
            }
            return '#484848';
        };

        const pixiGraphic = new Graphics();
        pixiGraphic.lineStyle(0); // 2, hexStringToNumber('#FEEB77'), 1);
        for (const value of positionValuesMatrix) {
            pixiGraphic.beginFill(MapTools.hexStringToNumber(translateColor(value.value)));
            pixiGraphic.drawRect(translateX(value.x), translateY(value.y), wh, wh);
            pixiGraphic.endFill();
        }

        let message = ' ';
        if (trustIndicator < 0.5) {
            message = 'No trust in ' + trustIndicator;
        }

        const pixiText = new Text(message, {
            fontFamily: 'Arial',
            fontSize: 20,
            fill: 0xff1010,
            align: 'center',
        });
        pixiGraphic.addChild(pixiText);

        app.stage.addChild(pixiGraphic);
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

    private addCompositeLayer(mapLeaflet: Map, timeFrameContainer: TimeframeContainer, compositeLayer: CompositeLayer): string {
        timeFrameContainer.setCompositeLayer(compositeLayer);
        for (const frameContainer of timeFrameContainer.timeframe) {
            const layerId = timeFrameContainer.getFrameId(frameContainer);
            const values: any = frameContainer.values;

            let layer;
            if (frameContainer.isPolar) {
                layer = new PolarLayer(layerId, timeFrameContainer.name, mapLeaflet, this.addSomeDebugInfos);
                layer.setPolarValues(this.center, values, new PolarLayerConfig(), timeFrameContainer.version);
            } else if (frameContainer.isCartesian) {
                layer = new CartesianLayer(layerId, timeFrameContainer.name, mapLeaflet, this.addSomeDebugInfos);
                layer.setCartesianGridValues(this.center, values, timeFrameContainer.version);
            }
            compositeLayer.addLayer(layer);
            return layerId;
        }
    }

}
