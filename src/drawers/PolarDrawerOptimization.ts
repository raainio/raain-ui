import {PolarMapValue} from '../tools/PolarMapValue';

export class PolarDrawerOptimization {
    constructor(public type: string,
                public hardLimit: number,
                public min: number,
                public max: number,
                public step: number,
                public bypass: boolean,
                public considerZoom: boolean) {
    }

    static Defaults(): PolarDrawerOptimization[] {
        return [
            new PolarDrawerOptimization('default', 40001, 0, 100, 10, false, false),
            new PolarDrawerOptimization('radar', 40002, 0.2, 100, 3, true, true),
            new PolarDrawerOptimization('rain', 40003, 0, 76, 10, false, true),
            new PolarDrawerOptimization('zoom', 40003, 0, 76, 10, false, true),
        ];
    }

    filteringValues(zoom: number,
                    geoValues: PolarMapValue[],
                    polarMap2Display: (mapValue: PolarMapValue) => boolean): PolarMapValue[] {

        // non null values
        let valuesToDisplay = geoValues.filter(v => v.value > 0);

        // into the map
        if (polarMap2Display) {
            valuesToDisplay = valuesToDisplay.filter(polarMap2Display);
        }

        // reduced in case of zoom
        if (this.considerZoom) {
            const zoomLimit = 10;
            if (zoom < zoomLimit) {
                const each = zoomLimit + 1 - zoom;
                let count = 0;
                valuesToDisplay = valuesToDisplay.filter(v => {
                    if (++count >= each) {
                        count = 0;
                        return true;
                    }
                    return false;
                });
            }
        }
        return valuesToDisplay;
    }

    groupAzimuths(): boolean {
        if (this.type === '???') {
            return true;
        }
        return false;
    }
}
