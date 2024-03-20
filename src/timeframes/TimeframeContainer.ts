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

    showTimeframe(date?: Date): { layer: IPixiUniqueLayer, frameContainer: FrameContainer } {

        if (!this.compositeLayer) {
            return {layer: null, frameContainer: null};
        }

        let layerShown: IPixiUniqueLayer = null;
        let frameContainerFound = this.timeframe.length ? this.timeframe[0] : null;
        this.timeframe.forEach(c => {
            if (new Date(c.date).getTime() === date?.getTime()) {
                frameContainerFound = c;
            }
        });

        if (!!frameContainerFound) {
            layerShown = this.compositeLayer.showTheFistMatchingId(this.getFrameId(frameContainerFound));
        }

        return {layer: layerShown, frameContainer: frameContainerFound};
    }

    getFrameId(frameContainer: FrameContainer): string {
        return this.name + new Date(frameContainer.date).toISOString();
    }
}
