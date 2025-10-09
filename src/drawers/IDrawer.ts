import {CartesianMapValue, PolarMapValue} from '../tools';

export interface IDrawer {
    getExecOfWindowPoints<T>(
        values: CartesianMapValue[] | PolarMapValue[],
        fnToApplyToAllPoint: (c: CartesianMapValue[] | PolarMapValue[]) => T
    ): T;

    getExecOfVisiblePoints<T>(
        values: CartesianMapValue[] | PolarMapValue[],
        fnToApplyToAllPoint: (c: CartesianMapValue[] | PolarMapValue[]) => T
    ): T;
}
