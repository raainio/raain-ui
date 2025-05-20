import {Application, Graphics, Text} from 'pixi.js';
import {MapTools} from '../tools/MapTools';

export class SpeedMatrixElementInput {
    constructor(
        public positionValuesMatrix: Array<{ x: number, y: number, value: number }>,
        public trustIndicator: number = 1
    ) {
    }
}

export class SpeedMatrixElement {

    public pixiApp: Application;

    constructor(protected addSomeDebugInfos = false) {
    }

    public build(element: HTMLCanvasElement, inputs: SpeedMatrixElementInput): void {

        const wh = 10;
        let minX, maxX, minY, maxY, minValue, maxValue;
        for (const value of inputs.positionValuesMatrix) {
            if (!minX || minX !== Math.min(value.x, minX)) {
                minX = value.x;
            }
            if (!maxX || maxX !== Math.max(value.x, maxX)) {
                maxX = value.x;
            }
            if (!minY || minY !== Math.min(value.x, minY)) {
                minY = value.y;
            }
            if (!maxY || maxY !== Math.max(value.x, maxY)) {
                maxY = value.y;
            }
            if (!minValue || minValue !== Math.min(value.value, minValue)) {
                minValue = value.value;
            }
            if (!maxValue || maxValue !== Math.max(value.value, maxValue)) {
                maxValue = value.value;
            }
        }
        const width = maxX - minX + 1;
        const height = maxY - minY + 1;
        const range = maxValue - minValue;

        this.pixiApp = new Application({
            width: width * wh,
            height: height * wh,
            view: element,
            // antialias: true,
            backgroundColor: MapTools.hexStringToNumber('#FFFFFF')
        });
        this.pixiApp.stage.removeChildren();

        const translateX = x => {
            const v = (x - minX) * wh;
            return v;
        };
        const translateY = y => {
            const v = (maxY - minY - (y - minY)) * wh;
            return v;
        };
        const translateColor = value => {
            const valueOpt = maxValue ? value / maxValue : 0;
            if (valueOpt >= 1) {
                return '#01d331';
            } else if (valueOpt >= 0.85) {
                return '#1bc041';
            } else if (valueOpt >= 0.7) {
                return '#30a64b';
            } else if (valueOpt >= 0.55) {
                return '#3f884f';
            } else if (valueOpt >= 0.4) {
                return '#487953';
            } else if (valueOpt >= 0.25) {
                return '#4b6751';
            } else if (valueOpt >= 0.1) {
                return '#48544a';
            }
            return '#484848';
        };

        const pixiGraphic = new Graphics();
        pixiGraphic.lineStyle(0); // 2, hexStringToNumber('#FEEB77'), 1);
        for (const value of inputs.positionValuesMatrix) {
            pixiGraphic.beginFill(MapTools.hexStringToNumber(translateColor(value.value)));
            pixiGraphic.drawRect(translateX(value.x), translateY(value.y), wh, wh);
            pixiGraphic.endFill();
        }

        let message = ' ';
        if (inputs.trustIndicator < 0.5) {
            message = 'No trust in ' + inputs.trustIndicator;
        }

        const pixiText = new Text(message, {
            fontFamily: 'Arial',
            fontSize: 20,
            fill: 0xff1010,
            align: 'center',
        });
        pixiGraphic.addChild(pixiText);

        this.pixiApp.stage.addChild(pixiGraphic);
    }

}
