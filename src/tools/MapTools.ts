import {LatLng, Point} from 'leaflet';
import {PolarMapValue} from './PolarMapValue';
import {CartesianMapValue} from './CartesianMapValue';

export class MapTools {

    static getPolarDistanceRatio(center: LatLng,
                                 geoValues: PolarMapValue[],
                                 edgeCount: number,
                                 polarMap2Point: (pv: PolarMapValue) => Point): number {
        if (geoValues.length <= 1) {
            return 1;
        }

        const lastGeoValue = PolarMapValue.Duplicate(geoValues[geoValues.length - 1]);
        const firstGeoValue = PolarMapValue.Duplicate(geoValues[0]);
        const lastPoint = polarMap2Point(lastGeoValue);
        const centerPoint = polarMap2Point(firstGeoValue);
        return Math.sqrt(
            Math.pow(centerPoint.x - lastPoint.x, 2) + Math.pow(centerPoint.y - lastPoint.y, 2)
        ) / lastGeoValue.polarDistanceInMeters;
    }

    static getCartesianDistanceRatio(center: LatLng,
                                     geoValues: CartesianMapValue[],
                                     cartesianMap2Points: (mapValue: CartesianMapValue) => {
                                         p1: Point,
                                         p2: Point
                                     }): number {
        if (geoValues.length <= 1) {
            return 1;
        }

        const centerIntermediate = new CartesianMapValue(0, center.lat, center.lng, 0, 0);
        const centerPoint = cartesianMap2Points(centerIntermediate).p1;

        const lastGeoValue = geoValues[geoValues.length - 1];
        const distanceInMeters = lastGeoValue.distanceTo(center);
        const points = cartesianMap2Points(lastGeoValue);
        return Math.sqrt(
            Math.pow(centerPoint.x - points.p1.x, 2) + Math.pow(centerPoint.y - points.p1.y, 2)
        ) / distanceInMeters;
    }
}
