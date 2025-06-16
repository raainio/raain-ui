import {Map} from 'leaflet';
import {PixiGridLayer} from './PixiGridLayer';
import {IPixiLayer} from './IPixiLayer';
import {IPixiUniqueLayer} from './IPixiUniqueLayer';
import {IDrawer} from '../drawers/IDrawer';

export class CompositeLayer extends PixiGridLayer implements IPixiLayer {
    protected layers: IPixiUniqueLayer[];

    constructor(
        public id: string,
        width: number,
        height: number
    ) {
        super(id); // @PixiGridLayer
        this.removeAllLayers();
        this.setCurrentWidth(width);
        this.setCurrentHeight(height);
        this.setRenderFn(this.renderVisibleLayers.bind(this));
        this._initializeLayer();
    }

    public addToMap(map: Map) {
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
        layer.setPixiApp(this.pixiApp);
        this.layers.push(layer);
    }

    public removeAllLayers() {
        this.layers = [];
        if (this._pixiContainer) {
            this._pixiContainer.removeChildren();
        }
    }

    public showTheFistMatchingId(layerId: string, alpha = 1): IPixiUniqueLayer {
        let firstFound = false;
        let hideEverythingElse = false;
        let layerShown: IPixiUniqueLayer = null;
        for (const layer of this.layers) {
            if (!firstFound) {
                firstFound = layer.getId().indexOf(layerId) >= 0;
            }

            if (firstFound && !hideEverythingElse) {
                layer.show(alpha);
                hideEverythingElse = true;
                layerShown = layer;
            } else {
                layer.hide();
            }
        }

        this.renderVisibleLayers();
        return layerShown;
    }

    public show(inId: string, alpha = 1): IPixiUniqueLayer[] {
        const layersToShow = this.layers.filter((l) => l.getId().indexOf(inId) >= 0);
        layersToShow.forEach((l) => l.show(alpha));

        this.renderVisibleLayers();
        return layersToShow;
    }

    public showAll(alpha = 1): IPixiUniqueLayer[] {
        const layersToShow = this.layers;
        layersToShow.forEach((l) => l.show(alpha));

        this.renderVisibleLayers();
        return layersToShow;
    }

    getFirstDrawer(): IDrawer {
        for (const layer of this.layers) {
            if (layer.getDrawer()) {
                return layer.getDrawer();
            }
        }
        return null;
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
