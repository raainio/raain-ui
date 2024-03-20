import {Map} from 'leaflet';
import {PixiGridLayer} from './PixiGridLayer';
import {IPixiLayer} from './IPixiLayer';
import {IPixiUniqueLayer} from './IPixiUniqueLayer';

export class CompositeLayer extends PixiGridLayer implements IPixiLayer {

    protected layers: IPixiUniqueLayer[];
    protected initialized: boolean;

    constructor(public id?: string) {
        super(id); // @PixiGridLayer
        this.removeAllLayers();
        this.setRenderFn(this.renderVisibleLayers.bind(this));
    }

    public addToMap(map: Map) {
        if (!this.initialized) {
            this._initializeLayer();
            this.initialized = true;
        }

        if (!map.hasLayer(this)) {
            map.addLayer(this);
            this._update();
        }
    }

    public removeFromMap(map: Map) {
        if (map.hasLayer(this)) {
            map.removeLayer(this);
        }

        this.removeAllLayers();
    }

    public getId() {
        return this.id;
    }

    public addLayer(layer: IPixiUniqueLayer) {
        this.layers.push(layer);
    }

    public removeAllLayers() {
        this.layers = [];
        if (this._pixiContainer) {
            this._pixiContainer.removeChildren();
        }
    }

    public showTheFistMatchingId(layerId: string): IPixiUniqueLayer {
        let firstFound = false;
        let hideEverythingElse = false;
        let layerShown: IPixiUniqueLayer = null;
        for (const layer of this.layers) {
            if (!firstFound) {
                firstFound = layer.getId().indexOf(layerId) >= 0;
            }

            if (firstFound && !hideEverythingElse) {
                layer.show();
                hideEverythingElse = true;
                layerShown = layer;
            } else {
                layer.hide();
            }
        }

        this.renderVisibleLayers();
        return layerShown;
    }

    private renderVisibleLayers(): number {
        let count = 0;
        for (const layer of this.layers) {
            if (layer.isVisible()) {
                count += layer.render(this._pixiContainer);
            }
        }
        return count;
    }
}
