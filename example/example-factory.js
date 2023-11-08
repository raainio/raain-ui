import 'leaflet/dist/leaflet.css';
// import './map-dark.css';
import {
    ElementsFactory,
    FocusRange,
    FrameContainer,
    MapLatLng,
    PolarMapValue,
    TimeframeContainer,
    TimeframeContainers,
} from 'raain-ui';
import {ConverterFromPolar, LatLng,} from 'raain-quality';
import {MeasureValuePolarContainer, PolarMeasureValue} from 'raain-model';
import {CartesianMapValue} from '../src';

const center = {latitude: 51.505, longitude: -0.09};
const now = new Date();

function addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes * 60000);
}

const createPolarMapValues = (scenario) => {
    const values = [];
    const kms = 70;
    for (let azimuth = 0; azimuth < 360; azimuth += 10) {
        for (let distance = 0; distance < 1000 * kms; distance += 1000) {

            let value = azimuth;
            if (scenario === 1) {
                value = azimuth * distance / (1000 * kms);
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

const createPolarFromJson = () => {
    const {rainPolarMeasureValues} = require('./555555b00000000000000003-polarMeasureValues-2023-11-02T23:04:45.666Z.gitignored.json');
    const polarMapValues = [];
    for (const rpmv of rainPolarMeasureValues) {
        const measureValuePolarContainers = rpmv.polars;
        for (const container of measureValuePolarContainers) {
            let index = 0;
            for (const edge of container.polarEdges) {
                const cmv = new PolarMapValue(edge, container.azimuth, container.distance * index++);
                cmv.setCenter(center);
                polarMapValues.push(cmv);
            }
        }
    }
    console.log('polarMapValues:', polarMapValues.length);
    return polarMapValues;
}

const createCartesianMapValues = (scenario) => {

    const polarValues = createPolarMapValues(scenario);

    const measureValuePolarContainers = [];
    for (let azimuth = 0; azimuth < 360; azimuth += 10) {
        const polarEdges = polarValues.filter(v => v.polarAzimuthInDegrees === azimuth).map(v => v.value);
        measureValuePolarContainers.push(new MeasureValuePolarContainer(
            {
                azimuth,
                distance: 1000,
                polarEdges
            }));
    }

    const polarMeasureValue = new PolarMeasureValue(measureValuePolarContainers);
    const converterFromPolar = new ConverterFromPolar(new LatLng(center.latitude, center.longitude), polarMeasureValue);
    const cartesianMapValues = CartesianMapValue.ConvertFromPolar(converterFromPolar, 100);
    const cartesianMapValuesNotNull = cartesianMapValues.filter(v => v.value);
    console.log('cartesianMapValues:', cartesianMapValues.length, cartesianMapValuesNotNull.length, cartesianMapValuesNotNull);
    return cartesianMapValues;
};

const createCartesianMapFromJson = () => {
    const cartesianRainHistories = require('./555555b00000000000000003-cartesianRainHistories-2023-11-02T23:05:09.451Z.gitignored.snap.2018-05-25T20:15:19.000Z.json');
    const cartesianMapValues = cartesianRainHistories.map(crh => {
        const cmv = new CartesianMapValue(
            crh.computedValue.value,
            crh.computedValue.lat,
            crh.computedValue.lng,
            crh.computedValue.lat + 0.01,
            crh.computedValue.lng + 0.01);
        return cmv;
    });
    console.log('cartesianMapValues:', cartesianMapValues.length, cartesianMapValues);
    return cartesianMapValues;
}

const mapElement = document.getElementById('map');
const compareElement = document.getElementById('compare');
const dateFocusElement = document.getElementById('dateFocus');
const configurationElement = document.getElementById('configuration');
const speedElement = document.getElementById('speed');
const indicatorElement = document.getElementById('indicator');
const speedMatrixElement = document.getElementById('speedMatrix');
const speedTitle = document.getElementById('speedTitle');

// Values
const markers = [
    new MapLatLng(center.latitude, center.longitude, 0, 'centerId', 'center'),
    new MapLatLng(center.latitude + 0.1, center.longitude - 0.1, 0, '2', 'near center'),
];

const allCartesianValues = new TimeframeContainer('allCartesianValuesZoomSensitive', [
    new FrameContainer(now, createCartesianMapValues(0), false, true),
    new FrameContainer(addMinutes(now, 10), createCartesianMapValues(1), false, true),
    new FrameContainer(addMinutes(now, 20), createCartesianMapFromJson(), false, true),
]);

const timeframeContainers = new TimeframeContainers([
    new TimeframeContainer('polar_with_Rain0_', [new FrameContainer(now, createPolarMapValues(0), true, false)]),
    new TimeframeContainer('polar_with_Radar0_', [new FrameContainer(addMinutes(now, 10), createPolarMapValues(0), true, false)]),
    new TimeframeContainer('polar_Rain1_', [new FrameContainer(addMinutes(now, 20), createPolarMapValues(1), true, false)]),
    new TimeframeContainer('polar_without_optimization_', [new FrameContainer(addMinutes(now, 30), createPolarMapValues(1), true, false)]),
    new TimeframeContainer('polar_json_Rain1_', [new FrameContainer(now, createPolarFromJson(), true, false)]),
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
const setOfData = [
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
// TODO manage file presence
positionValuesMatrix = require('./workerProcessorCartesianQuality.gitignored.result.1693901411113.json').qualitySpeedMatrixContainer.flattenMatrices;

// Factory
const factory = new ElementsFactory(center, true);
const iconsOptions = {
    iconUrl: './my-marker-icon.png',
    shadowUrl: './my-marker-shadow.png',
};
const mapManagement = factory.createMap(mapElement, markers, timeframeContainers, iconsOptions);
factory.createCompare(compareElement, comparePoints);
const dateStatusChart = factory.createDateStatus(dateFocusElement, setOfData, new Date('2023-06-02 13:15'), FocusRange.HOUR);
factory.createConfiguration(configurationElement, configurationPoints);
factory.createSpeedIndicator(speedElement, 20.6, 13);
factory.createQualityIndicator(indicatorElement, 34);

let matrixIndex = 0;
// factory.createSpeedMatrixIndicator(speedMatrixElement, positionValuesMatrix[matrixIndex]);

// switching timeframes
const animationTimeInMs = 5000;
let animationEnabled = false;
const toggleAnimation = () => {
    animationEnabled = !animationEnabled;
    console.log('toggleAnimation:', animationEnabled);
    if (animationEnabled) {
        switchTimeFramePolarRain0();
    }
}
const switchTimeFramePolarRain0 = () => {
    timeframeContainers.showTimeframe('polar_with_Rain0_', now);
    // console.log('configurationPoints:', configurationPoints);
    if (animationEnabled) {
        setTimeout(switchTimeFrameCartesian0, animationTimeInMs);
    }
};
const switchTimeFramePolarRadar0 = () => {
    mapManagement.compositeLayer.showTheFistMatchingId('polar_with_Radar0_');
    if (animationEnabled) {
        setTimeout(switchTimeFramePolarRain1, animationTimeInMs);
    }
};
const switchTimeFramePolarRain1 = () => {
    mapManagement.compositeLayer.showTheFistMatchingId('polar_Rain1_');
    if (animationEnabled) {
        setTimeout(switchTimeFramePolarWithoutOptimization, animationTimeInMs);
    }
};
const switchTimeFramePolarWithoutOptimization = () => {
    mapManagement.compositeLayer.showTheFistMatchingId('polar_without_optimization_');
    if (animationEnabled) {
        setTimeout(switchTimeFramePolarJson, animationTimeInMs);
    }
};
const switchTimeFramePolarJson = () => {
    mapManagement.compositeLayer.showTheFistMatchingId('polar_json_');
    if (animationEnabled) {
        setTimeout(switchTimeFrameCartesian1, animationTimeInMs);
    }
};
const switchTimeFrameCartesian0 = () => {
    allCartesianValues.showTimeframe(now);
    if (animationEnabled) {
        setTimeout(switchTimeFramePolarRadar0, animationTimeInMs);
    }
};
const switchTimeFrameCartesian1 = () => {
    allCartesianValues.showTimeframe(addMinutes(now, 10));
    if (animationEnabled) {
        setTimeout(switchTimeFrameCartesian2, animationTimeInMs);
    }
};
const switchTimeFrameCartesian2 = () => {
    allCartesianValues.showTimeframe(addMinutes(now, 20));
    if (animationEnabled) {
        setTimeout(switchTimeFramePolarRain0, animationTimeInMs);
    }
};

const switchMatrix = () => {
    speedMatrixElement.innerHTML = '';
    if (positionValuesMatrix.length === matrixIndex) {
        matrixIndex = 0;
    }
    speedTitle.innerHTML = '<p>matrixIndex:' + matrixIndex + '</p>';

    factory.createSpeedMatrixIndicator(speedMatrixElement, positionValuesMatrix[matrixIndex], Math.random());
    matrixIndex++;
    setTimeout(switchMatrix, animationTimeInMs);
};

window.toggleAnimation = toggleAnimation;
window.switchTimeFramePolarRain0 = switchTimeFramePolarRain0;
window.switchTimeFrameCartesian0 = switchTimeFrameCartesian0;
window.switchTimeFramePolarRain1 = switchTimeFramePolarRain1;
window.switchTimeFrameCartesian1 = switchTimeFrameCartesian1;
window.switchTimeFrameCartesian2 = switchTimeFrameCartesian2;
window.switchTimeFramePolarWithoutOptimization = switchTimeFramePolarWithoutOptimization;
window.switchTimeFramePolarJson = switchTimeFramePolarJson;

// #############

mapManagement.compositeLayer.showTheFistMatchingId('polar_with_Rain0_');
// setTimeout(switchTimeFramePolarRain0, animationTimeInMs);
switchMatrix();
setTimeout(dateStatusChart.focusReset, 10000);

