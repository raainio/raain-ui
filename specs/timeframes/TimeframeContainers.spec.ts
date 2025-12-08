import {expect} from 'chai';
import {
    CartesianMeasureValue,
    CartesianTools,
    CartesianValue,
    MeasureValuePolarContainer,
    MergeStrategy,
    PolarMeasureValue,
    RadarMeasure,
    RadarNodeMap,
    RadarPolarMeasureValue,
    RainComputationMap,
    RainMeasure,
} from 'raain-model';
import {TimeframeContainers} from '../../src';

describe('Timeframes.TimeframeContainers', () => {
    it('should create a basic TimeframeContainers', async () => {
        const timeframeContainers = new TimeframeContainers([]);

        expect(timeframeContainers.containers.length).eq(0);
    });

    it('should create from raain model RadarNodeMap', async () => {
        const timeframeContainers = new TimeframeContainers([]);

        const measureValuePolarContainer = new MeasureValuePolarContainer({
            azimuth: 0,
            distance: 1,
            polarEdges: [33, 45.5],
        });
        const radarPolarMeasureValue = new RadarPolarMeasureValue({
            polarMeasureValue: new PolarMeasureValue({
                measureValuePolarContainers: [measureValuePolarContainer],
                azimuthsCount: 720,
                polarEdgesCount: 250,
            }),
            angle: 0.4,
            axis: 0,
        });
        const radarMeasure1 = new RadarMeasure({
            id: 'rm1',
            date: new Date(),
            values: [radarPolarMeasureValue],
        });
        const radarNodeMap1 = new RadarNodeMap({
            id: 'r1',
            name: 'radarName.polar',
            description: '...',
            date: new Date(),
            team: null,
            map: [],
            latitude: 10,
            longitude: 20,
        });
        radarNodeMap1.setMapData([radarMeasure1, radarMeasure1]);

        timeframeContainers.addFromRadarNodeMap(radarNodeMap1, true);
        expect(timeframeContainers.containers.length).eq(1);
        expect(timeframeContainers.containers[0].name).eq('radarName.polar');

        const cartesianValue1 = new CartesianValue({value: 123, lat: 10, lng: 20});
        const cartesianValue2 = new CartesianValue({value: 321, lat: 11, lng: 21});
        const cartesianMeasureValue = new CartesianMeasureValue({
            cartesianValues: [cartesianValue1, cartesianValue2],
        });
        const radarMeasure2 = new RadarMeasure({
            id: 'rm1',
            date: new Date(),
            values: [cartesianMeasureValue],
        });
        const radarNodeMap2 = new RadarNodeMap({
            id: 'r1',
            name: 'radarName.cartesian',
            description: '...',
            date: new Date(),
            team: null,
            map: [],
            latitude: 10,
            longitude: 20,
        });
        radarNodeMap2.setMapData([radarMeasure2]);

        timeframeContainers.addFromRadarNodeMap(radarNodeMap2, false);
        expect(timeframeContainers.containers.length).eq(2);
        expect(timeframeContainers.containers[1].name).eq('radarName.cartesian');
        expect(timeframeContainers.containers[1].timeframe.length).eq(1);

        const cartesianMapValues = timeframeContainers.getCumulativeCartesianValues();
        expect(cartesianMapValues.length).eq(1);
        expect(cartesianMapValues[0].value).eq(123 * 9);
    });

    it('should create from raain model RainComputationMap', async () => {
        const timeframeContainers = new TimeframeContainers([]);

        const measureValuePolarContainer = new MeasureValuePolarContainer({
            azimuth: 0,
            distance: 1,
            polarEdges: [33, 45.5],
        });
        const radarPolarMeasureValue = new RadarPolarMeasureValue({
            polarMeasureValue: new PolarMeasureValue({
                measureValuePolarContainers: [measureValuePolarContainer],
                azimuthsCount: 720,
                polarEdgesCount: 250,
            }),
            angle: 0.4,
            axis: 0,
        });
        const rainMeasure1 = new RainMeasure({
            id: 'rm1',
            date: new Date(),
            values: [radarPolarMeasureValue],
        });
        const rainComputationMap1 = new RainComputationMap({
            id: 'r1',
            date: new Date(),
            map: [],
            isReady: true,
        });
        const cartesianTools = new CartesianTools();
        rainComputationMap1.setMapData([rainMeasure1, rainMeasure1], {
            mergeStrategy: MergeStrategy.AVERAGE,
            cartesianTools,
        });
        rainComputationMap1.name = 'rain.polar';

        timeframeContainers.addFromRainComputationMap(rainComputationMap1, true);
        expect(timeframeContainers.containers.length).eq(1);
        expect(timeframeContainers.containers[0].name).eq('rain.polar');

        const cartesianValue1 = new CartesianValue({value: 123, lat: 10, lng: 20});
        const cartesianValue2 = new CartesianValue({value: 321, lat: 11, lng: 21});
        const cartesianMeasureValue = new CartesianMeasureValue({
            cartesianValues: [cartesianValue1, cartesianValue2],
        });
        const rainMeasure2 = new RainMeasure({
            id: 'rm1',
            date: new Date(),
            values: [cartesianMeasureValue, cartesianMeasureValue],
        });
        const rainComputationMap2 = new RainComputationMap({
            id: 'r1',
            date: new Date(),
            map: [],
            isReady: true,
        });
        rainComputationMap2.setMapData([rainMeasure2], {
            mergeStrategy: MergeStrategy.AVERAGE,
            cartesianTools,
        });
        rainComputationMap2.name = 'rain.cartesian';

        timeframeContainers.addFromRainComputationMap(rainComputationMap2, false);
        expect(timeframeContainers.containers.length).eq(2);
        expect(timeframeContainers.containers[1].name).eq('rain.cartesian');
        expect(timeframeContainers.containers[1].timeframe.length).eq(1);

        const cartesianMapValues = timeframeContainers.getCumulativeCartesianValues();
        expect(cartesianMapValues.length).eq(1);
        expect(cartesianMapValues[0].value).eq(123 * 9);
    });
});
