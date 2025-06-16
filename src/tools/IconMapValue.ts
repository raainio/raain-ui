import {CartesianMapValue} from './CartesianMapValue';

export class IconMapValue extends CartesianMapValue {
    constructor(
        lat: number,
        lng: number,
        public readonly speed: number,
        public readonly angle: number,
        id: string,
        name: string
    ) {
        super(speed, lat, lng, lat, lng, id, name);
    }
}
