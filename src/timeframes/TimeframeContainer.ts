import {FrameContainer} from './FrameContainer';
import {CompositeLayer} from '../layers/CompositeLayer';
import {IPixiUniqueLayer} from '../layers/IPixiUniqueLayer';

export class TimeframeContainer {

    protected compositeLayer: CompositeLayer;

    constructor(public name: string,
                public timeframe: FrameContainer[],
                public version: string) {
    }

    setCompositeLayer(compositeLayer: CompositeLayer) {
        this.compositeLayer = compositeLayer;
    }

    showTimeframes(date: Date, alpha = 1) {

        if (!this.compositeLayer) {
            return [{layers: [], frameContainer: null}];
        }

        let layersShown: { layers: IPixiUniqueLayer[], frameContainer: FrameContainer }[] = [];
        this.timeframe.forEach(frameContainer => {
            layersShown = layersShown.concat({layers: this.compositeLayer.show(date.toISOString(), alpha), frameContainer});
        });

        return layersShown;
    }

    getFrameId(frameContainer: FrameContainer): string {
        return this.name + '_' + new Date(frameContainer.date).toISOString() + '_' + frameContainer.values?.length;
    }
}
