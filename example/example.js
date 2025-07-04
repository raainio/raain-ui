import 'leaflet/dist/leaflet.css';
import {
    CartesianMapValue,
    ChartScaleColors,
    CompareElementInput,
    ConfigurationElementInput,
    DateStatusElementInput,
    DynamicDateStatusElementInput,
    ElementsFactory,
    FrameContainer,
    IconMapValue,
    MapElementInput,
    MapLatLng,
    MonitoringBarsElementInput,
    MonitoringLinesElementInput,
    PolarMapValue,
    ScaleElementInput,
    SpeedMatrixElementInput,
    TimeframeContainer,
    TimeframeContainers,
    Tools,
} from 'raain-ui';
import {DateRange} from '../src';

// 1) HTML Elements
const mapHtmlElement = document.getElementById('map');
const compareHtmlElement = document.getElementById('compare');
const dateFocusHtmlElement = document.getElementById('dateFocus');
const speedHtmlTitle = document.getElementById('speedTitle');
const speedMatrixHtmlElement = document.getElementById('speedMatrix');
const configurationHtmlElement = document.getElementById('configuration');
const perfBarHtmlElement = document.getElementById('perfBar');
const perfLineHtmlElement = document.getElementById('perfLine');
const scaleHtmlElement = document.getElementById('scale');
const earthMapHtmlElement = document.getElementById('earthMap');
const dynamicDateHtmlElement = document.getElementById('dynamicDate');

// 2) Values
const center = {latitude: 51.505, longitude: -0.09};
const now = new Date();

const addMinutes = (date, minutes) => {
    return new Date(date.getTime() + minutes * 60000);
};

const isOdd = (num) => {
    return num % 2;
};

const createPolarMapValues = (scenario) => {
    const values = [];
    const kms = 70;
    for (let azimuth = 0; azimuth < 360; azimuth += 10) {
        for (let distance = 0; distance < 1000 * kms; distance += 1000) {
            const distanceIsOdd = isOdd(distance / 1000);
            let value = distanceIsOdd ? azimuth : 0;
            if (scenario === 1) {
                value = distanceIsOdd ? (azimuth * distance) / (1000 * kms) : 0;
            }

            if (20 === azimuth && 30000 <= distance && distance <= 40000) {
                value = (2 * (distance + 1)) / distance;
            }

            const pmv = new PolarMapValue(value, azimuth, distance);
            pmv.setCenter(center);
            values.push(pmv);
        }
    }
    return values;
};

const createCartesianMapValues = (scenario) => {
    const values = [];
    for (let latitude = center.latitude - 1; latitude < center.latitude + 1; latitude += 0.01) {
        for (
            let longitude = center.longitude - 1;
            longitude < center.longitude + 1;
            longitude += 0.01
        ) {
            const value = 40 * Math.random();
            const mapValue = new CartesianMapValue(
                value,
                latitude,
                longitude,
                latitude + 0.1,
                longitude + 0.1
            );
            values.push(mapValue);
        }
    }
    return values;
};

const createIconValues = (scenario) => {
    const values = [];
    for (
        let latitude = center.latitude - 1;
        latitude < center.latitude + 1;
        latitude += 0.1 * scenario
    ) {
        for (
            let longitude = center.longitude - 1;
            longitude < center.longitude + 1;
            longitude += 0.1 * scenario
        ) {
            const speed = 8 * Math.random();
            const angle = 360 * Math.random();
            const mapValue = new IconMapValue(
                latitude,
                longitude,
                speed,
                angle,
                'id' + Math.random(),
                'name?'
            );
            values.push(mapValue);
        }
    }
    return values;
};

const markers1 = [
    new MapLatLng(center.latitude, center.longitude, 0, 'centerId', 'center'),
    new MapLatLng(center.latitude + 0.1, center.longitude - 0.1, 0, '2', 'near center'),
];
const markers2 = [
    new MapLatLng(center.latitude + 0.3, center.longitude + 0.1, 0, 'centerId2', 'center2'),
    new MapLatLng(center.latitude + 0.4, center.longitude + 0.1, 0, '2', 'near center2'),
];

