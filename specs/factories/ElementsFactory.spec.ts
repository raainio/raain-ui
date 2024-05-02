import {expect} from 'chai';
import {JSDOM} from 'jsdom';
import {CompareElementInput, ElementsFactory} from '../../src';

describe('Factories.ElementsFactory', () => {

    beforeEach(() => {
    });

    it('should createCompare', async () => {
        const fakeDom = new JSDOM(`<!DOCTYPE html><canvas id="myChart" width="400" height="400"></canvas>`);
        const canvasElement = fakeDom.window.document.querySelector('#myChart');
        canvasElement.getContext = () => {
            return {};
        };
        const ef = new ElementsFactory();

        const created = ef.createCompare(canvasElement, new CompareElementInput());
        expect(created).not.eq(undefined);
    });
});
