import {Point} from 'leaflet';

import {CartesianMapValue, IconMapValue} from '../tools';
import {CartesianDrawer} from './CartesianDrawer';
import {CartesianDrawerOptimization} from './CartesianDrawerOptimization';
import {GridValue} from './GridValue';
import {IconGridValue} from './IconGridValue';

export class IconDrawer extends CartesianDrawer {
    constructor(
        cartesianMap2Points: (mapValue: CartesianMapValue) => {p1: Point; p2: Point},
        cartesianMap2Display: (mapValue: CartesianMapValue) => boolean,
        cartesianMapZoom: () => number,
        type: string
    ) {
        super(cartesianMap2Points, cartesianMap2Display, cartesianMapZoom, type);
        this.optimizations = [new CartesianDrawerOptimization('default', 60000, false, false)];
    }

    protected createGridValue(
        mapValue: IconMapValue,
        points: {p1: Point; p2: Point},
        centerPoint: Point
    ): GridValue {
        return IconGridValue.Create(mapValue, points.p1);
    }
}
