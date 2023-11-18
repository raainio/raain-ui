export class GridValue {

    constructor(
        private color: number,
        private transparency: number,
        public id?: string) {
    }

    protected static translateColor(srcValue) {

        let value = '#000000';
        let transparency = 1;


        if (srcValue < 0.2) {
            value = '#ba00c0';
            transparency = 0.7;
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
            value = '#FF9200';
            transparency = 0.45;
        } else if (50 <= srcValue && srcValue < 100) {
            value = '#FF0000';
            transparency = 0.4;
        } else if (100 <= srcValue) {
            value = '#A80000';
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