const allCartesianValues = new TimeframeContainer(
    'allCartesianValuesZoomSensitive',
    [
        new FrameContainer(now, createCartesianMapValues(0), false, true),
        new FrameContainer(addMinutes(now, 10), createCartesianMapValues(1), false, true),
    ],
    'cartExample'
);

const allIconValues = new TimeframeContainer(
    'allIcons',
    [
        new FrameContainer(now, createIconValues(1), false, false, true),
        new FrameContainer(addMinutes(now, 10), createIconValues(2), false, false, true),
    ],
    'iconsExample'
);

const timeframeContainers = new TimeframeContainers([
    new TimeframeContainer(
        'polar_with_Rain0_',
        [new FrameContainer(now, createPolarMapValues(0), true, false)],
        'polarExample1'
    ),
    new TimeframeContainer(
        'polar_with_Radar0_',
        [new FrameContainer(addMinutes(now, 10), createPolarMapValues(0), true, false)],
        'polarExample2'
    ),
    new TimeframeContainer(
        'polar_Rain1_',
        [new FrameContainer(addMinutes(now, 20), createPolarMapValues(1), true, false)],
        'polarExample3'
    ),
    new TimeframeContainer('polar_without_optimization_', [
        new FrameContainer(addMinutes(now, 30), createPolarMapValues(1), true, false),
    ]),
    allCartesianValues,
    allIconValues,
]);

const comparePoints = [
    {x: 1, y: 2, r: 3},
    {x: 10, y: 25, r: 5, name: 'one'},
    {x: 9, y: 25, r: 9, name: 'two'},
    {x: 55, y: 22, r: 10, name: 'three'},
    {x: 46, y: 32, r: 5},
];
const configurationPoints = [
    {x: 0, y: -1},
    {x: 10, y: 0.5},
    {x: 65, y: 2},
];
const dateStatusPoints1 = [
    {date: new Date('2022-05-01 13:05'), value: 2},
    {date: new Date('2025-05-01 13:05'), value: 2},
    {date: new Date('2025-06-01 13:05'), value: 2},
    {date: new Date('2025-06-02'), value: 1},
    {date: new Date('2025-06-02 13:12'), value: 3},
];
const dateStatusPoints2 = [
    {date: new Date('2025-05-12 11:05'), value: 5},
    {date: new Date('2025-04-02 13:15'), value: 8},
    {date: new Date('2025-06-02 13:15'), value: 8},
    {date: new Date('2025-06-02 14:19'), value: 8},
    {date: new Date('2025-06-12 13:22'), value: 3},
    {date: new Date('2026-06-12 13:22'), value: 3},
];
const setOfDates = [
    {label: 'data 1', style: 'bar', values: dateStatusPoints1},
    {label: 'data 2', style: 'bar', values: dateStatusPoints2},
    {label: 'data 2 with lines', style: 'line', values: dateStatusPoints2},
];

let positionValuesMatrix = [
    [
        {x: -1, y: -2, value: 0},
        {x: -1, y: -1, value: 0},
        {x: 0, y: -2, value: 0},
        {x: 0, y: -1, value: 0},
    ],
    [
        {x: -1, y: -2, value: 1},
        {x: -1, y: -1, value: 2},
        {x: 0, y: -2, value: 3},
        {x: 0, y: -1, value: 4},
    ],
    [
        {x: -1, y: -2, value: 2},
        {x: -1, y: -1, value: 6},
        {x: 0, y: -2, value: 4},
        {x: 0, y: -1, value: 8},
    ],
    [
        {x: -1, y: -2, value: 0.2},
        {x: -1, y: -1, value: 3},
        {x: 0, y: -2, value: 7},
        {x: 0, y: -1, value: 5},
    ],
    [
        {x: -1, y: -2, value: 3},
        {x: -1, y: -1, value: 2},
        {x: 0, y: -2, value: 1},
        {x: 0, y: -1, value: 0},
    ],
];

