import {CartesianMapValue} from '../tools/CartesianMapValue';
import {Point} from 'leaflet';
import {CartesianDrawerOptimization} from './CartesianDrawerOptimization';
import {GridValue} from './GridValue';
import {MapTools} from '../tools/MapTools';

export class CartesianGridValue extends GridValue {

    constructor(
        color: number,
        transparency: number,
        public x: number,
        public y: number,
        public width: number,
        public height: number,
        id?: string) {
        super(color, transparency, id);
    }

    static Create(src: CartesianMapValue,
                  srcPoints: { p1: Point, p2: Point },
                  center: Point,
                  ratio: number,
                  optimization: CartesianDrawerOptimization): CartesianGridValue {

        // let transparency = 1; // not visible
        // let value = 0x51CFF3;
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
            src.id
        );
    }

}
