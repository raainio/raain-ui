import {Container} from 'pixi.js';

export interface IPixiUniqueLayer {

    getId(): string;

    hide(): void;

    show(): void;

    isVisible(): boolean;

    render(pixiContainer: Container): number;
}
