import {LatLng, Point} from 'leaflet';

import {expect} from 'chai';
import {CartesianDrawer, CartesianGridValue, CartesianMapValue, PolarMapValue} from '../../src';

describe('CartesianDrawer', () => {

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

    it('should create a basic CartesianDrawer', async () => {
        const cartesianDrawer = new CartesianDrawer(() => {
                return null;
            }, () => {
                return false;
            },
            'rain');

        expect(cartesianDrawer.renderCartesianMapValues(new LatLng(0, 0), new Point(0, 0), null)).eq(0);
    });

    it('should render a basic PolarMapValues without optimization', async () => {
        const cartesianDrawer = new CartesianDrawer((mapValue: CartesianMapValue) => {
                return {
                    p1: new Point(mapValue.latitude * 100000, mapValue.longitude * 100000),
                    p2: new Point(mapValue.latitude * 100000, mapValue.longitude * 100000)
                };
            }, (mapValue: CartesianMapValue) => {
                return mapValue.value < 5;
            },
            'radar');
        cartesianDrawer.updateValues(polarMapValues);
        const spy = {drawn: 0, values: []};
        const spyDrawing = (gridValue: CartesianGridValue) => {
            spy.drawn++;
            spy.values.push({gridValue});
            return true;
        };
        cartesianDrawer.setConfiguration(0, 0, 40001);

        expect(cartesianDrawer.renderCartesianMapValues(new LatLng(0.001, 0.001), new Point(0, 0), spyDrawing)).eq(50);
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
});

