import {LatLng, Point} from 'leaflet';
import {PolarGridValue} from './PolarGridValue';
import {PolarMapValue} from '../tools/PolarMapValue';
import {PolarDrawerOptimization} from './PolarDrawerOptimization';
import {MapTools} from '../tools/MapTools';

export class PolarDrawer {

    private geoValues: PolarMapValue[];
    private hardLimit: number;
    private optimizations: PolarDrawerOptimization[];
    private possibleDrawing: number;
    private distanceRatio: number;
    private centerPoint: Point;

    constructor(private polarMap2Point: (pv: PolarMapValue) => Point,
                private polarMap2Display: (pv: PolarMapValue) => boolean,
                private type: string) {
        this.geoValues = [];
        this.hardLimit = 40001;
        this.possibleDrawing = 0;
        this.distanceRatio = 0;
        this.centerPoint = new Point(0, 0);
        this.optimizations = [
            new PolarDrawerOptimization('radar', 0.2, 100, 3),
            new PolarDrawerOptimization('rain', 0, 76, 10)];
    }

    public setConfiguration(theme: number,
                            range: number,
                            optimizations: PolarDrawerOptimization[],
                            hardLimit: number): void {
        this.hardLimit = hardLimit;
        this.optimizations = optimizations;
    }

    public updateValues(geoValues: PolarMapValue[]): void {
        this.geoValues = geoValues;
    }

    public hasChanged(center: LatLng, centerPoint: Point) {
        if (!centerPoint.equals(this.centerPoint)) {
            return true;
        }
        if (this.distanceRatio !== this.getDistanceRatio(center, this.getEdgeCount())) {
            return true;
        }
        return this.possibleDrawing !== this.getPossibleDrawing();
    }

    public renderPolarMapValues(center: LatLng, centerPoint: Point,
                                drawPolarSharp: (polar1: PolarGridValue, polar2: PolarGridValue) => boolean): number {

        let done = 0;
        const edgeCount = this.getEdgeCount();
        const distanceRatio = this.getDistanceRatio(center, edgeCount);
        const azimuthStepInDegrees = this.getAzimuthStepInDegrees();
        const optimizationValues: { x1: PolarGridValue, x2: PolarGridValue } = {
            x1: null,
            x2: null
        };
        const optimizations = this.optimizations.filter((o) => {
            return this.type === o.type;
        });
        let optimization = null;
        if (optimizations.length === 1) {
            optimization = optimizations[0];
        } else {
            console.warn('Please consider to set an UI optimization');
        }

        if (distanceRatio <= 0) {
            console.warn('distanceRatio is 0 - no sense ? ', center);
            return 0;
        }

        this.possibleDrawing = this.getPossibleDrawing();
        this.distanceRatio = distanceRatio;
        this.centerPoint = centerPoint;

        for (let i = 0; i < this.geoValues.length; i++) {
            if (done > this.hardLimit) {
                // console.log('hard limit reached ', this.hardLimit);
                break;
            }

            const polarValue = PolarMapValue.Duplicate(this.geoValues[i]);

            polarValue.setCenter({latitude: center.lat, longitude: center.lng});
            // console.log('rendered polarValue : ', polarValue);

            const drawValue = (x1: PolarGridValue, pv2: PolarMapValue, forceDraw?: boolean): boolean => {
                if (!x1 || !pv2) {
                    return false;
                }
                const x2 = PolarGridValue.Create(pv2, distanceRatio, optimization);
                x2.polarAzimuthInDegrees = x1.polarAzimuthInDegrees + azimuthStepInDegrees;

                let drawDone = false;
                if (!forceDraw && x2.getTransparency() === x1.getTransparency()) {
                    // same value => optimize drawing
                    optimizationValues.x2 = x2;
                } else {
                    if (x1.getTransparency() < 1) {
                        drawDone = drawPolarSharp(x1, x2);
                    } else {
                        drawDone = true;
                    }
                    optimizationValues.x2 = null;
                    if (drawDone) {
                        done++;
                    }
                }
                return drawDone;
            };

            if (!this.polarMap2Display(polarValue) || ((i % edgeCount) === (edgeCount - 1))) {
                drawValue(optimizationValues.x1, polarValue, true);
                optimizationValues.x1 = null;
                i = this._getNextOffset(i, edgeCount) - 1;
            } else {
                const drawDone = drawValue(optimizationValues.x1, polarValue);
                if (drawDone || !optimizationValues.x1) {
                    optimizationValues.x1 = PolarGridValue.Create(polarValue, distanceRatio, optimization);
                }
            }
        }

        console.log('Polar done vs possible:', done, this.possibleDrawing);
        return done;
    }

    private getDistanceRatio(center: LatLng, edgeCount: number): number {

        const distanceRatio = MapTools.getPolarDistanceRatio(center, this.geoValues, edgeCount, this.polarMap2Point);
        // console.log('distanceRatio: ', distanceRatio);
        return distanceRatio;
    }

    private getAzimuthStepInDegrees(): number {
        if (this.geoValues.length <= 1) {
            return 360;
        }

        const firstGeoValue = this.geoValues[0];
        let azimuthDiff = 360;
        const sameAzimuth = firstGeoValue.polarAzimuthInDegrees;
        for (const polarValue of this.geoValues) {
            if (sameAzimuth !== polarValue.polarAzimuthInDegrees) {
                azimuthDiff = polarValue.polarAzimuthInDegrees - sameAzimuth;
                break;
            }
        }
        // console.log('azimuthStepInDegrees: ', azimuthDiff);
        return azimuthDiff;
    }

    private getEdgeCount(): number {
        if (this.geoValues.length <= 1) {
            return 1;
        }

        let sameEdgeValuesCount = 0;
        const firstGeoValue = this.geoValues[0];
        for (const polarValue of this.geoValues) {
            if (firstGeoValue.polarAzimuthInDegrees !== polarValue.polarAzimuthInDegrees) {
                break;
            }
            sameEdgeValuesCount++;
        }
        // console.log('sameEdgeValuesCount: ', sameEdgeValuesCount);
        return sameEdgeValuesCount;
    }

    public _getNextOffset(index, edgeCount): number {
        const preciseId = (index + 1) / edgeCount;
        const edgeId = Math.floor(preciseId);

        let newIndex = (edgeId + 1) * edgeCount;
        if (preciseId === edgeId) {
            newIndex = edgeId * edgeCount;
        }
        return newIndex;
    }

    protected getPossibleDrawing() {
        let count = 0;
        for (const mapValue of this.geoValues) {
            if (this.polarMap2Display(mapValue)) {
                count++;
            }
        }
        return count;
    }
}
