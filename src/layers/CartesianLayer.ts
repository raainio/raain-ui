import {Map, Point} from 'leaflet';
import {Container, Graphics, Text} from 'pixi.js';
import {IPixiUniqueLayer} from './IPixiUniqueLayer';
import {CartesianMapValue} from '../tools/CartesianMapValue';
import {CartesianGridValue} from '../drawers/CartesianGridValue';
import {CartesianDrawer} from '../drawers/CartesianDrawer';
import {MapTools} from '../tools/MapTools';
import {MapLatLng} from '../tools/MapLatLng';

export class CartesianLayer implements IPixiUniqueLayer {

    private readonly mapGraph: Graphics;
    private addedInContainer: boolean;
    private cartesianDrawer: CartesianDrawer;
    private center: MapLatLng;

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
    }

    public show(): void {
        this.mapGraph.alpha = 1;
    }

    public isVisible(): boolean {
        return this.mapGraph.alpha === 1;
    }

    public setCartesianGridValues(center: MapLatLng | { lat: number, lng: number }, values: CartesianMapValue[], version: string): void {
        this.center = new MapLatLng(center.lat, center.lng);
        this.cartesianDrawer = new CartesianDrawer(
            (mapValue: CartesianMapValue) => {
                try {
                    const p1 = this.gridMap.latLngToContainerPoint({lat: mapValue.latitude, lng: mapValue.longitude});
                    const p2 = this.gridMap.latLngToContainerPoint({lat: mapValue.latitude2, lng: mapValue.longitude2});
                    return {p1, p2};
                } catch (e) {
                    return {
                        p1: new Point(0, 0),
                        p2: new Point(10, 10)
                    };
                }
            }, (mapValue: CartesianMapValue): boolean => {
                return this.gridMap.getBounds().contains(mapValue);
            },
            (): number => {
                return this.gridMap.getZoom();
            },
            this.type);

        this.cartesianDrawer.updateValues(values, version);
    }

    public render(pixiContainer: Container): number {

        const centerPoint = this.gridMap.latLngToContainerPoint({lat: this.center.lat, lng: this.center.lng});

        const drawCount = 0;
        if (!this.cartesianDrawer.hasChanged(this.center, centerPoint)) {
            return drawCount;
        }

        this.mapGraph.removeChildren();

        this.cartesianDrawer.renderCartesianMapValues(this.center, centerPoint,
            (gridValue: CartesianGridValue) => {
                const pixiGraphic = new Graphics();
                pixiGraphic.beginFill(gridValue.getColor(), 1 - gridValue.getTransparency());
                pixiGraphic.drawRect(0, 0, gridValue.width, gridValue.height);
                pixiGraphic.endFill();
                pixiGraphic.x = gridValue.x;
                pixiGraphic.y = gridValue.y;

                if (this.addSomeDebugInfos) {
                    //  const pixiText = new Text('  ' + gridValue.id, {
                    //      fontFamily: 'Arial',
                    //      fontSize: 13,
                    //      fill: MapTools.hexStringToNumber('#000000'),
                    //      align: 'center',
                    //  });
                    //  pixiGraphic.addChild(pixiText);
                }

                this.mapGraph.addChild(pixiGraphic);

                return true;
            });

        if (!this.addedInContainer) {
            pixiContainer.addChild(this.mapGraph);
            this.addedInContainer = true;
        }

        // Debug purpose :
        if (this.addSomeDebugInfos) {
            const optimization = this.cartesianDrawer.getOptimization();
            const pixiText = new Text('Car-' + optimization?.type + '-' + this.cartesianDrawer.getVersion(), {
                fontFamily: 'Arial',
                fontSize: 16,
                // fontWeight: 'bold',
                fill: MapTools.hexStringToNumber('#ff1010'),
                align: 'center',
            });
            this.mapGraph.addChild(pixiText);
        }

        return drawCount;
    }

}
