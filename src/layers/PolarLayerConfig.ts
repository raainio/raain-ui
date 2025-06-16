export class PolarLayerConfig {
    constructor(
        public optimization?: number,
        public theme?: number,
        public range?: number,
        public opacity?: number,
        public minValueToDisplay?: number
    ) {}

    copy(from: PolarLayerConfig): PolarLayerConfig {
        if (typeof from.optimization !== 'undefined') {
            this.optimization = from.optimization;
        }
        if (typeof from.theme !== 'undefined') {
            this.theme = from.theme;
        }
        if (typeof from.range !== 'undefined') {
            this.range = from.range;
        }
        if (typeof from.opacity !== 'undefined') {
            this.opacity = from.opacity;
        }
        if (typeof from.minValueToDisplay !== 'undefined') {
            this.minValueToDisplay = from.minValueToDisplay;
        }
        return this;
    }
}
