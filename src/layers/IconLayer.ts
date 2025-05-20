import {Map} from 'leaflet';
import {Application, Container, Graphics} from 'pixi.js';
import {IPixiUniqueLayer} from './IPixiUniqueLayer';
import {IconMapValue, MapLatLng} from '../tools';
import {IconDrawer, IconGridValue} from '../drawers';
import {IDrawer} from '../drawers/IDrawer';

export class IconLayer implements IPixiUniqueLayer {

    private readonly mapGraph: Graphics;
    private addedInContainer: boolean;
    private iconDrawer: IconDrawer;
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
                     values: IconMapValue[],
                     config: any,
                     version: string): void {
        this.center = new MapLatLng(center.lat, center.lng);
        this.iconDrawer = new IconDrawer(
            (mapValue: IconMapValue) => {
                try {
                    const p1 = this.gridMap.latLngToContainerPoint(mapValue);
                    return {p1, p2: p1};
                } catch (e) {
                    return null;
                }
            }, (mapValue: IconMapValue): boolean => {
                return this.gridMap.getBounds().contains(mapValue);
            },
            (): number => {
                return this.gridMap.getZoom();
            },
            this.type);

        this.iconDrawer.updateValues(values, version);
    }

    public render(pixiContainer: Container): number {

        if (!this.center) {
            return -1;
        }

        const centerPoint = this.gridMap.latLngToContainerPoint(this.center);

        const drawCount = 0;
        if (!this.iconDrawer?.hasChanged(this.center, centerPoint)) {
            return drawCount;
        }

        this.mapGraph.removeChildren();

        this.iconDrawer.renderCartesianMapValues(this.center, centerPoint, (gridValue: IconGridValue) => {
            const pixiGraphic = new Graphics();
            // pixiGraphic.beginFill(gridValue.getColor(), 1 - gridValue.getTransparency());
            const width = 5;
            const {center, start, end} = gridValue.getPoints(width);
            const diff = {x: end.x - start.x, y: end.y - start.y};

            pixiGraphic.lineStyle(width, gridValue.getColor(1), 1 - gridValue.getTransparency());
            pixiGraphic.moveTo(start.x, start.y);
            pixiGraphic.lineTo(end.x - diff.x / 7, end.y - diff.y / 7);
            pixiGraphic.drawCircle(end.x - diff.x / 7, end.y - diff.y / 7, width);
            pixiGraphic.lineStyle(width / 2, gridValue.getColor(0.9), 1 - gridValue.getTransparency());
            pixiGraphic.moveTo(start.x, start.y);
            pixiGraphic.lineTo(end.x, end.y);

            pixiGraphic.x = center.x;
            pixiGraphic.y = center.y;
            this.mapGraph.addChild(pixiGraphic);
            return true;
        });

        if (pixiContainer && !this.addedInContainer) {
            pixiContainer.addChild(this.mapGraph);
            this.addedInContainer = true;
        }

        return drawCount;
    }

    setPixiApp(pixiApp: Application) {
        // Listen for animate update
        // console.log('this.pixiApp.ticker.FPS', pixiApp.ticker.FPS);
        return;

        // let asc = true;
        // // pixiApp.ticker.add(time => {
        // setInterval(() => {
        //     // Call tick handling for each spinner.
        //     // console.log('time.deltaTime:', time);
        //     if (this.mapGraph.alpha >= 1) {
        //         asc = false;
        //     } else if (this.mapGraph.alpha <= 0) {
        //         asc = true;
        //     }

        //     if (asc) {
        //         this.mapGraph.alpha += 0.1;
        //     } else {
        //         this.mapGraph.alpha -= 0.1;
        //     }
        // }, 100);
        // });
        // pixiApp.ticker.update();
    }

    getDrawer(): IDrawer {
        return this.iconDrawer;
    }

}
