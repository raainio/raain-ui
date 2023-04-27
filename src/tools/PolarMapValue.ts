import {LatLng} from 'leaflet';
import {computeDestinationPoint} from 'geolib';

export class PolarMapValue extends LatLng {

    private center: LatLng;

    constructor(
        public value: number,
        public polarAzimuthInDegrees: number,
        public polarDistanceInMeters: number,
        public altitude?: number,
        public id?: string,
        public name?: string) {

        super(0, 0, altitude);
        this.center = new LatLng(0, 0);
        this.setLatLngConsistentWithPolar();
    }

    setCenter(center: { latitude: number, longitude: number }): void {
        this.center = new LatLng(center.latitude, center.longitude);
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

    private static GetLatLngFromPolar(center: LatLng, polarAzimuthInDegrees: number, polarDistanceInMeters: number): {
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

}
