import {Point} from 'leaflet';
import {expect} from 'chai';
import {MapLatLng, PolarDrawer, PolarDrawerOptimization, PolarGridValue, PolarMapValue} from '../../src';

describe('Drawers.PolarDrawer', () => {

    const polarMapValues: PolarMapValue[] = [];
    const width = 10;
    const azimuthStep = 10;
    const isOdd = (num) => {
        return num % 2;
    };
    for (let azimuthInDegrees = 0; azimuthInDegrees < 360; azimuthInDegrees += azimuthStep) {
        for (let distance = 0; distance < width; distance++) {
            const value = isOdd(distance) ? distance : 0;
            polarMapValues.push(new PolarMapValue(
                value, azimuthInDegrees, distance * 1000, 0,
                `${distance * azimuthInDegrees}`, `${distance * azimuthInDegrees}`));
        }
    }

    it('should create a basic PolarDrawer', async () => {
        const polarDrawer = new PolarDrawer(() => {
                return null;
            }, () => {
                return false;
            },
            () => {
                return 1;
            },
            'rain');

        expect(polarDrawer.renderPolarMapValues(new MapLatLng(0, 0), new Point(0, 0), null)).eq(0);
    });

    it('should getNextOffset', async () => {
        const polarDrawer = new PolarDrawer(() => {
                return null;
            }, () => {
                return false;
            },
            () => {
                return 1;
            },
            'rain');
        polarDrawer.updateValues(polarMapValues, 'version');

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
        // scenario
        const polarDrawer = new PolarDrawer((pm: PolarMapValue) => {
                return new Point(pm.getLatitude() * 100000, pm.getLongitude() * 100000);
            },
            (pmv: PolarMapValue) => {
                return pmv.value < 5;
            },
            () => {
                return 9;
            },
            'radar');
        polarDrawer.updateValues(polarMapValues, 'version');
        const spy = {drawn: 0, values: []};
        const spyDrawing = (pg1: PolarGridValue, pg2?: PolarGridValue) => {
            spy.drawn++;
            spy.values.push({
                d1: pg1.getPolarDistanceRelative(), a1: pg1.polarAzimuthInDegrees,
                d2: pg2?.getPolarDistanceRelative(), a2: pg2?.polarAzimuthInDegrees,
                v: pg1.getTransparency()
            });
            return true;
        };

        // render
        const rendered = polarDrawer.renderPolarMapValues(
            new MapLatLng(0.001, 0.001),
            new Point(0.1, 0.1),
            spyDrawing);

        // verify
        expect(rendered).eq(72);
        expect(spy.drawn).eq(72);
        expect(spy.values.length).eq(72);

        expect(spy.values[0]).deep.equal({d1: 0.02, a1: 0, d2: undefined, a2: undefined, v: 0.5});
    });

    it('should render a basic PolarMapValues with optimization', async () => {
        const polarDrawer = new PolarDrawer((pm: PolarMapValue) => {
                return new Point(pm.getLatitude() * 100000, pm.getLongitude() * 100000);
            },
            (pmv: PolarMapValue) => {
                return pmv.value < 5;
            },
            () => {
                return 9;
            },
            'rain with zoom');
        polarDrawer.updateValues(polarMapValues, 'version');
        const spy = {drawn: 0, values: []};
        const spyDrawing = (pg1: PolarGridValue, pg2?: PolarGridValue) => {
            spy.drawn++;
            spy.values.push({
                d1: pg1.getPolarDistanceRelative(), a1: pg1.polarAzimuthInDegrees,
                d2: pg2?.getPolarDistanceRelative(), a2: pg2?.polarAzimuthInDegrees,
                v: pg1.getTransparency()
            });
            return true;
        };

        const optimizations = [
            new PolarDrawerOptimization('zoom', 40001, 0, 9, 2, false, true)
        ];
        polarDrawer.setConfiguration(0, 0, optimizations);

        // render
        const rendered = polarDrawer.renderPolarMapValues(
            new MapLatLng(0.001, 0.001),
            new Point(0.1, 0.1),
            spyDrawing);

        // verify
        expect(rendered).eq(36);
        expect(spy.drawn).eq(36);
        expect(spy.values.length).eq(36);

        expect(spy.values[0]).deep.equal({
            d1: 0.02,
            a1: 0,
            v: 0.5,
            d2: undefined,
            a2: undefined
        });
    });
});
