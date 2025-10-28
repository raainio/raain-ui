import {Point} from 'leaflet';
import {PolarGridValue} from './PolarGridValue';
import {MapLatLng, MapTools, PolarMapValue} from '../tools';
import {PolarDrawerOptimization} from './PolarDrawerOptimization';
import {IDrawer} from './IDrawer';

export class PolarDrawer implements IDrawer {
    private geoValues: PolarMapValue[];
    private version: string;
    private optimizations: PolarDrawerOptimization[];
    private possibleDrawing: number;
    private distanceRatio: number;
    private centerPoint: Point;

    constructor(
        private polarMap2Point: (pv: PolarMapValue) => Point,
        private polarMap2Display: (pv: PolarMapValue) => boolean,
        private polarMapZoom: () => number,
        private type: string
    ) {
        this.geoValues = [];
        this.possibleDrawing = 0;
        this.distanceRatio = 0;
        this.centerPoint = new Point(0, 0);
        this.optimizations = PolarDrawerOptimization.Defaults();
    }

    public getVersion() {
        return this.version;
    }

    public setConfiguration(
        theme: number,
        range: number,
        optimizations: PolarDrawerOptimization[]
    ): void {
        this.optimizations = optimizations;
    }

    public getOptimization(): PolarDrawerOptimization {
        const optimizations = this.optimizations.filter((o) => {
            return this.type.toLowerCase().indexOf(o.type.toLowerCase()) > 0;
        });
        if (optimizations.length === 1) {
            return optimizations[0];
        }

        // console.warn('no optimization found for polar drawer - please consider to use one');
        return PolarDrawerOptimization.Defaults()[0];
    }

    public updateValues(geoValues: PolarMapValue[], version: string): void {
        this.geoValues = geoValues;
        this.version = version;
    }

    public hasChanged(center: MapLatLng, centerPoint: Point) {
        if (!centerPoint.equals(this.centerPoint)) {
            return true;
        }
        if (this.distanceRatio !== this.getDistanceRatio(centerPoint)) {
            return true;
        }
        return this.possibleDrawing !== this.getPossibleDrawing();
    }

    public getExecOfWindowPoints<T>(
        values: PolarMapValue[],
        fnToApplyToAllPoint: (c: PolarMapValue[]) => T
    ) {
        const filteredValues = values.filter(this.polarMap2Display);
        return fnToApplyToAllPoint(filteredValues);
    }

    public getExecOfVisiblePoints<T>(
        values: PolarMapValue[],
        fnToApplyToAllPoint: (v: PolarMapValue[]) => T
    ) {
        const optimization = this.getOptimization();
        const filteredValues = optimization.filteringValues(
            this.polarMapZoom(),
            values,
            this.polarMap2Display
        );
        return fnToApplyToAllPoint(filteredValues);
    }

    public renderPolarMapValues(
        center: MapLatLng,
        centerPoint: Point,
        drawPolarSharp: (polar1: PolarGridValue, polar2?: PolarGridValue) => boolean
    ): number {
        let done = 0;
        const edgeCount = this.getEdgeCount();
        const distanceRatio = this.getDistanceRatio(centerPoint);
        const azimuthStepInDegrees = this.getAzimuthStepInDegrees();
        const optimizationValues: {x1: PolarGridValue; x2: PolarGridValue} = {
            x1: null,
            x2: null,
        };

        if (distanceRatio <= 0) {
            console.warn('raain-ui >> polar distanceRatio is 0 - no sense ? ', center, centerPoint);
            return 0;
        }

        const optimization = this.getOptimization();
        this.possibleDrawing = this.getPossibleDrawing();
        this.distanceRatio = distanceRatio;
        this.centerPoint = centerPoint;

        const filteredValues = optimization.filteringValues(
            this.polarMapZoom(),
            this.geoValues,
            this.polarMap2Display
        );
        for (let [i, polarValue] of filteredValues.entries()) {
            if (done > optimization.hardLimit) {
                console.warn('raain-ui >> polar hard limit reached ', optimization.hardLimit);
                break;
            }

            polarValue = PolarMapValue.Duplicate(polarValue);
            polarValue.setCenter({latitude: center.lat, longitude: center.lng});

            if (optimization.groupAzimuths()) {
                const drawValue = (
                    x1: PolarGridValue,
                    pv2: PolarMapValue,
                    forceDraw?: boolean
                ): boolean => {
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

                if (!this.polarMap2Display(polarValue)) {
                    drawValue(optimizationValues.x1, polarValue, true);
                    optimizationValues.x1 = null;
                } else if (i % edgeCount === edgeCount - 1) {
                    drawValue(optimizationValues.x1, polarValue, true);
                    optimizationValues.x1 = null;
                    i = this._getNextOffset(i, edgeCount) - 1;
                } else {
                    const drawDone = drawValue(optimizationValues.x1, polarValue);
                    if (drawDone || !optimizationValues.x1) {
                        optimizationValues.x1 = PolarGridValue.Create(
                            polarValue,
                            distanceRatio,
                            optimization
                        );
                    }
                }
            } else {
                const x = PolarGridValue.Create(polarValue, distanceRatio, optimization);
                done += drawPolarSharp(x) ? 1 : 0;
            }
        }

        // console.log('Polar done vs possible:', done, this.possibleDrawing);
        return done;
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
        const nonNullValues = this.geoValues.filter((v) => v.value);
        for (const mapValue of nonNullValues) {
            if (this.polarMap2Display(mapValue)) {
                count++;
            }
        }
        return count;
    }

    private getDistanceRatio(centerPoint: Point): number {
        if (this.geoValues.length < 1) {
            return 0;
        }

        const distanceRatio = MapTools.getPolarDistanceRatio(
            centerPoint,
            this.geoValues[this.geoValues.length - 1],
            this.polarMap2Point
        );
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
        return sameEdgeValuesCount;
    }
}