let perfBarsPoints = [
    {label: '#1', percentage: 23},
    {label: '#2', percentage: 56},
    {label: '#3', percentage: 0},
];
let perfLinesPoints = [
    {label: '#1', points: [{date: addMinutes(now, -10), percentage: 23}]},
    {label: '#2', points: [{date: addMinutes(now, -5), percentage: 45}]},
    {label: '#3', points: [{date: addMinutes(now), percentage: 12}]},
];

const entries = Object.entries(ChartScaleColors);
entries.sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]));
const sortedMap = new Map(entries);
const sortedArray = [...sortedMap.entries()];
const scaleColors = sortedArray.map((entry) => {
    return {color: entry[1]};
});
const scaleLabels = sortedArray.map((entry) => entry[0]);

// 3) Configurations
const iconsOptions = {
    iconUrl: './my-marker-icon.png',
    shadowUrl: './my-marker-shadow.png',
};

// 4) Factory
const factory = new ElementsFactory(center, true);
const mapElement = factory.createMap(
    mapHtmlElement,
    new MapElementInput(timeframeContainers, [
        {iconsLatLng: markers1, iconsOptions},
        {iconsLatLng: markers2},
    ])
);
const compareElement = factory.createCompare(
    compareHtmlElement,
    new CompareElementInput(comparePoints, {x: 80, y: 80}, console.log)
);
const dateStatusElement = factory.createDateStatus(
    dateFocusHtmlElement,
    new DateStatusElementInput(setOfDates, new Date(), DateRange.YEAR, -10, 110)
);

