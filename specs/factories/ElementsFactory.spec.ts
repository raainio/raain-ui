import {expect} from 'chai';
import {JSDOM} from 'jsdom';
import {
    CompareElementInput,
    DateRange,
    DynamicDateStatusElementInput,
    EarthMapElementInput,
    ElementsFactory,
    MapElementInput
} from '../../src';

describe('Factories.ElementsFactory', () => {

    beforeEach(() => {
    });

    it('should createCompare', async () => {
        const fakeDom = new JSDOM(`<!DOCTYPE html><canvas id="myChart" width="400" height="400"></canvas>`);
        const canvasElement = fakeDom.window.document.querySelector('#myChart');
        (canvasElement as any).getContext = () => {
            return {};
        };
        const ef = new ElementsFactory();

        const created = ef.createCompare(canvasElement as HTMLCanvasElement, new CompareElementInput());
        expect(created).not.eq(undefined);
    });

    it('should createDynamicDateStatus', async () => {
        const fakeDom = new JSDOM(`<!DOCTYPE html><canvas id="dynamicDate" width="400" height="400"></canvas>`);
        const canvasElement = fakeDom.window.document.querySelector('#dynamicDate');
        (canvasElement as any).getContext = () => {
            return {};
        };
        const ef = new ElementsFactory();

        // DynamicDateStatusElementInput is an interface, not a class
        const input = new DynamicDateStatusElementInput(async (focusDate: Date, focusRange: DateRange) => {
            return [
                {
                    label: 'Test Data',
                    style: 'line',
                    values: [
                        {date: new Date(), value: 10}
                    ]
                }
            ];
        });

        const created = ef.createDynamicDateStatus(canvasElement as HTMLCanvasElement, input);
        expect(created).not.eq(undefined);
    });

    it('should createMap', async () => {
        // We need to stub the build method to avoid Leaflet map creation
        // which doesn't work well in JSDOM environment
        const originalBuild = require('../../src/factories/MapElement').MapElement.prototype.build;
        require('../../src/factories/MapElement').MapElement.prototype.build = () => {
            // Do nothing, just a stub
        };

        try {
            const fakeDom = new JSDOM(`<!DOCTYPE html><div id="map"></div>`);
            const divElement = fakeDom.window.document.querySelector('#map');
            (divElement as any).getContext = () => {
                return {};
            };

            const ef = new ElementsFactory();

            const mapInput = new MapElementInput(); // MapElementInput is a class with constructor
            const created = ef.createMap(divElement as HTMLElement, mapInput);
            expect(created).not.eq(undefined);
        } finally {
            // Restore the original's method
            require('../../src/factories/MapElement').MapElement.prototype.build = originalBuild;
        }
    });

    xit('should createEarthMap', async () => {

        const fakeDom = new JSDOM(`<!DOCTYPE html><div id="earthMap"></div>`);
        const divElement = fakeDom.window.document.querySelector('#earthMap');
        const ef = new ElementsFactory();

        const earthMapInput = new EarthMapElementInput(''); // EarthMapElementInput is an interface, not a class
        const created = ef.createEarthMap(divElement as HTMLElement, earthMapInput);
        expect(created).not.eq(undefined);
    });
});
