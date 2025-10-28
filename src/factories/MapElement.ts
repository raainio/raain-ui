import {canvas, map, Map, Marker, tileLayer} from 'leaflet';
import {CartesianMapValue, IconMapValue, MapLatLng, PolarMapValue, RaainDivIcon} from '../tools';
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
        public markers: {
            iconsLatLng: MapLatLng[];
            raainDivIcon?: RaainDivIcon;
        }[] = []
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

        // Hook into zoom events to preserve marker rotations
        mapLeaflet.on('zoomend', this.onZoomEnd.bind(this));

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
        compositeLayer.showAll(this.alpha);

        // Markers
        const markersLayer = new MarkersLayer();
        markersLayer.setCurrentWidth(width);
        markersLayer.setCurrentHeight(height);
        const markersProduced = markersLayer.render(inputs.markers).markers;
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

    public updateMarkers(
        markers: {
            iconsLatLng: MapLatLng[];
            raainDivIcon?: RaainDivIcon;
        }[]
    ) {
        const result = this.markersLayer.render(markers);

        this.markersProduced = result.markers;
        this.markersLayer.addToMap(this.mapLeaflet);

        return this.markersProduced;
    }

    /**
     * Set rotation for a marker using RaainDivIcon
     * @param marker The marker to rotate (MapLatLng)
     * @param angle Rotation angle in degrees (0 = North, 90 = East, 180 = South, 270 = West)
     * @returns true if rotation was applied, false if marker not found or not using RaainDivIcon
     */
    public setMarkerRotation(marker: MapLatLng, angle: number): boolean {
        const markerFound = this.getMarkerElement(marker);
        if (!markerFound) {
            return false;
        }

        const icon = markerFound.options.icon;
        if (icon instanceof RaainDivIcon) {
            icon.setRotation(angle);
            return true;
        }

        return false;
    }

    /**
     * Get the rotation angle of a marker using RaainDivIcon
     * @param marker The marker to query (MapLatLng)
     * @returns The rotation angle in degrees, or null if not found or not using RaainDivIcon
     */
    public getMarkerRotation(marker: MapLatLng): number | null {
        const markerFound = this.getMarkerElement(marker);
        if (!markerFound) {
            return null;
        }

        const icon = markerFound.options.icon;
        if (icon instanceof RaainDivIcon) {
            return icon.getRotation();
        }

        return null;
    }

    protected getMarkerElement(markerToFind: MapLatLng) {
        if (!this.markersProduced?.length) {
            return null;
        }

        const founds = this.markersProduced.filter(
            (marker) =>
                marker.getLatLng().lat === markerToFind.lat &&
                marker.getLatLng().lng === markerToFind.lng
        );
        if (founds.length !== 1) {
            return null;
        }
        return founds[0];
    }

    protected onZoomEnd(event: any) {
        // Re-apply rotation to all RaainDivIcon markers after zoom
        if (!this.markersProduced?.length) {
            return;
        }

        this.markersProduced.forEach((marker) => {
            const icon = marker.options.icon as RaainDivIcon;
            if (typeof icon.applyRotation === 'function') {
                icon.applyRotation();
            }
        });
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
