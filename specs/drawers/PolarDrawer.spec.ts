import {LatLng, Point} from 'leaflet';

import {expect} from "chai";
import {PolarDrawer, PolarDrawerOptimization, PolarMapValue} from '../../src';

describe('PolarDrawer', () => {

    const polarMapValues = [];
    const step = 10;
    const azimuthStep = 360 / step;
    for (let azimuthInDegrees = 0; azimuthInDegrees < 360; azimuthInDegrees += azimuthStep) {
        for (let distance = 0; distance < step; distance++) {
            polarMapValues.push(new PolarMapValue(
                distance, azimuthInDegrees, distance * 1000, 0,
                `${distance * azimuthInDegrees}`, `${distance * azimuthInDegrees}`));
        }
    }

    it('should create a basic PolarDrawer', async () => {
        const polarDrawer = new PolarDrawer(() => {
                return null;
            }, () => {
                return false;
            },
            'rain');

        expect(polarDrawer.renderPolarMapValues(new LatLng(0, 0), new Point(0, 0), null)).eq(0);
    });

    it('should getNextOffset', async () => {
        const polarDrawer = new PolarDrawer(() => {
                return null;
            }, () => {
                return false;
            },
            'rain');
        polarDrawer.updateValues(polarMapValues);

        expect(polarDrawer._getNextOffset(0, 10)).eq(10);
        expect(polarDrawer._getNextOffset(3, 10)).eq(10);
        expect(polarDrawer._getNextOffset(9, 10)).eq(10);
        expect(polarDrawer._getNextOffset(10, 10)).eq(20);
        expect(polarDrawer._getNextOffset(11, 10)).eq(20);
        expect(polarDrawer._getNextOffset(19, 10)).eq(20);
        expect(polarDrawer._getNextOffset(20, 10)).eq(30);
        expect(polarDrawer._getNextOffset(22, 10)).eq(30);
        expect(polarDrawer._getNextOffset(99, 10)).eq(100);
        expect(polarDrawer._getNextOffset(100, 10)).eq(110);
        expect(polarDrawer._getNextOffset(101, 10)).eq(110);
    });

    it('should render a basic PolarMapValues without optimization', async () => {
        const polarDrawer = new PolarDrawer((pm: PolarMapValue) => {
                return new Point(pm.getLatitude() * 100000, pm.getLongitude() * 100000);
            }, (pmv: PolarMapValue) => {
                return pmv.value < 5;
            },
            'radar');
        polarDrawer.updateValues(polarMapValues);
        const spy = {drawn: 0, values: []};
        const spyDrawing = (pg1, pg2) => {
            spy.drawn++;
            spy.values.push({
                d1: pg1.getPolarDistance(), a1: pg1.polarAzimuthInDegrees,
                d2: pg2.getPolarDistance(), a2: pg2.polarAzimuthInDegrees,
                v: pg1.getTransparency()
            });
            return true;
        };
        const optimizations = [new PolarDrawerOptimization('radar', 0, 9, 1)];
        polarDrawer.setConfiguration(0, 0, optimizations, 40001);

        expect(polarDrawer.renderPolarMapValues(new LatLng(0.001, 0.001), new Point(0, 0), spyDrawing)).eq(50);
        expect(spy.drawn).eq(50);
        expect(spy.values.length).eq(50);

        expect(spy.values[0]).deep.equal({d1: 0, a1: 0, d2: 38, a2: 36, v: 0.5});
        expect(spy.values[1]).deep.equal({d1: 38, a1: 0, d2: 76, a2: 36, v: 0.85});
        expect(spy.values[4]).deep.equal({d1: 0, a1: 36, d2: 38, a2: 72, v: 0.9});
        expect(spy.values[5]).deep.equal({d1: 38, a1: 36, d2: 76, a2: 72, v: 0.85});
        expect(spy.values[6]).deep.equal({d1: 76, a1: 36, d2: 153, a2: 72, v: 0.8});
        expect(spy.values[9]).deep.equal({d1: 38, a1: 72, d2: 76, a2: 108, v: 0.85});
        expect(spy.values[10]).deep.equal({d1: 76, a1: 72, d2: 153, a2: 108, v: 0.8});
    });

    it('should render a basic PolarMapValues with optimization', async () => {
        const polarDrawer = new PolarDrawer((pm: PolarMapValue) => {
                return new Point(pm.getLatitude() * 100000, pm.getLongitude() * 100000);
            }, (pmv: PolarMapValue) => {
                return pmv.value < 5;
            },
            'radar');
        polarDrawer.updateValues(polarMapValues);
        const spy = {drawn: 0, values: []};
        const spyDrawing = (pg1, pg2) => {
            spy.drawn++;
            spy.values.push({
                d1: pg1.getPolarDistance(), a1: pg1.polarAzimuthInDegrees,
                d2: pg2.getPolarDistance(), a2: pg2.polarAzimuthInDegrees,
                v: pg1.getTransparency()
            });
            return true;
        };

        const optimizations = [new PolarDrawerOptimization('radar', 0, 9, 2)];
        polarDrawer.setConfiguration(0, 0, optimizations, 40001);

        expect(polarDrawer.renderPolarMapValues(new LatLng(0.001, 0.001), new Point(0, 0), spyDrawing)).eq(30);
        expect(spy.drawn).eq(30);
        expect(spy.values.length).eq(30);

        expect(spy.values[0]).deep.equal({d1: 0, a1: 0, d2: 76, a2: 36, v: 0.5});
        expect(spy.values[1]).deep.equal({d1: 38, a1: 0, d2: 76, a2: 36, v: 0.85});
        expect(spy.values[4]).deep.equal({d1: 0, a1: 36, d2: 38, a2: 72, v: 0.9});
        expect(spy.values[5]).deep.equal({d1: 38, a1: 36, d2: 76, a2: 72, v: 0.85});
        expect(spy.values[6]).deep.equal({d1: 76, a1: 36, d2: 153, a2: 72, v: 0.8});
        expect(spy.values[9]).deep.equal({d1: 38, a1: 72, d2: 76, a2: 108, v: 0.85});
        expect(spy.values[10]).deep.equal({d1: 76, a1: 72, d2: 153, a2: 108, v: 0.8});
    });
});

