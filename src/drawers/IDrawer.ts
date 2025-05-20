export interface IDrawer {
    getExecOfWindowPoints(values: any, fnToApplyToAllPoint: (c: any) => any): any;

    getExecOfVisiblePoints(values: any, fnToApplyToAllPoint: (c: any) => any): any;
}
