import {TimeframeContainer} from './TimeframeContainer';
import {
    CartesianMeasureValue,
    ICartesianMeasureValue,
    IPolarMeasureValue,
    Measure,
    RadarNodeMap,
    RainComputationMap,
    RainPolarMeasureValue,
} from 'raain-model';
import {FrameContainer} from './FrameContainer';
import {CartesianMapValue, PolarMapValue} from '../tools';
import {IPixiUniqueLayer} from '../layers';

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
