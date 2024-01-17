import {Browser, DomUtil, GridLayer, latLng, Map} from 'leaflet';
import {Application, Container} from 'pixi.js';

export type renderFnType = (pixiContainer: Container) => void;

function setInteractionManager(interactionManager, destroyInteractionManager, autoPreventDefault) {
    if (destroyInteractionManager) {
        interactionManager.destroy();
    } else if (!autoPreventDefault) {
        interactionManager.autoPreventDefault = false;
    }
}

class ApplicationOptions {
    autoStart?: boolean;
    width?: number;
    height?: number;
    view?: HTMLCanvasElement;
    backgroundAlpha?: number;
    backgroundColor?: number;
    transparent?: boolean;

    autoDensity?: boolean;
    antialias?: boolean;
    preserveDrawingBuffer?: boolean;
    resolution?: number;
    forceCanvas?: boolean;
    clearBeforeRender?: boolean;
    forceFXAA?: boolean;
    sharedTicker?: boolean;
    sharedLoader?: boolean;
    resizeTo?: Window | HTMLElement;
}

export class PixiGridLayer extends GridLayer {

    protected _id: string;
    protected pixiApp: Application;
    protected renderFn: renderFnType;
    protected currentWidth: number;
    protected currentHeight: number;
    protected _lastUpdate: Date;
    protected _gridMap: Map;
    protected _gridZoomAnimated;
    protected _gridRendererOptions: ApplicationOptions;
    protected _gridContainer: HTMLElement;
    protected _gridRenderer;
    protected _gridDoubleBuffering;
    protected _gridInitialZoom;
    protected _gridWgsOrigin;
    protected _gridWgsInitialShift;
    protected _gridMapInitialZoom;
    protected _pixiContainer: Container;
    protected _gridOptions;

    constructor(id ?: string) {
        super();
        this._id = id;
        this._lastUpdate = new Date('01-01-01');
        this._gridOptions = {
            // @option padding: Number = 0.1
            // How much to extend the clip area around the map view (relative to its size)
            // e.g. 0.1 would be 10% of map view in each direction
            padding: 0, // 0.1,
            // @option forceCanvas: Boolean = false
            // Force use of a 2d-canvas
            forceCanvas: true, // false,
            // @option doubleBuffering: Boolean = false
            // Help to prevent flicker when refreshing display on some devices (e.g. iOS devices)
            // It is ignored if rendering is done with 2d-canvas
            doubleBuffering: false,
            // @option resolution: Number = 1
            // Resolution of the renderer canvas
            resolution: Browser.retina ? 2 : 1,
            // @option projectionZoom(map: map): Number
            // return the layer projection zoom level
            projectionZoom: (map) => {
                return (map.getMaxZoom() + map.getMinZoom()) / 2;
            },
            // @option destroyInteractionManager:  Boolean = false
            // Destroy PIXI Interaction Manager
            destroyInteractionManager: false,
            // @option
            // Customize PIXI Interaction Manager autoPreventDefault property
            // This option is ignored if destroyInteractionManager is set
            autoPreventDefault: true,
            // @option resolution: Boolean = false
            // Enables drawing buffer preservation
            preserveDrawingBuffer: false,
            // @option resolution: Boolean = true
            // Clear the canvas before the new render pass
            clearBeforeRender: true,
            // @option shouldRedrawOnMove(e: moveEvent): Boolean
            // filter move events that should trigger a layer redraw
            shouldRedrawOnMove: () => {
                return false;
            },
        };

        this.renderFn = (pixiContainer: Container) => {
        };
    }

    // @Override
    public onAdd(targetMap: Map) {
        // console.log('PIGL onAdd New: ', this._id);
        super.onAdd(targetMap);

        this._setMap(targetMap);

        if (!this._gridContainer) {
            const container = this._gridContainer = DomUtil.create('div', 'leaflet-pixi-overlay');
            container.appendChild(this._gridRenderer.view);
        }
        this._addContainer();
        this._setEvents();
        this._gridInitialZoom = this._gridOptions.projectionZoom(this._gridMap);
        this._gridWgsOrigin = latLng([0, 0]);
        this._gridWgsInitialShift = this._gridMap.project(this._gridWgsOrigin, this._gridInitialZoom);
        this._gridMapInitialZoom = this._gridMap.getZoom();
        return this;
    }

