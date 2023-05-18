import {CartesianValue} from 'raain-model';
import {MapLatLng} from './MapLatLng';

export class CartesianMapValue extends MapLatLng {

    constructor(
        value: number,
        public readonly latitude: number,
        public readonly longitude: number,
        public readonly latitude2?: number,
        public readonly longitude2?: number,
        id?: string,
        name?: string) {

        super(latitude, longitude, undefined, id, name, value);
    }

    static Duplicate(src: CartesianMapValue): CartesianMapValue {
        return new CartesianMapValue(
            src.value,
            src.latitude,
            src.longitude,
            src.latitude2,
            src.longitude2,
            src.id,
            src.name,
        );
    }

    public static from(cartesianValues: CartesianValue[]): CartesianMapValue[] {

        let latDiff = 0.01;
        let lngDiff = 0.01;
        if (cartesianValues.length > 0) {
            latDiff = cartesianValues[1].lat - cartesianValues[0].lat;
            lngDiff = cartesianValues[1].lng - cartesianValues[0].lng;
        }

        const cartesianMapValues = [];
        cartesianValues.forEach(cartesianValue => {
            cartesianMapValues.push(new CartesianMapValue(
                cartesianValue.value,
                cartesianValue.lat,
                cartesianValue.lng,
                cartesianValue.lat + latDiff,
                cartesianValue.lng + lngDiff
            ));
        });
        return cartesianMapValues;
    }

}
