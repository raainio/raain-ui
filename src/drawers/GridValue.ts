export class GridValue {

    constructor(
        private color: number,
        private transparency: number,
        public id?: string) {
    }

    protected static translateColor(srcValue: number) {

        let value = '#000000';
        let transparency = 1; // 1 => invisible

        if (0 < srcValue && srcValue < 0.4) {
            value = '#000e98';
            transparency = 0.9;
        } else if (srcValue < 1) {
            value = '#0013C0';
            transparency = 0.7;
        } else if (srcValue < 3) {
            value = '#00CEF9';
            transparency = 0.65;
        } else if (srcValue < 10) {
            value = '#009A0F';
            transparency = 0.6;
        } else if (srcValue < 20) {
            value = '#6DED00';
            transparency = 0.55;
        } else if (srcValue < 30) {
            value = '#FFF300';
            transparency = 0.50;
        } else if (srcValue < 50) {
            value = '#ffc022';
            transparency = 0.45;
        } else if (srcValue < 100) {
            value = '#fe8a1f';
            transparency = 0.4;
        } else if (srcValue < 150) {
            value = '#ff531f';
            transparency = 0.3;
        } else if (srcValue < 200) {
            value = '#db1f26';
            transparency = 0.3;
        } else if (srcValue < 250) {
            value = '#821d37';
            transparency = 0.3;
        } else if (srcValue < 300) {
            value = '#7e0321';
            transparency = 0.3;
        } else if (300 <= srcValue) {
            value = '#000000';
            transparency = 0.3;
        }

        return {value, transparency};
    }

    public getColor(brightRatio = 1): number {
        return Math.round(this.color * brightRatio);
    }

    public getTransparency(ratio = 1): number {
        return this.transparency * ratio;
    }

}
