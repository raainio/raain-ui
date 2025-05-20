import {Map, Point} from 'leaflet';
import {Application, Container, Graphics, Text} from 'pixi.js';
import {IPixiUniqueLayer} from './IPixiUniqueLayer';
import {CartesianMapValue, MapLatLng, MapTools} from '../tools';
import {CartesianDrawer, CartesianGridValue} from '../drawers';
import {IDrawer} from '../drawers/IDrawer';

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

    public show(alpha = 1): void {
        this.mapGraph.alpha = alpha;
    }

    public isVisible(): boolean {
        return this.mapGraph.alpha !== 0;
    }

    public setValues(center: MapLatLng | { lat: number, lng: number },
                     values: CartesianMapValue[],
                     config: any,
                     version: string): void {
        this.center = new MapLatLng(center.lat, center.lng);
        this.cartesianDrawer = new CartesianDrawer(
            (mapValue: CartesianMapValue) => {
                try {
                    const {point1, point2} = mapValue.getPoints();
                    const p1 = this.gridMap.latLngToContainerPoint(point1);
                    const p2 = this.gridMap.latLngToContainerPoint(point2);
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

        const centerPoint = this.gridMap.latLngToContainerPoint(this.center);

        const drawCount = 0;
        if (!this.cartesianDrawer?.hasChanged(this.center, centerPoint)) {
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

        if (pixiContainer && !this.addedInContainer) {
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

    setPixiApp(pixiApp: Application) {
    }

    getDrawer(): IDrawer {
        return this.cartesianDrawer;
    }

}
