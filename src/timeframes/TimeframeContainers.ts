import {TimeframeContainer} from './TimeframeContainer';
import {
    CartesianMeasureValue,
    ICartesianMeasureValue,
    IPolarMeasureValue,
    Measure,
    QualityTools,
    RadarNodeMap,
    RainComputationMap,
    RainPolarMeasureValue,
} from 'raain-model';
import {FrameContainer} from './FrameContainer';
import {CartesianMapValue, PolarMapValue} from '../tools';
import {IPixiUniqueLayer} from '../layers';
import {CartesianDrawerOptimization} from '../drawers';

export class TimeframeContainers {
    constructor(public containers: Array<TimeframeContainer>) {
    }

    addFromRadarNodeMap(radarNodeMap: RadarNodeMap,
                        isPolar: boolean) {

        const radarMeasures = radarNodeMap.getMapData();
        const frames = this.computeFrames(radarMeasures, isPolar);
        this.containers.push(new TimeframeContainer(radarNodeMap.name, frames, radarNodeMap.getVersion()));
    }

    addFromRainComputationMap(rainComputationMap: RainComputationMap,
                              isPolar: boolean) {

        const rainMeasures = rainComputationMap.getMapData();
        const frames = this.computeFrames(rainMeasures, isPolar);
        this.containers.push(new TimeframeContainer(rainComputationMap.name, frames, rainComputationMap.getVersion()));
    }

    showTimeframes(name: string, date: Date) {
        let shows: { layers: IPixiUniqueLayer[], frameContainer: FrameContainer }[] = [];
        for (const container of this.containers) {
            if (container.name === name) {
                shows = shows.concat(container.showTimeframes(date));
            }
        }
        return shows;
    }

    getCumulativeCartesianValues() {
        const cartesianSummedValues: CartesianMapValue[] = [];
        for (const timeframeContainer of this.containers) {
            for (const frameContainer of timeframeContainer.timeframe) {
                if (!frameContainer.isCartesian) {
                    continue;
                }

                const cartesianMapValues = frameContainer.values as CartesianMapValue[];

                const cartesianDrawerOptimization = new CartesianDrawerOptimization('cumul', 0, false, true);
                const cartesianMapValuesFiltered = cartesianDrawerOptimization.filteringValues(9 - 9, cartesianMapValues);
                // const cartesianMapValuesIncreased = cartesianMapValuesFiltered.map(v => {
                //     v.value = v.value * 9;
                //     return v;
                // });

                for (const cartesianMapValue of cartesianMapValuesFiltered) {
                    const alreadyExist = cartesianSummedValues
                        .filter(v => v.equals(cartesianMapValue));
                    if (alreadyExist.length) {
                        alreadyExist[0].value += cartesianMapValue.value;
                    } else {
                        // cartesianMapValue.lat2 = QualityTools.RoundLatLng(cartesianMapValue.lat2
                        //     + cartesianMapValue.lat2 - cartesianMapValue.lat);
                        // cartesianMapValue.lng2 = QualityTools.RoundLatLng(cartesianMapValue.lng2
                        //     + cartesianMapValue.lng2 - cartesianMapValue.lng);
                        cartesianSummedValues.push(cartesianMapValue);
                    }
                }
            }
        }

        return cartesianSummedValues.map(v => {
            const lat2 = QualityTools.RoundLatLng(v.lat2
                + 2 * (v.lat2 - v.lat));
            const lng2 = QualityTools.RoundLatLng(v.lng2
                + 2 * (v.lng2 - v.lng));
            const value = v.value * 9;
            return new CartesianMapValue(value, v.lat, v.lng, lat2, lng2, v.id, v.name);
        });
    }

    protected computeFrames(measures: Measure[], isPolar: boolean): FrameContainer[] {

        let frames: FrameContainer[];
        if (isPolar) {
            frames = measures.map(m => {
                let values: PolarMapValue[] = [];
                if (m.values) {
                    (m.values as IPolarMeasureValue[]).forEach(v => {
                        const rainPolarMeasureValue = RainPolarMeasureValue.From(v);
                        values = values.concat(PolarMapValue.From(rainPolarMeasureValue.getPolars()));
                    });
                }
                return new FrameContainer(m.date, values, true, false);
            });
        } else {
            frames = measures.map(m => {
                let values: CartesianMapValue[] = [];
                if (m.values) {
                    (m.values as ICartesianMeasureValue[]).forEach(v => {
                        const cartesianMeasureValue = CartesianMeasureValue.From(v);
                        values = values.concat(CartesianMapValue.From(
                            cartesianMeasureValue.getCartesianValues(),
                            cartesianMeasureValue.getCartesianPixelWidth()));
                    });
                }
                return new FrameContainer(m.date, values, false, true);
            });
        }

        return frames;
    }

}
