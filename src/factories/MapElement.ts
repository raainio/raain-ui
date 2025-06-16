import {canvas, IconOptions, map, Map, Marker, tileLayer} from 'leaflet';
import {CartesianMapValue, IconMapValue, MapLatLng, PolarMapValue} from '../tools';
import {TimeframeContainer, TimeframeContainers} from '../timeframes';
import {
    CartesianLayer,
    CompositeLayer,
    IconLayer,
    IPixiUniqueLayer,
    MarkersLayer,
    PolarLayer,
    PolarLayerConfig,
} from '../layers';

export class MapElementInput {
    constructor(
        public timeframeContainers?: TimeframeContainers,
        public markers?: {
            iconsLatLng: MapLatLng[];
            iconsOptions?: IconOptions;
        }[]
    ) {}
}

export class MapElement {
    public mapLeaflet: Map;
    public markersLayer: MarkersLayer;
    public compositeLayer: CompositeLayer;
    public markersProduced: Marker[];
    public alpha = 1;

    constructor(
        public center:
            | MapLatLng
            | {lat: number; lng: number}
            | {latitude: number; longitude: number}
            | any = {lat: 0, lng: 0},
        protected addSomeDebugInfos = false
    ) {
        const lat = typeof this.center.lat !== 'undefined' ? this.center.lat : this.center.latitude;
        const lng =
            typeof this.center.lng !== 'undefined' ? this.center.lng : this.center.longitude;
        this.center = new MapLatLng(lat, lng);
    }

    public build(element: HTMLElement, inputs: MapElementInput): void {
        // Map default
        const width = element.offsetWidth;
        const height = element.offsetHeight;

        // Composite timeframes
        const compositeLayer = new CompositeLayer('composite1', width, height);

        const mapLeaflet = map(element, {
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

        let firstLayerIdPushed: string;
        if (inputs.timeframeContainers?.containers.length) {
            for (const timeFrameContainer of inputs.timeframeContainers.containers) {
                const layerIds = this.addCompositeLayer(
                    mapLeaflet,
                    compositeLayer,
                    timeFrameContainer
                );
                if (!firstLayerIdPushed && layerIds.length) {
                    firstLayerIdPushed = layerIds[0];
                }
            }
        }

        compositeLayer.addToMap(mapLeaflet);
        // if (firstLayerIdPushed) {
        //     compositeLayer.showTheFistMatchingId(firstLayerIdPushed);
        // }
        compositeLayer.showAll(this.alpha);

        // Markers
        let markersProduced = [];
        const markersLayer = new MarkersLayer();
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
            const layerIds = this.addCompositeLayer(
                this.mapLeaflet,
                this.compositeLayer,
                timeFrameContainer
            );

            if (!firstLayerIdPushed && layerIds.length) {
                firstLayerIdPushed = layerIds[0];
            }
        }
        // this.compositeLayer.showTheFistMatchingId(firstLayerIdPushed);
        this.compositeLayer.showAll(this.alpha);

        this.compositeLayer.redraw();
        this.mapLeaflet.invalidateSize({animate: true});
    }

    private addCompositeLayer(
        mapLeaflet: Map,
        compositeLayer: CompositeLayer,
        timeFrameContainer: TimeframeContainer
    ): Array<string> {
        const layerIds: string[] = [];
        timeFrameContainer.setCompositeLayer(compositeLayer);

        for (const frameContainer of timeFrameContainer.timeframe) {
            const layerId = timeFrameContainer.getFrameId(frameContainer);
            const values = frameContainer.values;

            let layer: IPixiUniqueLayer;
            if (frameContainer.isPolar) {
                layer = new PolarLayer(
                    layerId,
                    timeFrameContainer.name,
                    mapLeaflet,
                    this.addSomeDebugInfos
                );
                layer.setValues(
                    this.center,
                    values as PolarMapValue[],
                    new PolarLayerConfig(),
                    timeFrameContainer.version
                );
            } else if (frameContainer.isCartesian) {
                layer = new CartesianLayer(
                    layerId,
                    timeFrameContainer.name,
                    mapLeaflet,
                    this.addSomeDebugInfos
                );
                layer.setValues(
                    this.center,
                    values as CartesianMapValue[],
                    null,
                    timeFrameContainer.version
                );
            } else if (frameContainer.isIcon) {
                layer = new IconLayer(
                    layerId,
                    timeFrameContainer.name,
                    mapLeaflet,
                    this.addSomeDebugInfos
                );
                layer.setValues(
                    this.center,
                    values as IconMapValue[],
                    null,
                    timeFrameContainer.version
                );
            }

            compositeLayer.addLayer(layer);
            layerIds.push(layerId);
        }

        return layerIds;
    }
}
