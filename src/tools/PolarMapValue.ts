import {computeDestinationPoint} from 'geolib';
import {MeasureValuePolarContainer} from 'raain-model';
import {MapLatLng} from './MapLatLng';

export class PolarMapValue extends MapLatLng {

    private center: MapLatLng;

    constructor(
        value: number,
        public polarAzimuthInDegrees: number,
        public polarDistanceInMeters: number,
        public altitude?: number,
        id?: string,
        name?: string) {

        super(0, 0, altitude, id, name, value);
        this.center = new MapLatLng(0, 0);
        this.setLatLngConsistentWithPolar();
    }

    static Duplicate(src: PolarMapValue): PolarMapValue {
        const value = new PolarMapValue(
            src.value,
            src.polarAzimuthInDegrees,
            src.polarDistanceInMeters,
            src.altitude,
            src.id,
            src.name,
        );

        value.setCenter({latitude: src.center.lat, longitude: src.center.lng});
        return value;
    }

    public static From(measureValuePolarContainers: MeasureValuePolarContainer[]): PolarMapValue[] {
        const polarMapValues = [];
        measureValuePolarContainers.forEach(measureValuePolarContainer => {
            measureValuePolarContainer.polarEdges.forEach((edge, index) => {
                polarMapValues.push(new PolarMapValue(
                    edge,
                    measureValuePolarContainer.azimuth,
                    measureValuePolarContainer.distance * (index + 1)));
            });
        });
        return polarMapValues;
    }

    private static GetLatLngFromPolar(center: MapLatLng, polarAzimuthInDegrees: number, polarDistanceInMeters: number): {
        lat: number,
        lng: number
    } {
        const dest = computeDestinationPoint(
            center,
            polarDistanceInMeters,
            polarAzimuthInDegrees
        );
        return {
            lat: dest.latitude,
            lng: dest.longitude
        };
    }

    setCenter(center: { latitude: number, longitude: number }): void {
        this.center = new MapLatLng(center.latitude, center.longitude);
        this.setLatLngConsistentWithPolar();
    }

    setPolarAzimuthInDegrees(polarAzimuthInDegrees: number): void {
        this.polarAzimuthInDegrees = polarAzimuthInDegrees;
        this.setLatLngConsistentWithPolar();
    }

    setPolarDistanceInMeters(polarDistanceInMeters: number): void {
        this.polarDistanceInMeters = polarDistanceInMeters;
        this.setLatLngConsistentWithPolar();
    }

    getLatitude(): number {
        this.setLatLngConsistentWithPolar();
        return this.lat;
    }

    getLongitude(): number {
        this.setLatLngConsistentWithPolar();
        return this.lng;
    }

    private setLatLngConsistentWithPolar(): void {
        if (this.center.lat === 0 && this.center.lng === 0) {
            return;
        }

        const latLng = PolarMapValue.GetLatLngFromPolar(this.center, this.polarAzimuthInDegrees, this.polarDistanceInMeters);
        this.lat = latLng.lat;
        this.lng = latLng.lng;
    }

}
