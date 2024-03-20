// @ts-ignore
import {MapLatLng, PolarMapValue, TimeframeContainers} from '../../src';
import {expect} from 'chai';
import {
    CartesianMeasureValue,
    CartesianValue,
    LatLng,
    MeasureValuePolarContainer,
    PolarMeasureValue,
    QualityTools,
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

        const measureValuePolarContainer = new MeasureValuePolarContainer({azimuth: 0, distance: 1, polarEdges: [33, 45.5]});
        const polarMeasureValue = new PolarMeasureValue({measureValuePolarContainers: [measureValuePolarContainer]});
        const radarMeasure1 = new RadarMeasure({id: 'rm1', date: new Date(), values: [polarMeasureValue]});
        const radarNodeMap1 = new RadarNodeMap({
            id: 'r1',
            name: 'radarName.polar',
            periodBegin: new Date(),
            periodEnd: new Date(),
            map: [],
            latitude: 10,
            longitude: 20
        });
        radarNodeMap1.setMapData([radarMeasure1, radarMeasure1]);

        timeframeContainers.addFromRadarNodeMap(radarNodeMap1, true);
        expect(timeframeContainers.containers.length).eq(1);
        expect(timeframeContainers.containers[0].name).eq('radarName.polar');

        const cartesianValue = new CartesianValue({value: 123, lat: 10, lng: 20});
        const cartesianPixelWidth = new LatLng({lat: QualityTools.DEFAULT_SCALE, lng: QualityTools.DEFAULT_SCALE});
        const cartesianMeasureValue = new CartesianMeasureValue({cartesianValues: [cartesianValue, cartesianValue], cartesianPixelWidth});
        const radarMeasure2 = new RadarMeasure({id: 'rm1', date: new Date(), values: [cartesianMeasureValue, cartesianMeasureValue]});
        const radarNodeMap2 = new RadarNodeMap({
            id: 'r1',
            name: 'radarName.cartesian',
            periodBegin: new Date(),
            periodEnd: new Date(),
            map: [],
            latitude: 10,
            longitude: 20
        });
        radarNodeMap2.setMapData([radarMeasure2, radarMeasure2]);

        timeframeContainers.addFromRadarNodeMap(radarNodeMap2, false);
        expect(timeframeContainers.containers.length).eq(2);
        expect(timeframeContainers.containers[1].name).eq('radarName.cartesian');
        expect(timeframeContainers.containers[1].timeframe.length).eq(2);
    });

    it('should create from raain model RainComputationMap', async () => {
        const timeframeContainers = new TimeframeContainers([]);
        const cartesianPixelWidth = new LatLng({lat: QualityTools.DEFAULT_SCALE, lng: QualityTools.DEFAULT_SCALE});

        const measureValuePolarContainer = new MeasureValuePolarContainer({azimuth: 0, distance: 1, polarEdges: [33, 45.5]});
        const polarMeasureValue = new PolarMeasureValue({measureValuePolarContainers: [measureValuePolarContainer]});
        const rainMeasure1 = new RainMeasure({id: 'rm1', date: new Date(), values: [polarMeasureValue]});
        const rainComputationMap1 = new RainComputationMap({
            id: 'r1',
            periodBegin: new Date(),
            periodEnd: new Date(),
            map: [],
            isReady: true
        });
        rainComputationMap1.setMapData([rainMeasure1, rainMeasure1]);
        rainComputationMap1.name = 'rain.polar';

        timeframeContainers.addFromRainComputationMap(rainComputationMap1, true);
        expect(timeframeContainers.containers.length).eq(1);
        expect(timeframeContainers.containers[0].name).eq('rain.polar');

        const cartesianValue = new CartesianValue({value: 123, lat: 10, lng: 20});
        const cartesianMeasureValue = new CartesianMeasureValue({cartesianValues: [cartesianValue, cartesianValue], cartesianPixelWidth});
        const rainMeasure2 = new RainMeasure({id: 'rm1', date: new Date(), values: [cartesianMeasureValue, cartesianMeasureValue]});
        const rainComputationMap2 = new RainComputationMap({
            id: 'r1',
            periodBegin: new Date(),
            periodEnd: new Date(),
            map: [],
            isReady: true
        });
        rainComputationMap2.setMapData([rainMeasure2, rainMeasure2]);
        rainComputationMap2.name = 'rain.cartesian';

        timeframeContainers.addFromRainComputationMap(rainComputationMap2, false);
        expect(timeframeContainers.containers.length).eq(2);
        expect(timeframeContainers.containers[1].name).eq('rain.cartesian');
        expect(timeframeContainers.containers[1].timeframe.length).eq(2);
    });
});
