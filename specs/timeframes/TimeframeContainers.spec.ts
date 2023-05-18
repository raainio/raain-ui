// @ts-ignore
import {PolarMapValue, TimeframeContainers} from '../../src';
import {expect} from 'chai';
import {
    CartesianMeasureValue,
    CartesianValue,
    MeasureValuePolarContainer,
    PolarMeasureValue,
    RadarMeasure,
    RadarNodeMap,
    RainComputationMap,
    RainMeasure
} from 'raain-model';

describe('TimeframeContainers', () => {

    it('should create a basic TimeframeContainers', async () => {
        const timeframeContainers = new TimeframeContainers([]);

        expect(timeframeContainers.containers.length).eq(0);
    });

    it('should create from raain model RadarNodeMap', async () => {
        const timeframeContainers = new TimeframeContainers([]);

        const measureValuePolarContainer = new MeasureValuePolarContainer(0, 1, [33, 45.5]);
        const polarMeasureValue = new PolarMeasureValue([measureValuePolarContainer]);
        const radarMeasure1 = new RadarMeasure('rm1', new Date(), [polarMeasureValue]);
        const radarNodeMap1 = new RadarNodeMap('r1', 'radarName.polar', [], 10, 20);
        radarNodeMap1.setMapData([radarMeasure1, radarMeasure1]);

        timeframeContainers.addFromRadarNodeMap(radarNodeMap1, true);
        expect(timeframeContainers.containers.length).eq(1);
        expect(timeframeContainers.containers[0].name).eq('radarName.polar');

        const cartesianValue = new CartesianValue(123, 10, 20);
        const cartesianMeasureValue = new CartesianMeasureValue([cartesianValue, cartesianValue]);
        const radarMeasure2 = new RadarMeasure('rm1', new Date(), [cartesianMeasureValue, cartesianMeasureValue]);
        const radarNodeMap2 = new RadarNodeMap('r1', 'radarName.cartesian', [], 10, 20);
        radarNodeMap2.setMapData([radarMeasure2, radarMeasure2]);

        timeframeContainers.addFromRadarNodeMap(radarNodeMap2, false);
        expect(timeframeContainers.containers.length).eq(2);
        expect(timeframeContainers.containers[1].name).eq('radarName.cartesian');
        expect(timeframeContainers.containers[1].timeframe.length).eq(2);
    });

    it('should create from raain model RainComputationMap', async () => {
        const timeframeContainers = new TimeframeContainers([]);

        const measureValuePolarContainer = new MeasureValuePolarContainer(0, 1, [33, 45.5]);
        const polarMeasureValue = new PolarMeasureValue([measureValuePolarContainer]);
        const rainMeasure1 = new RainMeasure('rm1', new Date(), [polarMeasureValue]);
        const rainComputationMap1 = new RainComputationMap('r1', new Date(), new Date(), [], 20);
        rainComputationMap1.setMapData([rainMeasure1, rainMeasure1]);
        rainComputationMap1.name = 'rain.polar';

        timeframeContainers.addFromRainComputationMap(rainComputationMap1, true);
        expect(timeframeContainers.containers.length).eq(1);
        expect(timeframeContainers.containers[0].name).eq('rain.polar');

        const cartesianValue = new CartesianValue(123, 10, 20);
        const cartesianMeasureValue = new CartesianMeasureValue([cartesianValue, cartesianValue]);
        const rainMeasure2 = new RainMeasure('rm1', new Date(), [cartesianMeasureValue, cartesianMeasureValue]);
        const rainComputationMap2 = new RainComputationMap('r1', new Date(), new Date(), [], 10, 20);
        rainComputationMap2.setMapData([rainMeasure2, rainMeasure2]);
        rainComputationMap2.name = 'rain.cartesian';

        timeframeContainers.addFromRainComputationMap(rainComputationMap2, false);
        expect(timeframeContainers.containers.length).eq(2);
        expect(timeframeContainers.containers[1].name).eq('rain.cartesian');
        expect(timeframeContainers.containers[1].timeframe.length).eq(2);
    });
});
