import {LatLng, Point} from 'leaflet';

import {expect} from 'chai';
import {CartesianDrawer, CartesianGridValue, CartesianMapValue} from '../../src';
import {CartesianDrawerOptimization} from '../../src/drawers/CartesianDrawerOptimization';

describe('CartesianDrawer', () => {

    const cartesianMapValues: CartesianMapValue[] = [];
    const step = 0.2;
    for (let lat = -1; lat <= 1; lat += step) {
        for (let lng = -1; lng <= 1; lng += step) {
            cartesianMapValues.push(new CartesianMapValue(lat * lng, lat, lng, lat + step, lng + step,
                `id_${lat}_${lng}`, `name_${lat}_${lng}`));
        }
    }

    it('should create a basic CartesianDrawer', async () => {
        const cartesianDrawer = new CartesianDrawer(() => {
                return null;
            }, () => {
                return false;
            },
            () => {
                return 1;
            },
            'basic');

        expect(cartesianDrawer.renderCartesianMapValues(new LatLng(0, 0), new Point(0, 0), null)).eq(0);
    });

    it('should render a basic CartesianMapValue without optimization', async () => {
        // scenario
        const cartesianDrawer = new CartesianDrawer((mapValue: CartesianMapValue) => {
                return {
                    p1: new Point(mapValue.latitude * 1000, mapValue.longitude * 1000),
                    p2: new Point(mapValue.latitude * 1000 + 1, mapValue.longitude * 1000 + 1)
                };
            }, (mapValue: CartesianMapValue) => {
                return mapValue.value < 5;
            },
            () => {
                return 0.5;
            },
            'without optim');
        cartesianDrawer.updateValues(cartesianMapValues, 'version');
        const spy = {drawn: 0, values: []};
        const spyDrawing = (gridValue: CartesianGridValue) => {
            spy.drawn++;
            spy.values.push({gridValue});
            return true;
        };

        // render
        const rendered = cartesianDrawer.renderCartesianMapValues(
            new LatLng(0.001, 0.001),
            new Point(0, 0),
            spyDrawing);

        // verify
        expect(rendered).eq(18);
        expect(spy.drawn).eq(18);
        expect(spy.values.length).eq(18);

        expect(spy.values[0]).deep.equal({
            gridValue: {
                color: 52985,
                height: 1,
                id: '1',
                transparency: 0.65,
                width: 1,
                x: -1000,
                y: -1000,
            }
        });
    });

    it('should render a basic CartesianMapValue with optimization', async () => {
        // scenario
        const cartesianDrawer = new CartesianDrawer((mapValue: CartesianMapValue) => {
                const result = {
                    p1: new Point(mapValue.latitude * 1000, mapValue.longitude * 1000),
                    p2: new Point(mapValue.latitude * 1000, mapValue.longitude * 1000)
                };
                return result;
            }, (mapValue: CartesianMapValue) => {
                return mapValue.value < 5;
            },
            () => {
                return 9;
            },
            'withOptim');
        cartesianDrawer.updateValues(cartesianMapValues, 'version');
        const spy = {drawn: 0, values: []};
        const spyDrawing = (gridValue: CartesianGridValue) => {
            spy.drawn++;
            spy.values.push({gridValue});
            return true;
        };
        cartesianDrawer.setConfiguration(0, 0,
            [new CartesianDrawerOptimization('optim', 40001, false, true)]);

        // render
        const rendered = cartesianDrawer.renderCartesianMapValues(new LatLng(0.001, 0.001), new Point(0, 0), spyDrawing);

        // verify
        expect(spy.drawn).eq(18);
        expect(spy.values.length).eq(18);

        expect(spy.values[0]).deep.equal({
            gridValue: {
                color: 52985,
                height: 0,
                id: '1',
                transparency: 0.65,
                width: 0,
                x: -1000,
                y: -1000,
            }
        });
    });
});

