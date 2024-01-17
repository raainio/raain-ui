import {CartesianMapValue} from '../tools/CartesianMapValue';

export class CartesianDrawerOptimization {
    constructor(public type: string,
                public hardLimit: number,
                public bypass: boolean,
                public considerZoom: boolean) {
    }


    static Defaults(): CartesianDrawerOptimization[] {
        return [
            new CartesianDrawerOptimization('default', 60000, false, false),
            new CartesianDrawerOptimization('radar', 60000, true, true),
            new CartesianDrawerOptimization('rain', 60000, false, false),
            new CartesianDrawerOptimization('zoom', 60000, false, true),
        ];
    }

    filteringValues(zoom: number,
                    geoValues: CartesianMapValue[],
                    cartesianMap2Display: (mapValue: CartesianMapValue) => boolean
    ): CartesianMapValue[] {
        let valuesToDisplay = geoValues.filter(v => v.value > 0.4);
        if (cartesianMap2Display) {
            valuesToDisplay = valuesToDisplay.filter(cartesianMap2Display);
        }
        if (this.considerZoom) {
            const zoomLimit = 8;
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
}