// Add Dynamic Date Status
const dynamicDateElement = factory.createDynamicDateStatus(
    dynamicDateHtmlElement,
    new DynamicDateStatusElementInput(
        async (focusDate, focusRange) => {
            console.log('focusDate', focusDate, 'focusRange', focusRange);
            return new Promise((resolve) => {
                setTimeout(() => {
                    // Return different data based on the focus range
                    const baseData = [];

                    if (focusRange === DateRange.CENTURY) {
                        baseData.push({
                            date: new Date('2020-01-01'),
                            value: 10,
                        });
                        baseData.push({
                            date: new Date('2025-02-01'),
                            value: 120,
                        });
                        baseData.push({
                            date: new Date('2025-03-01'),
                            value: 30,
                        });
                        baseData.push({
                            date: new Date('2026-03-01'),
                            value: 23,
                        });
                    }
                    if (focusRange === DateRange.YEAR) {
                        baseData.push({
                            date: new Date('2025-02-01'),
                            value: 110,
                        });
                        baseData.push({
                            date: new Date('2025-03-01'),
                            value: -1,
                        });
                    }
                    if (focusRange >= DateRange.MONTH) {
                        const monthDate = new Date('2025-03-15');
                        monthDate.setUTCHours(9, 0, 0, 0);
                        baseData.push({
                            date: monthDate,
                            value: 35,
                        });
                    }
                    if (focusRange >= DateRange.DAY) {
                        const dayDate = new Date('2025-03-15');
                        dayDate.setUTCHours(8, 10, 0, 0);
                        baseData.push({
                            date: dayDate,
                            value: 12,
                        });
                    }
                    if (focusRange >= DateRange.HOUR) {
                        const hourDate = new Date('2025-03-15');
                        hourDate.setUTCHours(8, 15, 0, 0);
                        baseData.push({
                            date: hourDate,
                            value: 24,
                        });
                    }

                    resolve([
                        {
                            label: 'Dynamic Data1',
                            style: 'bar',
                            values: baseData,
                        },
                        {
                            label: 'Dynamic Data2',
                            style: 'line',
                            values: baseData,
                        },
                    ]);
                }, 500); // Simulate network delay
            });
        },
        {
            dataLength: 2,
            chartMinValue: -10,
            chartMaxValue: 100,
        }
    )
);
const confTransparency = 0.3;
const configurationElement = factory.createConfiguration(
    configurationHtmlElement,
    new ConfigurationElementInput(configurationPoints, {x: 0, y: -1}, {x: 100, y: 3}, true, [
        {
            color: Tools.getTransparency(ChartScaleColors['0'], confTransparency),
            yStart: Math.log10(0.1),
            yEnd: Math.log10(0.4),
        },
        {
            color: Tools.getTransparency(ChartScaleColors['0.4'], confTransparency),
            yStart: Math.log10(0.4),
            yEnd: Math.log10(1),
        },
        {
            color: Tools.getTransparency(ChartScaleColors['1'], confTransparency),
            yStart: Math.log10(1),
            yEnd: Math.log10(3),
        },
        {
            color: Tools.getTransparency(ChartScaleColors['3'], confTransparency),
            yStart: Math.log10(3),
            yEnd: Math.log10(10),
        },
        {
            color: Tools.getTransparency(ChartScaleColors['10'], confTransparency),
            yStart: Math.log10(10),
            yEnd: Math.log10(20),
        },
        {
            color: Tools.getTransparency(ChartScaleColors['20'], confTransparency),
            yStart: Math.log10(20),
            yEnd: Math.log10(30),
        },
        {
            color: Tools.getTransparency(ChartScaleColors['30'], confTransparency),
            yStart: Math.log10(30),
            yEnd: Math.log10(50),
        },
        {
            color: Tools.getTransparency(ChartScaleColors['50'], confTransparency),
            yStart: Math.log10(50),
            yEnd: Math.log10(100),
        },
        {
            color: Tools.getTransparency(ChartScaleColors['100'], confTransparency),
            yStart: Math.log10(100),
            yEnd: Math.log10(150),
        },
        {
            color: Tools.getTransparency(ChartScaleColors['150'], confTransparency),
            yStart: Math.log10(150),
            yEnd: Math.log10(200),
        },
        {
            color: Tools.getTransparency(ChartScaleColors['200'], confTransparency),
            yStart: Math.log10(200),
            yEnd: Math.log10(250),
        },
        {
            color: Tools.getTransparency(ChartScaleColors['250'], confTransparency),
            yStart: Math.log10(250),
            yEnd: Math.log10(300),
        },
        {
            color: Tools.getTransparency(ChartScaleColors['300'], confTransparency),
            yStart: Math.log10(300),
            yEnd: Math.log10(500),
        },
    ])
);
const perfBarElement = factory.createMonitoringBars(
    perfBarHtmlElement,
    new MonitoringBarsElementInput(perfBarsPoints)
);
const perfLineElement = factory.createMonitoringLines(
    perfLineHtmlElement,
    new MonitoringLinesElementInput(perfLinesPoints, 10)
);
const scaleElement = factory.createScale(
    scaleHtmlElement,
    new ScaleElementInput(scaleColors, scaleLabels, 'mm/h')
);

// Add Earth Map
// You need to get your own access token from https://cesium.com/ion/tokens
const cesiumAccessToken = '....'; // Default token for testing only
// const earthMapElement = factory.createEarthMap(earthMapHtmlElement, new EarthMapElementInput(cesiumAccessToken));

