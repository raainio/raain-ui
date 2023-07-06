import { CartesianMapValue, ElementsFactory, FrameContainer, MapLatLng, PolarMapValue, TimeframeContainer, TimeframeContainers } from 'raain-ui';
import 'leaflet/dist/leaflet.css';

const center = { latitude: 51.505, longitude: -0.09 };
const now = new Date();

function addMinutes (date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}

const createPolarMapValues = () => {
  const values = [];
  for (let azimuth = 0; azimuth < 360; azimuth += 1) {
    for (let distance = 0; distance < 100000; distance += 1000) {
      const value = azimuth * Math.random();
      const pmv = new PolarMapValue(value, azimuth, distance);
      pmv.setCenter(center);
      values.push(pmv);
    }
  }
  return values;
};

const createCartesianMapValues = () => {
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

const transformRadarNodeMap = () => {

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

const mapElement = document.getElementById('map');
const compareElement = document.getElementById('compare');
const dateFocusElement = document.getElementById('dateFocus');
const configurationElement = document.getElementById('configuration');
const speedElement = document.getElementById('speed');
const indicatorElement = document.getElementById('indicator');

// Values
const markers = [
  new MapLatLng(center.latitude, center.longitude, 0, 'centerId', 'center'),
  new MapLatLng(center.latitude + 0.1, center.longitude - 0.1, 0, '2', 'near center'),
];

const allCartesianValues = new TimeframeContainer('allCartesianValues', [
  new FrameContainer(now, createCartesianMapValues(), false, true),
  new FrameContainer(addMinutes(now, 10), transformRadarNodeMap(), false, true),
]);

const timeframeContainers = new TimeframeContainers([
  new TimeframeContainer('polar1', [new FrameContainer(now, createPolarMapValues(), true, false)]),
  new TimeframeContainer('polar2', [new FrameContainer(addMinutes(now, 10), createPolarMapValues(), true, false)]),
  allCartesianValues,
]);

const comparePoints = [
  { x: 1, y: 2, r: 3 },
  { x: 10, y: 25, r: 5, name: 'one' },
  { x: 9, y: 25, r: 9, name: 'two' },
  { x: 55, y: 22, r: 10, name: 'three' },
  { x: 46, y: 32, r: 5 }];
const configurationPoints = [{ x: 3, y: 2 }, { x: 10, y: 25 }, { x: 55, y: 135 }];
const dateStatusPoints1 = [
  { date: new Date('2022-05-01 13:05'), value: 2 },
  { date: new Date('2023-05-01 13:05'), value: 2 },
  { date: new Date('2023-06-01 13:05'), value: 2 },
  { date: new Date('2023-06-02'), value: 1 },
  { date: new Date('2023-06-02 13:12'), value: 3 }];
const dateStatusPoints2 = [
  { date: new Date('2023-05-12 11:05'), value: 5 },
  { date: new Date('2023-04-02 13:15'), value: 8 },
  { date: new Date('2023-06-02 13:15'), value: 8 },
  { date: new Date('2023-06-12 13:22'), value: 3 },
  { date: new Date('2024-06-12 13:22'), value: 3 }];
const setOfData = [
  { label: 'data 1', style: 'bar', values: dateStatusPoints1 },
  { label: 'data 2', style: 'bar', values: dateStatusPoints2 },
  { label: 'data 2 with lines', style: 'line', values: dateStatusPoints2 },
];

// Factory
const factory = new ElementsFactory(center, true);
const iconsOptions = {
  iconUrl: './my-marker-icon.png',
  shadowUrl: './my-marker-shadow.png',
};
const mapManagement = factory.createMap(mapElement, markers, timeframeContainers, iconsOptions);
factory.createCompare(compareElement, comparePoints);
const dateStatusChart = factory.createDateStatus(dateFocusElement, setOfData, new Date('2023-06-02 13:15'));
factory.createConfiguration(configurationElement, configurationPoints);
factory.createSpeedIndicator(speedElement, 20.6, 13);
factory.createQualityIndicator(indicatorElement, 34);

// switching timeframes
const animationTimeInMs = 2000;
const switchTimeFramePolar1 = () => {
  timeframeContainers.showTimeframe('polar1', now);
  console.log('configurationPoints:', configurationPoints);
  setTimeout(switchTimeFramePolar2, animationTimeInMs);
};
const switchTimeFramePolar2 = () => {
  mapManagement.compositeLayer.showTheFistMatchingId('polar2');
  setTimeout(switchTimeFrameCartesianDate1, animationTimeInMs);
};
const switchTimeFrameCartesianDate1 = () => {
  allCartesianValues.showTimeframe(now);
  setTimeout(switchTimeFrameCartesianDate2, animationTimeInMs);
};
const switchTimeFrameCartesianDate2 = () => {
  allCartesianValues.showTimeframe(addMinutes(now, 10));
  setTimeout(switchTimeFramePolar1, animationTimeInMs);
};
setTimeout(switchTimeFramePolar1, animationTimeInMs);

setTimeout(dateStatusChart.focusReset, 100000);

