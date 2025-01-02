import {LatLng} from 'leaflet';

export class MapLatLng extends LatLng {

    constructor(
        public lat: number,
        public lng: number,
        public alt?: number,
        public id?: string,
        public name?: string,
        public value?: number) {
        super(lat, lng, alt);
    }

}
