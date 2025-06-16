import {Point} from 'leaflet';
import {CartesianDrawerOptimization} from './CartesianDrawerOptimization';
import {GridValue} from './GridValue';
import {MapLatLng, MapTools} from '../tools';

export class CartesianGridValue extends GridValue {
    constructor(
        color: number,
        transparency: number,
        public x: number,
        public y: number,
        public width: number,
        public height: number,
        id?: string
    ) {
        super(color, transparency, id);
    }

    static Create(
        src: MapLatLng,
        srcPoints: {p1: Point; p2: Point},
        center: Point,
        ratio: number,
        optimization: CartesianDrawerOptimization
    ): CartesianGridValue {
        let {transparency, value} = GridValue.translateColor(src.value);

        if (optimization?.bypass && 0.2 <= src.value) {
            value = '#000000';
            transparency = 0.6;
        }

        const x = srcPoints.p1.x,
            y = srcPoints.p1.y,
            width = srcPoints.p2.x - srcPoints.p1.x,
            height = srcPoints.p2.y - srcPoints.p1.y;

        return new CartesianGridValue(
            MapTools.hexStringToNumber(value),
            transparency,
            x,
            y,
            width,
            height,
            '' + Math.round(src.value * 100) / 100 // src.id,
        );
    }
}
