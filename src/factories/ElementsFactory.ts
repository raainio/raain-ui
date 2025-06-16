import {MapLatLng} from '../tools/MapLatLng';
import {MapElement, MapElementInput} from './MapElement';
import {CompareElement, CompareElementInput} from './CompareElement';
import {ConfigurationElement, ConfigurationElementInput} from './ConfigurationElement';
import {DateStatusElement, DateStatusElementInput} from './DateStatusElement';
import {DynamicDateStatusElement, DynamicDateStatusElementInput} from './DynamicDateStatusElement';
import {SpeedMatrixElement, SpeedMatrixElementInput} from './SpeedMatrixElement';
import {MonitoringBarsElement, MonitoringBarsElementInput} from './MonitoringBarsElement';
import {MonitoringLinesElement, MonitoringLinesElementInput} from './MonitoringLinesElement';
import {ScaleElement, ScaleElementInput} from './ScaleElement';
import {EarthMapElement, EarthMapElementInput} from './EarthMapElement';

export class ElementsFactory {
    constructor(
        public center:
            | MapLatLng
            | {lat: number; lng: number}
            | {latitude: number; longitude: number}
            | any = {lat: 0, lng: 0},
        protected addSomeDebugInfos = false
    ) {
        const lat = typeof this.center.lat !== 'undefined' ? this.center.lat : this.center.latitude;
        const lng =
            typeof this.center.lng !== 'undefined' ? this.center.lng : this.center.longitude;
        this.center = new MapLatLng(lat, lng);
    }

    public createMap(element: HTMLElement, inputs: MapElementInput): MapElement {
        const mapElement = new MapElement(this.center, this.addSomeDebugInfos);
        mapElement.build(element, inputs);
        return mapElement;
    }

    public createCompare(element: HTMLCanvasElement, inputs: CompareElementInput): CompareElement {
        const compareElement = new CompareElement(this.addSomeDebugInfos);
        compareElement.build(element, inputs);
        return compareElement;
    }

    public createConfiguration(
        element: HTMLCanvasElement,
        inputs: ConfigurationElementInput
    ): ConfigurationElement {
        const configurationElement = new ConfigurationElement(this.addSomeDebugInfos);
        configurationElement.build(element, inputs);
        return configurationElement;
    }

    public createDateStatus(
        element: HTMLCanvasElement,
        inputs: DateStatusElementInput
    ): DateStatusElement {
        const dateStatusElement = new DateStatusElement(this.addSomeDebugInfos);
        dateStatusElement.build(element, inputs);
        return dateStatusElement;
    }

    public createSpeedMatrixIndicator(
        element: HTMLCanvasElement,
        inputs: SpeedMatrixElementInput
    ): SpeedMatrixElement {
        const speedMatrixElement = new SpeedMatrixElement(this.addSomeDebugInfos);
        speedMatrixElement.build(element, inputs);
        return speedMatrixElement;
    }

    public createMonitoringBars(
        element: HTMLCanvasElement,
        inputs: MonitoringBarsElementInput
    ): MonitoringBarsElement {
        const el = new MonitoringBarsElement(this.addSomeDebugInfos);
        el.build(element, inputs);
        return el;
    }

    public createMonitoringLines(
        element: HTMLCanvasElement,
        inputs: MonitoringLinesElementInput
    ): MonitoringLinesElement {
        const el = new MonitoringLinesElement(this.addSomeDebugInfos);
        el.build(element, inputs);
        return el;
    }

    public createScale(element: HTMLCanvasElement, inputs: ScaleElementInput): ScaleElement {
        const el = new ScaleElement(this.addSomeDebugInfos);
        el.build(element, inputs);
        return el;
    }

    public createEarthMap(element: HTMLElement, inputs: EarthMapElementInput): EarthMapElement {
        const el = new EarthMapElement(this.addSomeDebugInfos);
        el.build(element, inputs);
        return el;
    }

    public createDynamicDateStatus(
        element: HTMLCanvasElement,
        inputs: DynamicDateStatusElementInput
    ): DynamicDateStatusElement {
        const el = new DynamicDateStatusElement(this.addSomeDebugInfos);
        el.build(element, inputs);
        return el;
    }
}
