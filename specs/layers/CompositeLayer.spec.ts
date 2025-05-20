import {expect} from 'chai';
import {JSDOM} from 'jsdom';
import {CartesianMapValue, CompositeLayer, IconLayer, IconMapValue} from '../../src';
import {Point} from 'leaflet';

describe('Layers.CompositeLayer', () => {
    const createIconValues = () => {
        const values = [];
        for (let latitude = -1; latitude < 1; latitude += 0.1) {
            for (let longitude = -1; longitude < 1; longitude += 0.1) {
                const speed = 8 * Math.random();
                const angle = 360 * Math.random();
                const mapValue = new IconMapValue(latitude, longitude, speed, angle, 'id' + Math.random(), 'name?');
                values.push(mapValue);
            }
        }
        return values;
    };

    beforeEach(() => {
    });

    it('should addLayer and play with points', async () => {
        const fakeDom = new JSDOM(`<!DOCTYPE html><canvas id="myChart" width="400" height="400"></canvas>`);
        const canvasElement = fakeDom.window.document.querySelector('#myChart');
        (canvasElement as any).getContext = () => {
            return {};
        };
        CompositeLayer.prototype._initializeLayer = () => {
        };

        const compositeLayer = new CompositeLayer('testComposite', 200, 100);
        const gridMap: any = {
            latLngToContainerPoint: ll => new Point(1, 1),
            getBounds: a => {
                return {contains: mv => true};
            },
            getZoom: a => 2,
        };
        const iconLayer1 = new IconLayer('testIcon1', 'iconType', gridMap, true);
        const iconLayer2 = new IconLayer('testIcon2', 'iconType', gridMap, true);
        iconLayer1.setValues({lat: 1, lng: 2}, createIconValues(), null, 'v');

        compositeLayer.addLayer(iconLayer1);
        compositeLayer.addLayer(iconLayer2);

        let shown = compositeLayer.show('testIcon');
        expect(shown.length).eq(2);
        expect(shown[0].getId()).eq('testIcon1');
        expect(shown[1].getId()).eq('testIcon2');

        shown = compositeLayer.show('none');
        expect(shown.length).eq(0);

        compositeLayer.bringToBack();

        const drawer = compositeLayer.getFirstDrawer();
        expect(drawer.getExecOfVisiblePoints([
            new CartesianMapValue(3, 1.1, 1.2, 1.1, 1.2, 'id1', 'name'),
            new CartesianMapValue(4, 1.2, 1.2, 1.2, 1.2, 'id2', 'name'),
            new CartesianMapValue(0, 1.3, 1.2, 1.3, 1.2, 'id3_filtered', 'name'),
        ], p => p.length)).eq(2);
    });
});
