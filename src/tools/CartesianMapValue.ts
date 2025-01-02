import {CartesianValue} from 'raain-model';
import {MapLatLng} from './MapLatLng';
import {LatLng} from 'leaflet';

export class CartesianMapValue extends MapLatLng {

    constructor(
        value: number,
        lat: number,
        lng: number,
        public lat2: number,
        public lng2: number,
        id: string,
        name: string) {

        super(lat, lng, undefined, id, name, value);
    }

    public static Duplicate(src: CartesianMapValue): CartesianMapValue {
        return new CartesianMapValue(
            src.value,
            src.lat,
            src.lng,
            src.lat2,
            src.lng2,
            src.id,
            src.name,
        );
    }

    public static From(cartesianValues: CartesianValue[], widthForMap: MapLatLng | { lat: number, lng: number }): CartesianMapValue[] {
        const cartesianMapValues = [];
        cartesianValues.forEach(cartesianValue => {
            cartesianMapValues.push(new CartesianMapValue(
                cartesianValue.value,
                cartesianValue.lat,
                cartesianValue.lng,
                cartesianValue.lat + widthForMap.lat,
                cartesianValue.lng + widthForMap.lng,
                '' + Math.random(),
                ''
            ));
        });
        return cartesianMapValues;
    }

    getPoints(): { point1: LatLng, point2: LatLng } {
        const point1 = new LatLng(this.lat, this.lng);
        const point2 = new LatLng(this.lat2, this.lng2);
        return {point1, point2};
    }

}
