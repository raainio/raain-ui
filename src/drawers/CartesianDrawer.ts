import {LatLng, Point} from 'leaflet';

import {CartesianMapValue} from '../tools/CartesianMapValue';
import {CartesianGridValue} from './CartesianGridValue';
import {MapTools} from '../tools/MapTools';
import {CartesianDrawerOptimization} from './CartesianDrawerOptimization';

export class CartesianDrawer {

    private geoValues: CartesianMapValue[];
    private optimizations: CartesianDrawerOptimization[];
    private distanceRatio: number;
    private centerPoint: Point;

    constructor(private cartesianMap2Points: (mapValue: CartesianMapValue) => { p1: Point, p2: Point },
                private cartesianMap2Display: (mapValue: CartesianMapValue) => boolean,
                private cartesianMapZoom: () => number,
                private type: string) {
        this.geoValues = [];
        this.distanceRatio = 0;
        this.centerPoint = new Point(0, 0);
        this.optimizations = CartesianDrawerOptimization.Defaults();
    }

    public setConfiguration(theme: number,
                            range: number,
                            optimizations: CartesianDrawerOptimization[]): void {
        this.optimizations = optimizations;
    }

    public getOptimization(): CartesianDrawerOptimization {
        const optimizations = this.optimizations.filter((o) => {
            return this.type.toLowerCase().indexOf(o.type.toLowerCase()) > 0;
        });
        if (optimizations.length === 1) {
            return optimizations[0];
        }

        console.warn('no optimization found for cartesian drawer - please consider to use one');
        return CartesianDrawerOptimization.Defaults()[0];
    }

    public updateValues(geoValues: CartesianMapValue[]): void {
        this.geoValues = geoValues;
    }

    public hasChanged(center: LatLng, centerPoint: Point) {
        if (!centerPoint.equals(this.centerPoint)) {
            return true;
        }
        return this.distanceRatio !== this.getDistanceRatio(center);
    }

    public renderCartesianMapValues(center: LatLng, centerPoint: Point,
                                    drawShape: (gridValue: CartesianGridValue) => boolean): number {

        let done = 0;
        const distanceRatio = this.getDistanceRatio(center);
        this.distanceRatio = distanceRatio;
        this.centerPoint = centerPoint;
        const optimization = this.getOptimization();
        const filteredValues = optimization.filteringValues(this.cartesianMapZoom(), this.geoValues, this.cartesianMap2Display);

        for (const mapValue of filteredValues) {
            if (done > optimization.hardLimit) {
                console.log('hard limit reached ', optimization?.hardLimit);
                break;
            }
            const points = this.cartesianMap2Points(mapValue);

            const gridValue = CartesianGridValue.Create(mapValue, points, centerPoint, distanceRatio, optimization);

            if (drawShape(gridValue)) {
                done++;
            }

        }
        return done;
    }

    private getDistanceRatio(centerPoint: LatLng): number {
        const distanceRatio = MapTools.getCartesianDistanceRatio(
            centerPoint,
            this.geoValues,
            this.cartesianMap2Points);
        // console.log('distanceRatio: ', distanceRatio);
        return distanceRatio;
    }

}
