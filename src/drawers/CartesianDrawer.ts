import {LatLng, Point} from 'leaflet';

import {CartesianMapValue} from '../tools/CartesianMapValue';
import {CartesianGridValue} from './CartesianGridValue';
import {MapTools} from '../tools/MapTools';

export class CartesianDrawer {

    private geoValues: CartesianMapValue[];
    private hardLimit: number;
    private distanceRatio: number;
    private centerPoint: Point;

    constructor(private cartesianMap2Points: (mapValue: CartesianMapValue) => { p1: Point, p2: Point },
                private cartesianMap2Display: (mapValue: CartesianMapValue) => boolean,
                private bypassColor: boolean) {
        this.geoValues = [];
        this.hardLimit = 250001; // 40001 ? 250001 ?
        this.distanceRatio = 0;
        this.centerPoint = new Point(0, 0);
    }

    public setConfiguration(theme: number,
                            range: number,
                            hardLimit: number): void {
        this.hardLimit = hardLimit;
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

        for (const mapValue of this.geoValues) {
            if (done > this.hardLimit) {
                console.log('hard limit reached ', this.hardLimit);
                break;
            }

            if (this.cartesianMap2Display(mapValue)) {

                const points = this.cartesianMap2Points(mapValue);

                const gridValue = CartesianGridValue.Create(mapValue, points, centerPoint, distanceRatio, this.bypassColor);

                if (drawShape(gridValue)) {
                    done++;
                }

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
