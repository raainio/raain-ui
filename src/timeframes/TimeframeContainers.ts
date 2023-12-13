import {TimeframeContainer} from './TimeframeContainer';
import {CartesianValue, MeasureValuePolarContainer, RadarNodeMap, RainComputationMap} from 'raain-model';
import {FrameContainer} from './FrameContainer';
import {PolarMapValue} from '../tools/PolarMapValue';
import {CartesianMapValue} from '../tools/CartesianMapValue';

export class TimeframeContainers {
    constructor(public containers: TimeframeContainer[]) {
    }

    public addFromRadarNodeMap(radarNodeMap: RadarNodeMap,
                               isPolar: boolean) {

        const radarMeasures = radarNodeMap.getMapData();
        let frames;

        if (isPolar) {
            frames = radarMeasures.map(rm => {
                let values: PolarMapValue[] = [];
                rm.values.forEach(v => {
                    const polars = typeof v.polars === 'string' ? JSON.parse(v.polars) : v.polars;
                    values = values.concat(PolarMapValue.from(polars));
                });
                return new FrameContainer(rm.date, values, true, false);
            });
        } else {
            frames = radarMeasures.map(rm => {
                let values: CartesianMapValue[] = [];
                rm.values.forEach(v => {
                    const cartesianValues = typeof v.cartesianValues === 'string' ? JSON.parse(v.cartesianValues) : v.cartesianValues;
                    const cartesianPixelWidth = typeof v.cartesianPixelWidth === 'string' ?
                        JSON.parse(v.cartesianPixelWidth) : v.cartesianPixelWidth;
                    values = values.concat(CartesianMapValue.From(cartesianValues, cartesianPixelWidth));
                });
                return new FrameContainer(rm.date, values, false, true);
            });
        }

        this.containers.push(new TimeframeContainer(radarNodeMap.name, frames, radarNodeMap.getVersion()));
    }

    public addFromRainComputationMap(rainComputationMap: RainComputationMap,
                                     isPolar: boolean) {

        const rainMeasures = rainComputationMap.getMapData();
        let frames: FrameContainer[];

        if (isPolar) {
            frames = rainMeasures.map(rm => {
                let values: PolarMapValue[] = [];
                rm.values.forEach(v => {
                    let polars = v.polars;
                    if (typeof polars === 'string') {
                        polars = JSON.parse(polars);
                    }
                    polars = polars.map(p => new MeasureValuePolarContainer(p));
                    values = values.concat(PolarMapValue.from(polars));
                });
                return new FrameContainer(rm.date, values, true, false);
            });
        } else {
            frames = rainMeasures.map(rm => {
                let values: CartesianMapValue[] = [];
                rm.values.forEach(v => {
                    let cartesianValues = v.cartesianValues;
                    if (typeof cartesianValues === 'string') {
                        cartesianValues = JSON.parse(cartesianValues);
                    }
                    cartesianValues = cartesianValues.map(cv => new CartesianValue(cv.value, cv.lat, cv.lng));
                    values = values.concat(CartesianMapValue.From(cartesianValues, v.cartesianPixelWidth));
                });
                return new FrameContainer(rm.date, values, false, true);
            });
        }

        this.containers.push(new TimeframeContainer(rainComputationMap.name, frames, rainComputationMap.getVersion()));
    }

    showTimeframe(name: string, date: Date): boolean {
        for (const container of this.containers) {
            if (container.name === name) {
                container.showTimeframe(date);
                return true;
            }
        }
        return false;
    }


}
