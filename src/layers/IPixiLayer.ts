import {Map} from 'leaflet';

export interface IPixiLayer {

    addToMap(map: Map): void;

    removeFromMap(map: Map): void;

    setCurrentWidth(width: number): void;

    setCurrentHeight(height: number): void;

}