    // @Override
    public onRemove(targetMap) {
        // console.log('PIGL onRemove New', this._id);
        super.onRemove(targetMap);

        const pane = this._gridMap.getPanes()[this._getPaneName()];
        if (pane && pane.children.length > 0) {
            pane.removeChild(this._gridContainer);
        }
        const events = this.getEvents();
        // tslint:disable-next-line:forin
        for (const evt in events) {
            this._gridMap.off(evt, events[evt], this);
        }

        this.pixiApp.destroy();
        this._gridContainer = null;
        this._pixiContainer = null;
        this._gridRenderer = this;

        return this;
    }

    public setCurrentWidth(currentWidth) {
        this.currentWidth = currentWidth;
    }

    public setCurrentHeight(currentHeight) {
        this.currentHeight = currentHeight;
    }

    protected setRenderFn(fn: renderFnType) {
        this.renderFn = fn;
    }

    protected _initializeLayer() {

        // console.log('_initializeLayer');
        this._gridRendererOptions = {
            // backgroundAlpha: 0.5,
            transparent: true,
            width: this.currentWidth,
            height: this.currentHeight,
            // forceCanvas: this._gridOptions.forceCanvas,
            // preserveDrawingBuffer: this._gridOptions.preserveDrawingBuffer,
            // clearBeforeRender: this._gridOptions.clearBeforeRender
        };
        // utils.isWebGLSupported() && !this._gridOptions.forceCanvas && this._gridOptions.doubleBuffering;
        this._gridDoubleBuffering = false;

        this.pixiApp = new Application(this._gridRendererOptions);
        this._pixiContainer = this.pixiApp.stage;
        this._gridRenderer = this.pixiApp.renderer;
    }

    // @Override
    protected _update() {
        // @ts-ignore
        super._update();

        if (!this._gridMap || !this._gridContainer) {
            return;
        }
        // console.log('PIGL _update', this._gridMap.getPixelOrigin(), this._gridMap.getPixelBounds().min);
        const pt = this._gridMap.getPixelBounds().min.subtract(this._gridMap.getPixelOrigin());
        // console.log('pt:', pt);
        DomUtil.setPosition(this._gridContainer, pt);

        this._layerRedraw();
    }

    protected setMeAsFirst(): void {
        // const mapNode = this._gridMap.getPanes()[this._getPaneName()];
        // this._gridContainer.parentNode.insertBefore(this._gridContainer, mapNode.childNodes[0]);
        // console.log('setMeAsFirst', this._getPaneName());
        for (const paneName of Object.getOwnPropertyNames(this._gridMap.getPanes())) {
            const pane = this._gridMap.getPanes()[paneName];
            if (paneName === this._getPaneName()) {
                pane.style.visibility = 'visible';
            } else {
                pane.style.visibility = 'hidden';
            }
        }
    }

    protected isFirst(): boolean {
        const mapNode = this._gridMap.getPanes()[this._getPaneName()];
        return mapNode.childNodes[0].nodeName === this._getPaneName();
    }

    protected _setMap(map) {
        this._gridMap = map;
        this._gridZoomAnimated = map._gridZoomAnimated;
    }

    protected _addContainer() {
        this._gridMap.getPanes()[this._getPaneName()]
            .appendChild(this._gridContainer);
    }

    protected _setEvents() {
        const events = ['zoomend', 'viewreset'];
        // const events = this.getEvents();
        // tslint:disable-next-line:forin
        for (const evt in events) {
            // this._gridMap.on(evt, events[evt], this);
            this._gridMap.on(evt, this._update, this);
        }
    }

    protected _getPaneName(): string {
        return (this._gridOptions as any).pane || 'overlayPane';
    }

    protected _layerRedraw(offset?) {

        // const now = new Date();
        // if (this._lastUpdate.getTime() > (now.getTime() - 500)) {
        //     console.log('_layerRedraw already refreshed');
        //     return;
        // }
        // this._lastUpdate = now;

        //  console.log('_layerRedraw', offset, this._gridWgsOrigin);
        this.renderFn(this._pixiContainer);
    }
}
