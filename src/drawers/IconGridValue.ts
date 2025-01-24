import {IconMapValue, MapTools} from '../tools';
import {Point} from 'leaflet';
import {GridValue} from './GridValue';
import {CartesianTools} from 'raain-model';

export class IconGridValue extends GridValue {

    constructor(
        color: number,
        transparency: number,
        id: string,
        public centerX: number,
        public centerY: number,
        public speed: number,
        public angle: number,
    ) {
        super(color, transparency, id);
    }

    static Create(src: IconMapValue,
                  center: Point): IconGridValue {

        // const {transparency, value} = GridValue.translateColor(src.value);
        const value = '#393636';
        const transparency = 0;
        return new IconGridValue(
            MapTools.hexStringToNumber('' + value),
            transparency,
            '' + Math.round(src.value * 100) / 100,
            center.x,
            center.y,
            src.speed,
            src.angle
        );
    }

    public getPoints(ratio = 1): {
        start: { x: number, y: number },
        end: { x: number, y: number },
        center: { x: number, y: number },
    } {
        const angle = CartesianTools.GetAzimuthRad(-this.angle);
        const center = {
            x: this.centerX,
            y: this.centerY
        };
        const start = {
            x: ratio * this.speed * Math.cos(angle),
            y: ratio * this.speed * Math.sin(angle)
        };
        const end = {
            x: -ratio * this.speed * Math.cos(angle),
            y: -ratio * this.speed * Math.sin(angle)
        };
        return {start, end, center};
    }

}
