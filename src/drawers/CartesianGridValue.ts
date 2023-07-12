import {CartesianMapValue} from '../tools/CartesianMapValue';
import {Point} from 'leaflet';

export class CartesianGridValue {

    constructor(
        private color: number,
        private transparency: number,
        public x: number,
        public y: number,
        public width: number,
        public height: number,
        public id?: string) {
    }

    static Create(src: CartesianMapValue,
                  srcPoints: { p1: Point, p2: Point },
                  center: Point,
                  ratio: number,
                  bypassColor: boolean): CartesianGridValue {

        let transparency = 1; // not visible
        let color = 0x000000;

        if (0.4 <= src.value && src.value < 1) {
            color = 0x0013C1;
            transparency = 0.9;
        } else if (1 <= src.value && src.value < 3) {
            color = 0x00CEF9;
            transparency = 0.85;
        } else if (3 <= src.value && src.value < 10) {
            color = 0x009A0F;
            transparency = 0.8;
        } else if (10 <= src.value && src.value < 20) {
            color = 0x6DED00;
            transparency = 0.75;
        } else if (20 <= src.value && src.value < 30) {
            color = 0xFFF300;
            transparency = 0.70;
        } else if (30 <= src.value && src.value < 50) {
            color = 0xFF9201;
            transparency = 0.65;
        } else if (50 <= src.value && src.value < 100) {
            color = 0xFF0000;
            transparency = 0.6;
        } else if (100 <= src.value) {
            color = 0xA80000;
            transparency = 0.5;
        }

        if (bypassColor && 0.4 <= src.value) {
            color = 0x0013C1;
        }

        const x = srcPoints.p1.x,
            y = srcPoints.p1.y,
            width = srcPoints.p2.x - srcPoints.p1.x,
            height = srcPoints.p2.y - srcPoints.p1.y;

        return new CartesianGridValue(
            color,
            transparency,
            x,
            y,
            width,
            height,
            src.id
        );
    }

    public getColor(): number {
        return this.color;
    }

    public getTransparency(): number {
        return this.transparency;
    }

}
