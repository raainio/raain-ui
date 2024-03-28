import {canvas, IconOptions, map, Map, Marker, tileLayer} from 'leaflet';
import {MapLatLng} from '../tools/MapLatLng';
import {TimeframeContainers} from '../timeframes/TimeframeContainers';
import {MarkersLayer} from '../layers/MarkersLayer';
import {CompositeLayer} from '../layers/CompositeLayer';
import {TimeframeContainer} from '../timeframes/TimeframeContainer';
import {PolarLayer} from '../layers/PolarLayer';
import {PolarLayerConfig} from '../layers/PolarLayerConfig';
import {CartesianLayer} from '../layers/CartesianLayer';

export class MapElementInput {
    constructor(
        public timeframeContainers?: TimeframeContainers,
        public markers?: {
            iconsLatLng: MapLatLng[],
            iconsOptions?: IconOptions
        }[]
    ) {
    }
}

export class MapElement {

    public mapLeaflet: Map;
    public markersLayer: MarkersLayer;
    public compositeLayer: CompositeLayer;
    public markersProduced: Marker[];

    constructor(
        public center: MapLatLng | { lat: number, lng: number } | { latitude: number, longitude: number } | any = {lat: 0, lng: 0},
        protected addSomeDebugInfos = false,
    ) {
        const lat = typeof this.center.lat !== 'undefined' ? this.center.lat : this.center.latitude;
        const lng = typeof this.center.lng !== 'undefined' ? this.center.lng : this.center.longitude;
        this.center = new MapLatLng(lat, lng);
    }

    public build(element: HTMLElement, inputs: MapElementInput): void {

        // Map default
        let mapLeaflet: Map;
        let markersLayer: MarkersLayer;
        const compositeLayer = new CompositeLayer();

        mapLeaflet = map(element, {
            preferCanvas: true,
            zoomControl: true,
            zoomAnimation: true,
            trackResize: false,
            boxZoom: false,
            scrollWheelZoom: false,
            renderer: canvas(),
        }).setView([this.center.lat, this.center.lng], 10);

        tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy;<a href="https://www.openstreetmap.org/copyright">osm</a>',
        }).addTo(mapLeaflet);

        // Composite timeframes
        const width = element.offsetWidth;
        const height = element.offsetHeight;
        compositeLayer.setCurrentWidth(width);
        compositeLayer.setCurrentHeight(height);

        let firstLayerIdPushed: string;
        if (inputs.timeframeContainers?.containers.length) {
            for (const timeFrameContainer of inputs.timeframeContainers.containers) {

                const layerIds = this.addCompositeLayer(mapLeaflet, timeFrameContainer, compositeLayer);
                if (!firstLayerIdPushed && layerIds.length) {
                    firstLayerIdPushed = layerIds[0];
                }
            }
        }

        compositeLayer.addToMap(mapLeaflet);
        if (firstLayerIdPushed) {
            compositeLayer.showTheFistMatchingId(firstLayerIdPushed);
        }

        // Markers
        let markersProduced = [];
        markersLayer = new MarkersLayer();
        markersLayer.setCurrentWidth(width);
        markersLayer.setCurrentHeight(height);
        markersProduced = markersLayer.render(inputs.markers).markers;
        markersLayer.addToMap(mapLeaflet);

        mapLeaflet.invalidateSize({animate: true});

        this.mapLeaflet = mapLeaflet;
        this.markersLayer = markersLayer;
        this.compositeLayer = compositeLayer;
        this.markersProduced = markersProduced;
    }

    public updateMapTimeframe(timeframeContainers: TimeframeContainers): void {

        if (!this.compositeLayer || !timeframeContainers?.containers.length) {
            return;
        }

        this.compositeLayer.removeAllLayers();

        let firstLayerIdPushed: string;
        for (const timeFrameContainer of timeframeContainers.containers) {
            const layerIds = this.addCompositeLayer(this.mapLeaflet, timeFrameContainer, this.compositeLayer);

            if (!firstLayerIdPushed && layerIds.length) {
                firstLayerIdPushed = layerIds[0];
            }

        }
        this.compositeLayer.showTheFistMatchingId(firstLayerIdPushed);

        this.compositeLayer.redraw();
        this.mapLeaflet.invalidateSize({animate: true});
    }

    private addCompositeLayer(mapLeaflet: Map, timeFrameContainer: TimeframeContainer, compositeLayer: CompositeLayer): Array<string> {
        const layerIds: string[] = [];
        timeFrameContainer.setCompositeLayer(compositeLayer);
        for (const frameContainer of timeFrameContainer.timeframe) {
            const layerId = timeFrameContainer.getFrameId(frameContainer);
            const values: any = frameContainer.values;

            let layer;
            if (frameContainer.isPolar) {
                layer = new PolarLayer(layerId, timeFrameContainer.name, mapLeaflet, this.addSomeDebugInfos);
                layer.setPolarValues(this.center, values, new PolarLayerConfig(), timeFrameContainer.version);
            } else if (frameContainer.isCartesian) {
                layer = new CartesianLayer(layerId, timeFrameContainer.name, mapLeaflet, this.addSomeDebugInfos);
                layer.setCartesianGridValues(this.center, values, timeFrameContainer.version);
            }
            compositeLayer.addLayer(layer);
            layerIds.push(layerId);
        }

        return layerIds;
    }

}
