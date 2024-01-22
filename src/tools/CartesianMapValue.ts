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

    public static Duplicate(src: CartesianMapValue): CartesianMapValue {
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

    public static From(cartesianValues: CartesianValue[], widthForMap: MapLatLng): CartesianMapValue[] {
        const cartesianMapValues = [];
        cartesianValues.forEach(cartesianValue => {
            cartesianMapValues.push(new CartesianMapValue(
                cartesianValue.value,
                cartesianValue.lat,
                cartesianValue.lng,
                cartesianValue.lat + widthForMap.lat,
                cartesianValue.lng + widthForMap.lng
            ));
        });
        return cartesianMapValues;
    }

}
