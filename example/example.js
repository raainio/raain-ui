import 'leaflet/dist/leaflet.css';
import {
    CartesianMapValue,
    CompareElementInput,
    ConfigurationElementInput,
    DateStatusElementInput,
    ElementsFactory,
    FrameContainer,
    MapElementInput,
    MapLatLng,
    MonitoringBarsElementInput,
    MonitoringLinesElementInput,
    PolarMapValue,
    SpeedMatrixElementInput,
    TimeframeContainer,
    TimeframeContainers
} from 'raain-ui';

// 1) HTML Elements
const mapHtmlElement = document.getElementById('map');
const compareHtmlElement = document.getElementById('compare');
const dateFocusHtmlElement = document.getElementById('dateFocus');
const speedHtmlTitle = document.getElementById('speedTitle');
const speedMatrixHtmlElement = document.getElementById('speedMatrix');
const configurationHtmlElement = document.getElementById('configuration');
const perfBarHtmlElement = document.getElementById('perfBar');
const perfLineHtmlElement = document.getElementById('perfLine');


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
                value = distanceIsOdd ? azimuth * distance / (1000 * kms) : 0;
            }

            if (20 === azimuth && 30000 <= distance && distance <= 40000) {
                value = 2 * (distance + 1) / distance;
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
        for (let longitude = center.longitude - 1; longitude < center.longitude + 1; longitude += 0.01) {
            const value = 40 * Math.random();
            const mapValue = new CartesianMapValue(value,
                latitude, longitude,
                latitude + 0.1, longitude + 0.1);
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

const allCartesianValues = new TimeframeContainer('allCartesianValuesZoomSensitive', [
    new FrameContainer(now, createCartesianMapValues(0), false, true),
    new FrameContainer(addMinutes(now, 10), createCartesianMapValues(1), false, true),
], 'cartExample');

const timeframeContainers = new TimeframeContainers([
    new TimeframeContainer('polar_with_Rain0_', [new FrameContainer(now, createPolarMapValues(0), true, false)], 'polarExample1'),
    new TimeframeContainer('polar_with_Radar0_', [new FrameContainer(addMinutes(now, 10), createPolarMapValues(0), true, false)], 'polarExample2'),
    new TimeframeContainer('polar_Rain1_', [new FrameContainer(addMinutes(now, 20), createPolarMapValues(1), true, false)], 'polarExample3'),
    new TimeframeContainer('polar_without_optimization_', [new FrameContainer(addMinutes(now, 30), createPolarMapValues(1), true, false)]),
    allCartesianValues,
]);

const comparePoints = [
    {x: 1, y: 2, r: 3},
    {x: 10, y: 25, r: 5, name: 'one'},
    {x: 9, y: 25, r: 9, name: 'two'},
    {x: 55, y: 22, r: 10, name: 'three'},
    {x: 46, y: 32, r: 5}];
const configurationPoints = [{x: 3, y: 2}, {x: 10, y: 25}, {x: 55, y: 135}];
const dateStatusPoints1 = [
    {date: new Date('2022-05-01 13:05'), value: 2},
    {date: new Date('2023-05-01 13:05'), value: 2},
    {date: new Date('2023-06-01 13:05'), value: 2},
    {date: new Date('2023-06-02'), value: 1},
    {date: new Date('2023-06-02 13:12'), value: 3}];
const dateStatusPoints2 = [
    {date: new Date('2023-05-12 11:05'), value: 5},
    {date: new Date('2023-04-02 13:15'), value: 8},
    {date: new Date('2023-06-02 13:15'), value: 8},
    {date: new Date('2023-06-02 14:19'), value: 8},
    {date: new Date('2023-06-12 13:22'), value: 3},
    {date: new Date('2024-06-12 13:22'), value: 3}];
const setOfDates = [
    {label: 'data 1', style: 'bar', values: dateStatusPoints1},
    {label: 'data 2', style: 'bar', values: dateStatusPoints2},
    {label: 'data 2 with lines', style: 'line', values: dateStatusPoints2},
];

let positionValuesMatrix = [
    [{x: -1, y: -2, value: 0}, {x: -1, y: -1, value: 0}, {x: 0, y: -2, value: 0}, {x: 0, y: -1, value: 0}],
    [{x: -1, y: -2, value: 1}, {x: -1, y: -1, value: 2}, {x: 0, y: -2, value: 3}, {x: 0, y: -1, value: 4}],
    [{x: -1, y: -2, value: 2}, {x: -1, y: -1, value: 6}, {x: 0, y: -2, value: 4}, {x: 0, y: -1, value: 8}],
    [{x: -1, y: -2, value: 0.2}, {x: -1, y: -1, value: 3}, {x: 0, y: -2, value: 7}, {x: 0, y: -1, value: 5}],
    [{x: -1, y: -2, value: 3}, {x: -1, y: -1, value: 2}, {x: 0, y: -2, value: 1}, {x: 0, y: -1, value: 0}],
];

let perfBarsPoints =
    [{label: '#1', percentage: 23}, {label: '#2', percentage: 56}, {label: '#3', percentage: 0}];
let perfLinesPoints = [
    {date: addMinutes(now, -10), percentage: 23}, {date: addMinutes(now, -5), percentage: 45},]

// 3) Configurations
const iconsOptions = {
    iconUrl: './my-marker-icon.png',
    shadowUrl: './my-marker-shadow.png',
};

// 4) Factory
const factory = new ElementsFactory(center, true);
const mapElement = factory.createMap(mapHtmlElement,
    new MapElementInput(timeframeContainers, [{iconsLatLng: markers1, iconsOptions}, {iconsLatLng: markers2}]));
const compareElement = factory.createCompare(compareHtmlElement,
    new CompareElementInput(comparePoints));
const dateStatusElement = factory.createDateStatus(dateFocusHtmlElement,
    new DateStatusElementInput(setOfDates));
const configurationElement = factory.createConfiguration(configurationHtmlElement,
    new ConfigurationElementInput(configurationPoints));
const perfBarElement = factory.createMonitoringBars(perfBarHtmlElement,
    new MonitoringBarsElementInput(perfBarsPoints));
const perfLineElement = factory.createMonitoringLines(perfLineHtmlElement,
    new MonitoringLinesElementInput(perfLinesPoints, 10));

// 5) animations (switching timeframes, moving perf data...)
let matrixIndex = 0;
const animationTimeInMs = 5000;
let animationEnabled = false;
const toggleAnimation = () => {
    animationEnabled = !animationEnabled;
    if (animationEnabled) {
        switchTimeFramePolarRain0();
    }
}
const switchTimeFramePolarRain0 = () => {
    timeframeContainers.showTimeframe('polar_with_Rain0_', now);
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
    mapElement.compositeLayer.showTheFistMatchingId('polar_without_optimization_');
    if (animationEnabled) {
        setTimeout(switchTimeFrameCartesian0, animationTimeInMs);
    }
};
const switchTimeFrameCartesian0 = () => {
    allCartesianValues.showTimeframe(now);
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

    factory.createSpeedMatrixIndicator(speedMatrixHtmlElement,
        new SpeedMatrixElementInput(positionValuesMatrix[matrixIndex], Math.random()));
    matrixIndex++;
    setTimeout(switchMatrix, animationTimeInMs);
};

const animatePerf = () => {
    perfBarElement.add([{percentage: Math.random() * 100}, {percentage: Math.random() * 100}, {percentage: Math.random() * 100}]);
    perfLineElement.add(Math.random() * 100);

    setTimeout(animatePerf, animationTimeInMs);
}

window.toggleAnimation = toggleAnimation;
window.switchTimeFramePolarRain0 = switchTimeFramePolarRain0;
window.switchTimeFrameCartesian0 = switchTimeFrameCartesian0;
window.switchTimeFramePolarRain1 = switchTimeFramePolarRain1;
window.switchTimeFramePolarWithoutOptimization = switchTimeFramePolarWithoutOptimization;

window.focusReset = dateStatusElement.focusReset;
window.focusPrevious = dateStatusElement.focusPrevious;
window.focusNext = dateStatusElement.focusNext;

// #############

mapElement.compositeLayer.showTheFistMatchingId('polar_with_Rain0_');
// setTimeout(switchTimeFramePolarRain0, animationTimeInMs);
switchMatrix();
animatePerf();

