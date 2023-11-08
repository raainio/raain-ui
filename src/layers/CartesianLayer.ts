import {LatLng, Map} from 'leaflet';
import {Container, Graphics, Text} from 'pixi.js';
import {IPixiUniqueLayer} from './IPixiUniqueLayer';
import {CartesianMapValue} from '../tools/CartesianMapValue';
import {CartesianGridValue} from '../drawers/CartesianGridValue';
import {CartesianDrawer} from '../drawers/CartesianDrawer';

export class CartesianLayer implements IPixiUniqueLayer {

    private readonly mapGraph: Graphics;
    private addedInContainer: boolean;
    private cartesianDrawer: CartesianDrawer;
    private center: LatLng;

    constructor(protected id: string,
                protected type: string,
                protected gridMap: Map,
                protected addSomeDebugInfos = false) {
        this.mapGraph = new Graphics();
    }

    public getId(): string {
        return this.id;
    }

    public hide(): void {
        this.mapGraph.alpha = 0;
        // console.log('hide ', this.getId());
    }

    public show(): void {
        this.mapGraph.alpha = 1;
        // console.log('show ', this.getId());
    }

    public isVisible(): boolean {
        return this.mapGraph.alpha === 1;
    }

    public setCartesianGridValues(center: LatLng | { lat: number, lng: number }, values: CartesianMapValue[]): void {
        this.center = new LatLng(center.lat, center.lng);
        this.cartesianDrawer = new CartesianDrawer(
            (mapValue: CartesianMapValue) => {
                return {
                    p1: this.gridMap.latLngToContainerPoint({lat: mapValue.latitude, lng: mapValue.longitude}),
                    p2: this.gridMap.latLngToContainerPoint({lat: mapValue.latitude2, lng: mapValue.longitude2}),
                };
            }, (mapValue: CartesianMapValue) => {
                return this.gridMap.getBounds().contains(mapValue);
            },
            (): number => {
                return this.gridMap.getZoom();
            },
            this.type);

        this.cartesianDrawer.updateValues(values);
    }

    public render(pixiContainer: Container): number {

        const centerPoint = this.gridMap.latLngToContainerPoint({lat: this.center.lat, lng: this.center.lng});
        // console.log('Cartesian render ', this.cartesianDrawer.hasChanged(this.center, centerPoint), this.getId());

        const drawCount = 0;
        if (!this.cartesianDrawer.hasChanged(this.center, centerPoint)) {
            return drawCount;
        }

        this.mapGraph.removeChildren();

        // Debug purpose :
        if (this.addSomeDebugInfos) {
            const optimization = this.cartesianDrawer.getOptimization();
            const pixiText = new Text('PixiCartesian_' + optimization?.type + '_' + this.getId(), {
                fontFamily: 'Arial',
                fontSize: 14,
                fill: 0xff1010,
                align: 'center',
            });
            this.mapGraph.addChild(pixiText);
        }

        this.cartesianDrawer.renderCartesianMapValues(this.center, centerPoint,
            (gridValue: CartesianGridValue) => {
                const pixiGraphic = new Graphics();
                pixiGraphic.beginFill(gridValue.getColor(), 1 - gridValue.getTransparency());
                pixiGraphic.drawRect(gridValue.x, gridValue.y, gridValue.width, gridValue.height);
                pixiGraphic.endFill();
                // console.log('renderCartesianMapValues:', gridValue);
                this.mapGraph.addChild(pixiGraphic);
                return true;
            });

        if (!this.addedInContainer) {
            pixiContainer.addChild(this.mapGraph);
            this.addedInContainer = true;
        }

        return drawCount;
    }

}
