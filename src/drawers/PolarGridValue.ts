import {PolarMapValue} from '../tools/PolarMapValue';
import {PolarDrawerOptimization} from './PolarDrawerOptimization';
import {Point} from 'leaflet';
import {MapTools} from '../tools';
import {GridValue} from './GridValue';

export class PolarGridValue extends GridValue {
    constructor(
        color: number,
        transparency: number,
        public polarAzimuthInDegrees: number,
        private polarDistanceRelative: number,
        id?: string
    ) {
        super(color, transparency, id);
    }

    static Create(
        src: PolarMapValue,
        distanceRatio: number,
        optimization: PolarDrawerOptimization
    ): PolarGridValue {
        let {transparency, value} = GridValue.translateColor(src.value);

        if (optimization.type !== 'rain') {
            const range = optimization.max - optimization.min + 1;
            const stepCount = Math.floor(range / optimization.step) + 1;
            for (let i = 0; i < stepCount; i++) {
                const floorValue = optimization.min + i * optimization.step;
                if (src.value >= floorValue) {
                    transparency = (range - floorValue) / (range * 2);
                }
            }
        }

        if (optimization.bypass && 0.2 <= src.value) {
            value = '#000000';
            // transparency = 0.6;
            transparency = Math.min(1, transparency * 2);
        }

        const distance = Math.round(100 * src.polarDistanceInMeters * distanceRatio) / 100;

        return new PolarGridValue(
            MapTools.hexStringToNumber(value),
            transparency,
            src.polarAzimuthInDegrees,
            distance,
            src.id
        );
    }

    public getPolarDistanceRelative(): number {
        return this.polarDistanceRelative;
    }

    public setPolarDistanceRelative(d: number) {
        this.polarDistanceRelative = d;
    }

    public getPositionFrom(centerPoint: Point): Point {
        const radian = this.polarAzimuthInDegrees * (Math.PI / 180);
        const x1 = Math.sin(radian) * this.polarDistanceRelative;
        const y1 = Math.cos(radian) * this.polarDistanceRelative;

        const precision = 100000;
        const x2 = Math.round((x1 + centerPoint.x) * precision) / precision;
        const y2 = Math.round((centerPoint.y - y1) * precision) / precision;
        return new Point(x2, y2);
    }
}
