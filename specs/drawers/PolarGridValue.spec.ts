import {Point} from 'leaflet';

import {expect} from 'chai';
import {PolarGridValue} from '../../src';

describe('PolarGridValue', () => {


    it('should getPositionFrom az=0', async () => {

        const polarGridValue = new PolarGridValue(12, 0.5, 0, 1000);
        let origin = new Point(0, 0);
        expect(polarGridValue.getPositionFrom(origin).x).eq(0);
        expect(polarGridValue.getPositionFrom(origin).y).eq(-1000);

        origin = new Point(10, 20);
        expect(polarGridValue.getPositionFrom(origin).x).eq(10);
        expect(polarGridValue.getPositionFrom(origin).y).eq(-980);
    });

    it('should getPositionFrom az=90', async () => {
        const polarGridValue = new PolarGridValue(12, 0.5, 90, 1000);
        let origin = new Point(0, 0);
        expect(polarGridValue.getPositionFrom(origin).x).eq(1000);
        expect(polarGridValue.getPositionFrom(origin).y).eq(0);

        origin = new Point(10, 30);
        expect(polarGridValue.getPositionFrom(origin).x).eq(1010);
        expect(polarGridValue.getPositionFrom(origin).y).eq(30);
    });
});

