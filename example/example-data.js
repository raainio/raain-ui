import 'leaflet/dist/leaflet.css';
import './map-dark.css';
import {
    CartesianMapValue,
    ElementsFactory,
    FrameContainer,
    MapElementInput,
    MapLatLng,
    PolarMapValue,
    SpeedMatrixElementInput,
    TimeframeContainer,
    TimeframeContainers,
} from 'raain-ui';
import {
    cartesianRainHistories,
    rainComputationQualities,
    rainPolarMeasureValues,
} from './data/require.gitignored.js';
import markerIconUrl from 'url:./my-marker-icon.png';
import markerShadowUrl from 'url:./my-marker-shadow.png';

// eslint-disable-next-line no-undef
const _document = document;
// eslint-disable-next-line no-undef
const _window = window;

// 1) HTML elements
const mapHtmlElement = _document.getElementById('map');
const speedMatrixHtmlElement = _document.getElementById('speedMatrix');
const speedHtmlTitle = _document.getElementById('speedTitle');

// 2) Data
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

    return polarMapValues;
};

const createCartesianMapFromJson = (cartesianRainHistories) => {
    return cartesianRainHistories.map((crh) => {
        const cmv = new CartesianMapValue(
            crh.computedValue.value,
            crh.computedValue.lat,
            crh.computedValue.lng,
            crh.computedValue.lat + 0.008,
            crh.computedValue.lng + 0.014
        );
        return cmv;
    });
};

const markers = [new MapLatLng(center.latitude, center.longitude, 0, 'centerId', 'center')];

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
    frameContainers.push(
        new FrameContainer(date, createCartesianMapFromJson(cartesianRainHistory), false, true)
    );
    indexCartesian++;
    // if (indexCartesian > 12) break;
}
const allCartesianValues = new TimeframeContainer('allCartesianRain', frameContainers);
const timeframeContainers = new TimeframeContainers([allPolarValues, allCartesianValues]);

// 3) Factory
const factory = new ElementsFactory(center, true);
const iconOptions = {
    iconUrl: markerIconUrl,
    shadowUrl: markerShadowUrl,
};
const mapElement = factory.createMap(
    mapHtmlElement,
    new MapElementInput(timeframeContainers, [{iconsLatLng: markers, iconOptions}])
);

// Matrices
// let positionValuesMatrix = rainComputationQualities[0].qualitySpeedMatrixContainer.flattenMatrices;
// let matrixIndex = indexStart;
// factory.createSpeedMatrixIndicator(speedMatrixElement, positionValuesMatrix[matrixIndex]);

// 4) Animations (switching timeframes)
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
    timeframeContainers.showTimeframes(
        'allCartesianRain',
        new Date(now.getTime() + indexAnimation * 5 * 60000)
    );
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
    timeframeContainers.showTimeframes(
        'allPolarRain',
        new Date(now.getTime() + indexAnimation * 5 * 60000)
    );
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
    speedMatrixHtmlElement.innerHTML = '';
    speedHtmlTitle.innerHTML =
        '<p>' +
        indexAnimation +
        ' - ' +
        rainComputationQualities[indexAnimation].periodEnd +
        '</p>';
    factory.createSpeedMatrixIndicator(
        speedMatrixHtmlElement,
        new SpeedMatrixElementInput(
            rainComputationQualities[indexAnimation].qualitySpeedMatrixContainer.flattenMatrices[0],
            rainComputationQualities[
                indexAnimation
            ].qualitySpeedMatrixContainer.trustedIndicators[0]
        )
    );
};

const forward = () => {
    indexAnimation++;
    if (indexAnimation > Math.max(indexCartesian, indexPolar)) {
        indexAnimation = indexStart;
    }
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
    if (cartesianModeToggle) {
        animateCartesian(true);
    } else {
        animatePolar(true);
    }
};

_window.animateCartesian = animateCartesian;
_window.animatePolar = animatePolar;
_window.toggleAnimation = toggleAnimation;
_window.forward = forward;
_window.backward = backward;

mapElement.compositeLayer.showTheFistMatchingId('Cartesian');
setTimeout(animateCartesian, animationTimeInMs);
