import {ChartScaleColors, Tools} from '../factories';

export class GridValue {

    constructor(
        private color: number,
        private transparency: number,
        public id?: string) {
    }

    protected static translateColor(srcValue: number) {

        let color = '#000000';
        let transparency = 1; // 1 => invisible

        const entries = Object.entries(ChartScaleColors);
        const scaleDescValues: [number, string][] = entries
            .map(entry => {
                return [parseFloat(entry[0]), Tools.rgbStringToHex(entry[1])] as [number, string];
            })
            .sort((a, b) => b[0] - a[0]);

        for (const [index, scaleValue] of scaleDescValues.entries()) {
            transparency = 0; // 1 - Math.exp(-0.1 * index);
            color = scaleValue[1];
            if (scaleValue[0] <= srcValue) {
                break;
            }
        }

        return {value: color, transparency};
    }

    public getColor(brightRatio = 1): number {
        return Math.round(this.color * brightRatio);
    }

    public getTransparency(ratio = 1): number {
        return this.transparency * ratio;
    }

}
