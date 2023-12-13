import {LatLng, Map} from 'leaflet';
import {Container, Graphics, Text} from 'pixi.js';
import {PolarMapValue} from '../tools/PolarMapValue';
import {PolarDrawer} from '../drawers/PolarDrawer';
import {PolarGridValue} from '../drawers/PolarGridValue';
import {PolarLayerConfig} from './PolarLayerConfig';
import {PolarDrawerOptimization} from '../drawers/PolarDrawerOptimization';
import {IPixiUniqueLayer} from './IPixiUniqueLayer';
import {MapTools} from '../tools/MapTools';

export class PolarLayer implements IPixiUniqueLayer {

    private readonly mapGraph: Graphics;
    private polarDrawer: PolarDrawer;
    private center: LatLng;
    private readonly config: PolarLayerConfig;
    private addedInContainer: boolean;

    constructor(protected id: string,
                protected type: string,
                protected gridMap: Map,
                protected addSomeDebugInfos = false) {
        this.mapGraph = new Graphics();
        this.config = new PolarLayerConfig();
    }

    public getId() {
        return this.id;
    }

    public hide() {
        this.mapGraph.alpha = 0;
        // console.log('hide ', this.getId());
    }

    public show() {
        this.mapGraph.alpha = 1;
        // console.log('show ', this.getId());
    }

    public isVisible(): boolean {
        return this.mapGraph.alpha === 1;
    }

    public setPolarValues(center: LatLng | { lat: number, lng: number },
                          geoValues: PolarMapValue[],
                          config: PolarLayerConfig,
                          version: string) {
        this.center = new LatLng(center.lat, center.lng);
        this.config.copy(config);
        this.polarDrawer = new PolarDrawer(
            (polar: PolarMapValue) => {
                polar.setCenter({latitude: center.lat, longitude: center.lng});
                const latLng = new LatLng(polar.getLatitude(), polar.getLongitude());
                return this.gridMap.latLngToContainerPoint(latLng);
            },
            (polar: PolarMapValue) => {
                if (this.config.minValueToDisplay > polar.value) {
                    return false;
                }
                polar.setCenter({latitude: center.lat, longitude: center.lng});
                const latLng = new LatLng(polar.getLatitude(), polar.getLongitude());
                return this.gridMap.getBounds().contains(latLng);
            },
            (): number => {
                return this.gridMap.getZoom();
            },
            this.type);

        const optimizations = PolarDrawerOptimization.Defaults();

        this.polarDrawer.setConfiguration(this.config.theme, this.config.range, optimizations);
        this.polarDrawer.updateValues(geoValues, version);
    }

    public render(pixiContainer: Container): number {
        const centerPoint = this.gridMap.latLngToContainerPoint(this.center);
        // console.log('Polar render ', this.polarDrawer.hasChanged(this.center, centerPoint), this.getId());

        if (!this.polarDrawer || !this.polarDrawer.hasChanged(this.center, centerPoint)) {
            return 0;
        }

        this.mapGraph.removeChildren();

        const polar2radians = (polar: PolarGridValue) => {
            let degrees = polar.polarAzimuthInDegrees - 90;
            if (degrees < 0) {
                degrees += 360;
            }
            return degrees * (Math.PI / 180);
        };

        // Debug purpose :
        if (this.addSomeDebugInfos) {
            const optimization = this.polarDrawer.getOptimization();
            const pixiText = new Text('Pol_' + optimization?.type + '_' + this.polarDrawer.getVersion(), {
                fontFamily: 'Arial',
                fontSize: 16,
                fontWeight: 'bold',
                fill: MapTools.hexStringToNumber('#3cff10'),
                align: 'center',
            });
            this.mapGraph.addChild(pixiText);
        }

        const drawPolarSharp = (polar1: PolarGridValue, polar2?: PolarGridValue) => {

            const pixiGraphic = new Graphics();

            if (!polar2) {
                const point1 = polar1.getPositionFrom(centerPoint);
                const polar1alpha = 1 - polar1.getTransparency(this.config.opacity);
                pixiGraphic.lineStyle(10, polar1.getColor(), polar1alpha);
                pixiGraphic.drawCircle(point1.x, point1.y, 1);
                this.mapGraph.addChild(pixiGraphic);
                return true;
            }

            // TODO pixi arc is not working as expected
            const polar1Distance = polar1.getPolarDistanceRelative();
            const polar2Distance = polar2.getPolarDistanceRelative();
            const width = Math.abs(polar2Distance - polar1Distance);
            if (width <= 0) {
                return false;
            }

            const alpha = 1 - polar1.getTransparency(this.config.opacity);

            // pixiGraphic.lineStyle(width, polar1.getColor(), alpha);
            pixiGraphic.lineStyle(1, polar1.getColor(), alpha);
            let rad1 = polar2radians(polar1);
            let rad2 = polar2radians(polar2);
            if (rad1 === rad2 || rad1 === rad2 + 2 * Math.PI) {
                rad1 = 0;
                rad2 = 2 * Math.PI;
            }
            pixiGraphic.arc(0, 0, width / 2, rad1, rad2);
            pixiGraphic.position.x = centerPoint.x;
            pixiGraphic.position.y = centerPoint.y;
            // console.log('polar:', centerPoint, point1, point2);

            this.mapGraph.addChild(pixiGraphic);

            return true;
        };

        const drawCount = this.polarDrawer.renderPolarMapValues(this.center, centerPoint, drawPolarSharp);

        // console.log(this.id, ' drawCount : ', drawCount);
        if (!this.addedInContainer) {
            // console.log(this.id, ' addedInContainer.');
            pixiContainer.addChild(this.mapGraph);
            this.addedInContainer = true;
        }

        return drawCount;
    }

}
