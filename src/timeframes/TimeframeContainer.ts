import {FrameContainer} from './FrameContainer';
import {CompositeLayer} from '../layers/CompositeLayer';

export class TimeframeContainer {

    protected compositeLayer: CompositeLayer;

    constructor(public name: string,
                public timeframe: FrameContainer[]) {
    }

    setCompositeLayer(compositeLayer) {
        this.compositeLayer = compositeLayer;
    }

    showTimeframe(date: Date) {

        if (!this.compositeLayer) {
            return;
        }

        let index = 0;
        let frameContainerFound = null;
        this.timeframe.forEach(c => {
            index++;
            if (c.date.getTime() === date.getTime()) {
                frameContainerFound = c;
            }
        });

        if (!!frameContainerFound) {
            this.compositeLayer.showTheFistMatchingId(this.getFrameId(frameContainerFound));
        }
    }

    getFrameId(frameContainer: FrameContainer): string {
        return this.name + frameContainer.date.toISOString();
    }
}
