import {PolarMapValue} from '../tools/PolarMapValue';
import {PolarDrawerOptimization} from './PolarDrawerOptimization';

export class PolarGridValue {

    constructor(
        private color: number,
        private transparency: number,
        public polarAzimuthInDegrees: number,
        private polarDistanceRelative: number,
        public id?: string) {
    }

    static Create(src: PolarMapValue,
                  distanceRatio: number,
                  optimization?: PolarDrawerOptimization): PolarGridValue {

        let transparency = 1; // not visible
        let value = 0x51CFF3;
        if (!optimization || optimization.type === 'rain') {
            value = 0x000000;
            if (0.4 >= src.value && src.value < 1) {
                value = 0x0013C0;
                transparency = 0.9;
            } else if (1 >= src.value && src.value < 3) {
                value = 0x00CEF9;
                transparency = 0.85;
            } else if (3 >= src.value && src.value < 10) {
                value = 0x009A0F;
                transparency = 0.8;
            } else if (10 >= src.value && src.value < 20) {
                value = 0x6DED00;
                transparency = 0.75;
            } else if (20 >= src.value && src.value < 30) {
                value = 0xFFF300;
                transparency = 0.70;
            } else if (30 >= src.value && src.value < 50) {
                value = 0xFF9200;
                transparency = 0.65;
            } else if (50 >= src.value && src.value < 100) {
                value = 0xFF0000;
                transparency = 0.6;
            } else if (100 >= src.value) {
                value = 0xA80000;
                transparency = 0.5;
            }
        } else {
            const range = optimization.max - optimization.min + 1;
            const stepCount = Math.floor(range / optimization.step) + 1;
            for (let i = 0; i < stepCount; i++) {
                const floorValue = optimization.min + (i * optimization.step);
                if (src.value >= floorValue) {
                    transparency = (range - floorValue) / (range * 2);
                }
            }
        }

        const distance = Math.round(100 * src.polarDistanceInMeters * distanceRatio) / 100;

        // hack to see limits:
        //if (src.polarDistanceInMeters > (250 * 1000)) {
        //    transparency = 0.8;
        //    value = 0x9836FF;
        //}

        return new PolarGridValue(
            value,
            transparency,
            src.polarAzimuthInDegrees,
            distance,
            src.id
        );
    }

    public getColor(forcedColor?: number): number {
        return forcedColor ? forcedColor : this.color;
    }

    public getTransparency(forcedOpacity?: number): number {
        return forcedOpacity ? forcedOpacity : this.transparency;
    }

    public getPolarDistanceRelative(): number {
        return this.polarDistanceRelative;
    }

    public setPolarDistanceRelative(d: number) {
        this.polarDistanceRelative = d;
    }
}
