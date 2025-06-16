import {Application, Container} from 'pixi.js';
import {CartesianMapValue, MapLatLng, PolarMapValue} from '../tools';
import {PolarLayerConfig} from './PolarLayerConfig';
import {IDrawer} from '../drawers/IDrawer';

export interface IPixiUniqueLayer {
    getId(): string;

    hide(): void;

    show(alpha?: number): void;

    isVisible(): boolean;

    setValues(
        center: MapLatLng | {lat: number; lng: number},
        values: PolarMapValue[] | CartesianMapValue[],
        config: PolarLayerConfig | any,
        version: string
    ): void;

    render(pixiContainer: Container): number;

    setPixiApp(pixiApp: Application): void;

    getDrawer(): IDrawer;
}
