import {LatLng} from 'leaflet';

export class CartesianMapValue extends LatLng {

    constructor(
        public readonly value: number,
        public readonly latitude: number,
        public readonly longitude: number,
        public readonly latitude2: number,
        public readonly longitude2: number,
        public readonly id?: string,
        public readonly name?: string) {

        super(latitude, longitude);
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

}
