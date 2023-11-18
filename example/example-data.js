import 'leaflet/dist/leaflet.css';
import {
    ElementsFactory,
    FrameContainer,
    MapLatLng,
    PolarMapValue,
    TimeframeContainer,
    TimeframeContainers,
} from 'raain-ui';
import {Converter} from 'raain-quality';
import {CartesianMapValue} from '../src';
import {cartesianRainHistories, rainComputationQualities, rainPolarMeasureValues} from './data/require.js';

const center = {latitude: 48.774569, longitude: 2.008407};
const now = new Date();

const createPolarFromJson = (rpmv) => {
    const polarMapValues = [];
    const measureValuePolarContainers = rpmv.polars;
    for (const container of measureValuePolarContainers) {
        let index = 0;
        for (const edge of container.polarEdges) {
            const cmv = new PolarMapValue(edge, container.azimuth, container.distance * ++index);
            cmv.setCenter(center);
            polarMapValues.push(cmv);
        }
    }

    // console.log('polarMapValues:', polarMapValues.length);
    return polarMapValues;
}

const createCartesianMapFromJson = (cartesianRainHistory) => {

    console.log(cartesianRainHistory[0]);
    const cartesianValues = cartesianRainHistory.map(c => c.computedValue);
    const widthForMap = Converter.ComputeLatLngWidth(cartesianValues);
    console.log(widthForMap);

    const cartesianMapValues = cartesianRainHistory.map(crh => {
        const cmv = new CartesianMapValue(
            crh.computedValue.value,
            crh.computedValue.lat,
            crh.computedValue.lng,
            crh.computedValue.lat + widthForMap.lat,
            crh.computedValue.lng + widthForMap.lng);
        return cmv;
    });
    // console.log('cartesianMapValues:', cartesianMapValues.length, cartesianMapValues);
    return cartesianMapValues;
}

const mapElement = document.getElementById('map');
const speedMatrixElement = document.getElementById('speedMatrix');
const speedTitle = document.getElementById('speedTitle');

// Values
const markers = [
    new MapLatLng(center.latitude, center.longitude, 0, 'centerId', 'center'),
];

const indexStart = 0;

// Polars
let frameContainers = [];
let indexPolar = indexStart;
for (let rpmv of rainPolarMeasureValues) {
    const date = new Date(now.getTime() + indexPolar * 5 * 60000);
    frameContainers.push(new FrameContainer(date, createPolarFromJson(rpmv), true, false));
    indexPolar++;
    // if (indexPolar > 5) break;
}
const allPolarValues = new TimeframeContainer('allPolarRain', frameContainers);

// Cartesian
frameContainers = [];
let indexCartesian = indexStart;
for (let cartesianRainHistory of cartesianRainHistories) {
    const date = new Date(now.getTime() + indexCartesian * 5 * 60000);
    frameContainers.push(new FrameContainer(date, createCartesianMapFromJson(cartesianRainHistory), false, true));
    indexCartesian++;
    // if (indexCartesian > 12) break;
}
const allCartesianValues = new TimeframeContainer('allCartesianRain', frameContainers);
const timeframeContainers = new TimeframeContainers([allPolarValues, allCartesianValues,]);

// Factory
const factory = new ElementsFactory(center, true);
const iconsOptions = {
    iconUrl: './my-marker-icon.png',
    shadowUrl: './my-marker-shadow.png',
};
const mapManagement = factory.createMap(mapElement, markers, timeframeContainers, iconsOptions);

// Matrices
// let positionValuesMatrix = rainComputationQualities[0].qualitySpeedMatrixContainer.flattenMatrices;
// let matrixIndex = indexStart;
// factory.createSpeedMatrixIndicator(speedMatrixElement, positionValuesMatrix[matrixIndex]);

// switching timeframes
const animationTimeInMs = 3000;
let animationEnabled = true;
let cartesianModeToggle = true;
let indexAnimation = indexStart;

const toggleAnimation = () => {
    animationEnabled = !animationEnabled;
    if (animationEnabled) {
        animateCartesian(true);
    }
};

const animateCartesian = (toggle) => {
    if (toggle) {
        cartesianModeToggle = true;
    }
    if (!cartesianModeToggle) {
        return;
    }
    timeframeContainers.showTimeframe('allCartesianRain', new Date(now.getTime() + indexAnimation * 5 * 60000));
    animateMatrix();
    if (animationEnabled) {
        indexAnimation++;
        if (indexAnimation > indexCartesian) {
            indexAnimation = indexStart;
        }
        setTimeout(animateCartesian, animationTimeInMs);
    }
};

const animatePolar = (toggle) => {
    if (toggle) {
        cartesianModeToggle = false;
    }
    if (cartesianModeToggle) {
        return;
    }
    timeframeContainers.showTimeframe('allPolarRain', new Date(now.getTime() + indexAnimation * 5 * 60000));
    animateMatrix();
    if (animationEnabled) {
        indexAnimation++;
        if (indexAnimation > indexPolar) {
            indexAnimation = indexStart;
        }
        setTimeout(animatePolar, animationTimeInMs);
    }
};

const animateMatrix = () => {
    console.log('animateMatrix', indexAnimation);
    speedMatrixElement.innerHTML = '';
    speedTitle.innerHTML = '<p>' + indexAnimation + ' - ' + rainComputationQualities[indexAnimation].periodEnd + '</p>';
    console.log('rainComputationQualities:', indexAnimation, rainComputationQualities[indexAnimation]);
    factory.createSpeedMatrixIndicator(speedMatrixElement,
        rainComputationQualities[indexAnimation].qualitySpeedMatrixContainer.flattenMatrices[0],
        rainComputationQualities[indexAnimation].qualitySpeedMatrixContainer.trustedIndicators[0]);
};

const forward = () => {
    indexAnimation++;
    if (indexAnimation > Math.max(indexCartesian, indexPolar)) {
        indexAnimation = indexStart;
    }
    console.log('forward', indexAnimation);
    if (cartesianModeToggle) {
        animateCartesian(true);
    } else {
        animatePolar(true);
    }
};

const backward = () => {
    indexAnimation--;
    if (indexAnimation < indexStart) {
        indexAnimation = Math.max(indexCartesian, indexPolar);
    }
    console.log('backward', indexAnimation);
    if (cartesianModeToggle) {
        animateCartesian(true);
    } else {
        animatePolar(true);
    }
};

window.animateCartesian = animateCartesian;
window.animatePolar = animatePolar;
window.toggleAnimation = toggleAnimation;
window.forward = forward;
window.backward = backward;


// #############

mapManagement.compositeLayer.showTheFistMatchingId('Cartesian');
setTimeout(animateCartesian, animationTimeInMs);

