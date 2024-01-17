// @ts-ignore
import {PolarMapValue} from '../../src';
import {expect} from 'chai';

describe('PolarMapValue', () => {

    it('should create a basic PolarMapValue without center', async () => {
        const pmv1 = new PolarMapValue(
            12.34, 20, 1000,
            10, `myId`, `myName`);

        expect(pmv1.polarAzimuthInDegrees).eq(20);

        const pmv2 = PolarMapValue.Duplicate(pmv1);
        expect(pmv2.polarAzimuthInDegrees).eq(20);

        pmv2.setPolarDistanceInMeters(22);
        pmv2.setPolarDistanceInMeters(1002);

        // No impact on distance because we didn't set center
        expect(pmv1.distanceTo(pmv2)).eq(0);
    });

    it('should create a conversion PolarMapValue with center', async () => {
        const center = {latitude: 10, longitude: 20};
        const pmv1 = new PolarMapValue(
            12.34, 20, 1000,
            10, `myId`, `myName`);
        pmv1.setCenter(center);
        expect(pmv1.polarAzimuthInDegrees).eq(20);

        const pmv2 = PolarMapValue.Duplicate(pmv1);
        expect(pmv2.polarAzimuthInDegrees).eq(20);

        // No impact on distance same points
        expect(pmv1.distanceTo(pmv2)).eq(0);

        pmv2.setPolarAzimuthInDegrees(22);
        pmv2.setPolarDistanceInMeters(1002);

        // Impact on distance because we did set center AND different polar values
        expect(pmv1.distanceTo(pmv2)).eq(34.996894771987655);
    });

    it('should get distanceTo', async () => {
        const center = {latitude: 10, longitude: 20};
        const pmv1 = new PolarMapValue(
            10, 0, 0,
            0, `myId`, `myName`);
        pmv1.setCenter(center);
        expect(pmv1.polarAzimuthInDegrees).eq(0);

        const pmv2 = PolarMapValue.Duplicate(pmv1);
        pmv2.setPolarAzimuthInDegrees(0);
        pmv2.setPolarDistanceInMeters(100000); // 100km
        expect(Math.round(pmv1.distanceTo(pmv2))).eq(100000);

        pmv2.setPolarAzimuthInDegrees(50); // any angle
        pmv2.setPolarDistanceInMeters(100000); // 100km
        expect(Math.round(pmv1.distanceTo(pmv2))).eq(100000);
    });
});
