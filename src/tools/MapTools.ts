import {LatLng, Point} from 'leaflet';
import {PolarMapValue} from './PolarMapValue';
import {CartesianMapValue} from './CartesianMapValue';

export class MapTools {

    static getPolarDistanceRatio(centerPoint: Point,
                                 lastGeoValue: PolarMapValue,
                                 polarMap2Point: (pv: PolarMapValue) => Point): number {

        const lastGeoValueDuplicated = PolarMapValue.Duplicate(lastGeoValue);
        // const firstGeoValue = PolarMapValue.Duplicate(geoValues[0]);
        // const centerPoint = polarMap2Point(firstGeoValue);
        const lastPoint = polarMap2Point(lastGeoValueDuplicated);
        return Math.sqrt(
            Math.pow(centerPoint.x - lastPoint.x, 2) + Math.pow(centerPoint.y - lastPoint.y, 2)
        ) / lastGeoValueDuplicated.polarDistanceInMeters;
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
