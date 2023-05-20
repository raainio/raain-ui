import {TimeframeContainer} from './TimeframeContainer';
import {RadarNodeMap, RainComputationMap} from 'raain-model';
import {FrameContainer} from './FrameContainer';
import {PolarMapValue} from '../tools/PolarMapValue';
import {CartesianMapValue} from '../tools/CartesianMapValue';

export class TimeframeContainers {
    constructor(public containers: TimeframeContainer[]) {
    }

    public addFromRadarNodeMap(radarNodeMap: RadarNodeMap, isPolar: boolean, cartesianScale = 0.01) {

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
                    values = values.concat(CartesianMapValue.from(cartesianValues, cartesianScale));
                });
                return new FrameContainer(rm.date, values, false, true);
            });
        }

        this.containers.push(new TimeframeContainer(radarNodeMap.name, frames));
    }

    public addFromRainComputationMap(rainComputationMap: RainComputationMap, isPolar: boolean, cartesianScale = 0.01) {

        const rainMeasures = rainComputationMap.getMapData();
        let frames;

        if (isPolar) {
            frames = rainMeasures.map(rm => {
                let values: PolarMapValue[] = [];
                rm.values.forEach(v => {
                    values = values.concat(PolarMapValue.from(v.polars));
                });
                return new FrameContainer(rm.date, values, true, false);
            });
        } else {
            frames = rainMeasures.map(rm => {
                let values: CartesianMapValue[] = [];
                rm.values.forEach(v => {
                    values = values.concat(CartesianMapValue.from(v.cartesianValues, cartesianScale));
                });
                return new FrameContainer(rm.date, values, false, true);
            });
        }

        this.containers.push(new TimeframeContainer(rainComputationMap.name, frames));
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
