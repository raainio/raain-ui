export class GridValue {

    constructor(
        private color: number,
        private transparency: number,
        public id?: string) {
    }

    protected static translateColor(srcValue) {

        let value = '#000000';
        let transparency = 1;


        if (srcValue < 0.4) {
            value = '#000e98';
            transparency = 0.9;
        } else if (0.2 <= srcValue && srcValue < 1) {
            value = '#0013C0';
            transparency = 0.7;
        } else if (1 <= srcValue && srcValue < 3) {
            value = '#00CEF9';
            transparency = 0.65;
        } else if (3 <= srcValue && srcValue < 10) {
            value = '#009A0F';
            transparency = 0.6;
        } else if (10 <= srcValue && srcValue < 20) {
            value = '#6DED00';
            transparency = 0.55;
        } else if (20 <= srcValue && srcValue < 30) {
            value = '#FFF300';
            transparency = 0.50;
        } else if (30 <= srcValue && srcValue < 50) {
            value = '#aa72f3';
            transparency = 0.45;
        } else if (50 <= srcValue && srcValue < 100) {
            value = '#f67bec';
            transparency = 0.4;
        } else if (100 <= srcValue && srcValue < 150) {
            value = '#ff23cd';
            transparency = 0.3;
        } else if (150 <= srcValue && srcValue < 200) {
            value = '#ff0707';
            transparency = 0.3;
        } else if (200 <= srcValue && srcValue < 250) {
            value = '#c2042f';
            transparency = 0.3;
        } else if (250 <= srcValue && srcValue < 300) {
            value = '#7e0321';
            transparency = 0.3;
        } else if (300 <= srcValue) {
            value = '#000000';
            transparency = 0.3;
        }

        return {value, transparency};
    }

    public getColor(forcedColor?: number): number {
        return forcedColor ? forcedColor : this.color;
    }

    public getTransparency(forcedOpacity?: number): number {
        return forcedOpacity ? forcedOpacity : this.transparency;
    }

}
