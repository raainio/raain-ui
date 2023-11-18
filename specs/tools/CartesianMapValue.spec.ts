// @ts-ignore
import {CartesianMapValue, PolarMapValue} from '../../src';
import {expect} from 'chai';
import {Converter, LatLng} from 'raain-quality';
import {MeasureValuePolarContainer, PolarMeasureValue} from 'raain-model';

describe('CartesianMapValue', () => {

    it('should ConvertFromPolar from simple image', async () => {

        // prepare
        const center = new LatLng(1, 1);
        const measureValuePolarContainers = [
            new MeasureValuePolarContainer(0, 1000, [1, 2]),
            new MeasureValuePolarContainer(180, 1000, [1, 2]),
        ];
        const polarMeasureValue = new PolarMeasureValue(measureValuePolarContainers);
        const converterFromPolar = new Converter(center, polarMeasureValue);

        // test
        const cartesianMapValues = CartesianMapValue.ConvertFromPolar(converterFromPolar, 4);

        // verify
        expect(cartesianMapValues.length).eq(81);
        const nonNull = cartesianMapValues.filter(v => v.value);
        expect(nonNull.length).eq(25);
        expect(cartesianMapValues[20]).eq(nonNull[0]);
        expect(JSON.stringify(cartesianMapValues[20])).eq(JSON.stringify({
            id: undefined,
            name: undefined,
            lat: 0.98201,
            lng: 0.98201,
            value: 2,
            latitude: 0.98201,
            longitude: 0.98201,
            latitude2: 0.9910032160591875,
            longitude2: 0.9910045859781755
        }));
    });

    it('should ConvertFromPolar from same simple image but different canvas', async () => {

        // prepare
        const center = new LatLng(1, 1);
        const measureValuePolarContainers = [
            new MeasureValuePolarContainer(0, 1000, [1, 2]),
            new MeasureValuePolarContainer(180, 1000, [1, 2]),
        ];
        const polarMeasureValue = new PolarMeasureValue(measureValuePolarContainers);
        const converterFromPolar = new Converter(center, polarMeasureValue);

        // test
        const cartesianMapValues = CartesianMapValue.ConvertFromPolar(converterFromPolar, 40);

        // verify
        expect(cartesianMapValues.length).eq(6561);
        const nonNull = cartesianMapValues.filter(v => v.value);
        expect(nonNull.length).eq(25);
    });

    it('should ConvertFromPolar in a realistic situation', async () => {

        // prepare
        const center = new LatLng(1, 1);
        const distanceInKm = 250;
        const measureValuePolarContainers = [];
        for (let azimuth = 0; azimuth < 360; azimuth++) {
            const polarEdges = [];
            for (let edge = 0; edge < distanceInKm; edge++) {
                polarEdges.push(distanceInKm - edge);
            }
            measureValuePolarContainers.push(new MeasureValuePolarContainer(azimuth, 1000, polarEdges));
        }
        const polarMeasureValue = new PolarMeasureValue(measureValuePolarContainers);
        const converterFromPolar = new Converter(center, polarMeasureValue);

        // test
        const cartesianMapValues = CartesianMapValue.ConvertFromPolar(converterFromPolar, distanceInKm);

        // verify
        expect(cartesianMapValues.length).eq(251001);
        const nonNull = cartesianMapValues.filter(v => v.value);
        expect(nonNull.length).eq(197909);
        expect(cartesianMapValues[231]).eq(nonNull[0]);
        expect(JSON.stringify(cartesianMapValues[231])).eq(JSON.stringify({
                id: undefined,
                name: undefined,
                lat: 0.8284,
                lng: -1.24854,
                value: 1,
                latitude: 0.8284,
                longitude: -1.24854,
                latitude2: 0.8373932160591875,
                longitude2: -1.2395454140218245
            }
        ));
    }).timeout(10000);
});
