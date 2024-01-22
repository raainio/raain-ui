import {LatLng} from 'leaflet';

export class MapLatLng extends LatLng {

    constructor(
        public lat: number,
        public lng: number,
        public alt?: number,
        public readonly id?: string,
        public readonly name?: string,
        public readonly value?: number) {
        super(lat, lng, alt);
    }

}