// 5) animations (switching timeframes, moving perf data...)
let matrixIndex = 0;
const animationTimeInMs = 5000;
let animationEnabled = false;
const toggleAnimation = () => {
    animationEnabled = !animationEnabled;
    if (animationEnabled) {
        switchTimeFramePolarRain0();
    }
};
const switchTimeFramePolarRain0 = () => {
    // timeframeContainers.showTimeframes('polar_with_Rain0_', now, 1);
    mapElement.compositeLayer.showTheFistMatchingId('polar_with_Rain0_', 0.2);
    mapElement.mapLeaflet.eachLayer((layer) => {
        if (layer._container?.style) {
            layer._container.style.filter = 'brightness(30%)';
        }
    });

    if (animationEnabled) {
        setTimeout(switchTimeFrameCartesian0, animationTimeInMs);
    }
};
const switchTimeFramePolarRadar0 = () => {
    mapElement.compositeLayer.showTheFistMatchingId('polar_with_Radar0_');
    if (animationEnabled) {
        setTimeout(switchTimeFramePolarRain1, animationTimeInMs);
    }
};
const switchTimeFramePolarRain1 = () => {
    mapElement.compositeLayer.showTheFistMatchingId('polar_Rain1_');
    if (animationEnabled) {
        setTimeout(switchTimeFramePolarWithoutOptimization, animationTimeInMs);
    }
};
const switchTimeFramePolarWithoutOptimization = () => {
    mapElement.compositeLayer.showTheFistMatchingId('polar_without_optimization_', 0.5);
    mapElement.mapLeaflet.eachLayer((layer) => {
        if (layer._container?.style) {
            layer._container.style.filter = 'brightness(90%)';
        }
    });

    if (animationEnabled) {
        setTimeout(switchTimeFrameCartesian0, animationTimeInMs);
    }
};
const switchTimeFrameCartesian0 = () => {
    allCartesianValues.showTimeframes(now, 0.2);
    if (animationEnabled) {
        setTimeout(switchTimeFrameIcons, animationTimeInMs);
    }
};
const switchTimeFrameIcons = () => {
    mapElement.compositeLayer.show('Icon');
    if (animationEnabled) {
        setTimeout(switchTimeFramePolarRadar0, animationTimeInMs);
    }
};

const switchMatrix = () => {
    speedMatrixHtmlElement.innerHTML = '';
    if (positionValuesMatrix.length === matrixIndex) {
        matrixIndex = 0;
    }
    speedHtmlTitle.innerHTML = '<p>matrixIndex:' + matrixIndex + '</p>';

    factory.createSpeedMatrixIndicator(
        speedMatrixHtmlElement,
        new SpeedMatrixElementInput(positionValuesMatrix[matrixIndex], Math.random())
    );
    matrixIndex++;
    setTimeout(switchMatrix, animationTimeInMs);
};

const animatePerf = () => {
    const p1 = Math.random() * 100;
    const p2 = Math.random() * 100;
    const p3 = Math.random() * 100;
    perfBarElement.add([{percentage: p1}, {percentage: p2}, {percentage: p3}]);
    const state = perfLineElement.add([
        {label: '#1', percentage: p1},
        {label: '#2', percentage: p2},
        {label: '#3', percentage: p3},
    ]);
    // console.log('perf state', state);

    setTimeout(animatePerf, animationTimeInMs);
};

window.toggleAnimation = toggleAnimation;
window.switchTimeFramePolarRain0 = switchTimeFramePolarRain0;
window.switchTimeFrameCartesian0 = switchTimeFrameCartesian0;
window.switchTimeFramePolarRain1 = switchTimeFramePolarRain1;
window.switchTimeFramePolarWithoutOptimization = switchTimeFramePolarWithoutOptimization;
window.switchTimeFrameIcons = switchTimeFrameIcons;

window.focusReset = dateStatusElement.focusReset;
window.focusPrevious = dateStatusElement.focusPrevious;
window.focusNext = dateStatusElement.focusNext;

window.dynamicFocusReset = dynamicDateElement.focusReset;
window.dynamicFocusPrevious = dynamicDateElement.focusPrevious;
window.dynamicFocusNext = dynamicDateElement.focusNext;

// #############

mapElement.compositeLayer.showTheFistMatchingId('polar_with_Rain0_');
// setTimeout(switchTimeFramePolarRain0, animationTimeInMs);
switchMatrix();
animatePerf();
