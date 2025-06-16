import {Browser, DomUtil, GridLayer, Map} from 'leaflet';
import {Application, Container, Renderer} from 'pixi.js';
import {MapLatLng} from '../tools';

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
    protected _pixiContainer: Container;
    protected _pixiRenderer: Renderer;

    protected renderFn: renderFnType;
    protected currentWidth: number;
    protected currentHeight: number;
    protected _lastUpdate: Date;
    protected _gridMap: Map;
    protected _gridZoomAnimated;
    protected _gridRendererOptions: ApplicationOptions;
    protected _gridContainer: HTMLElement;
    protected _gridDoubleBuffering;
    protected _gridInitialZoom;
    protected _gridWgsOrigin;
    protected _gridWgsInitialShift;
    protected _gridMapInitialZoom;
    protected _gridOptions;

    constructor(id?: string) {
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

        this.renderFn = (pixiContainer: Container) => {};
    }

    // @Override
    public onAdd(targetMap: Map) {
        // console.log('onAdd', this._gridContainer);
        super.onAdd(targetMap);

        this._gridMap = targetMap;
        this._gridZoomAnimated = targetMap['_gridZoomAnimated'];

        if (!this._gridContainer && this._pixiRenderer) {
            // console.log('onAdd...', this._pixiRenderer);
            this._gridContainer = DomUtil.create('div', 'leaflet-pixi-overlay');
            this._gridContainer.appendChild(this._pixiRenderer.view);
            this._gridMap.getPanes()[this._getPaneName()].appendChild(this._gridContainer);
            this._setEvents();
        }

        this._gridInitialZoom = this._gridOptions.projectionZoom(this._gridMap);
        this._gridWgsOrigin = new MapLatLng(0, 0);
        this._gridWgsInitialShift = this._gridMap.project(
            this._gridWgsOrigin,
            this._gridInitialZoom
        );
        this._gridMapInitialZoom = this._gridMap.getZoom();
        return this;
    }

    // @Override
    public onRemove(targetMap) {
        // console.log('onRemove');
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
        this.pixiApp = null;
        this._gridContainer = null;
        this._pixiContainer = null;
        this._pixiRenderer = null;

        return this;
    }

    public setCurrentWidth(currentWidth) {
        this.currentWidth = currentWidth;
    }

    public setCurrentHeight(currentHeight) {
        this.currentHeight = currentHeight;
    }

    _initializeLayer() {
        // console.log('_initializeLayer');

        this._gridRendererOptions = {
            // backgroundAlpha: 0.5,
            transparent: true,
            width: this.currentWidth,
            height: this.currentHeight,
            // forceCanvas: this._gridOptions.forceCanvas,
            // preserveDrawingBuffer: this._gridOptions.preserveDrawingBuffer,
            // clearBeforeRender: this._gridOptions.clearBeforeRender
            sharedTicker: true,
        };
        // utils.isWebGLSupported() && !this._gridOptions.forceCanvas && this._gridOptions.doubleBuffering;
        this._gridDoubleBuffering = false;

        this.pixiApp = new Application(this._gridRendererOptions);
        const ticker = this.pixiApp.ticker; // Ticker.shared;
        // ticker.maxFPS = 1;
        // ticker.minFPS = 1;
        // ticker.deltaTime = 100000;
        // ticker.speed = 1;
        // ticker.update();
        this._pixiContainer = this.pixiApp.stage;
        this._pixiRenderer = this.pixiApp.renderer;
    }

    protected setRenderFn(fn: renderFnType) {
        this.renderFn = fn;
    }

    // @Override
    protected _update() {
        // console.log('_update');
        // @ts-expect-error - GridLayer._update is protected but needs to be called
        super._update();

        if (!this._gridMap || !this._gridContainer) {
            return;
        }

        const pt = this._gridMap.getPixelBounds().min.subtract(this._gridMap.getPixelOrigin());
        DomUtil.setPosition(this._gridContainer, pt);

        this._layerRedraw();
    }

    protected setMeAsFirst(): void {
        // const mapNode = this._gridMap.getPanes()[this._getPaneName()];
        // this._gridContainer.parentNode.insertBefore(this._gridContainer, mapNode.childNodes[0]);
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

    protected _addContainer() {}

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

        this.renderFn(this._pixiContainer);
    }
}
