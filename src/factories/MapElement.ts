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

    protected markerStyles: {marker: Marker; style: any; cssVars: any}[];

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
        this.markerStyles = [];
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

        // Hook into the 'zoomend' event
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

    public updateMarkers(
        markers: {
            iconsLatLng: MapLatLng[];
            iconsOptions?: IconOptions;
        }[]
    ) {
        if (this.markerStyles.length === 0) {
            // remove all wind-speed-label
            document.querySelectorAll('.wind-speed-label').forEach((el) => el.remove());
        }

        this.markersProduced = this.markersLayer.render(markers).markers;
        return this.markersProduced;
    }

    /**
     * Change marker style by adding CSS classes and/or setting CSS custom properties
     * @param marker The marker to style (MapLatLng)
     * @param style CSS class(es) to add (space-separated string) or object with classes and cssVars
     * @param cssVars Optional object with CSS custom properties (e.g., {strength: 10})
     *
     * Examples:
     * - changeMarkerStyle(marker, 'marker-red')
     * - changeMarkerStyle(marker, 'marker-wind marker-wind-200', {strength: 10})
     * - changeMarkerStyle(marker, {classes: 'marker-wind marker-wind-200', cssVars: {strength: 10}})
     */
    public changeMarkerStyle(
        marker: MapLatLng,
        style: string | {classes: string; cssVars?: Record<string, string | number>},
        cssVars?: Record<string, string | number>
    ) {
        const markerFound = this.getMarkerElement(marker);
        if (!markerFound) {
            return;
        }

        const element = markerFound.getElement();
        if (!element) {
            return;
        }

        // Handle different input formats
        let classesToAdd: string;
        let varsToSet: Record<string, string | number> | undefined;

        if (typeof style === 'string') {
            classesToAdd = style;
            varsToSet = cssVars;
        } else {
            classesToAdd = style.classes;
            varsToSet = style.cssVars;
        }

        // Add CSS classes (space-separated)
        if (classesToAdd) {
            const classes = classesToAdd.split(' ').filter((c) => c.trim());
            classes.forEach((className) => {
                element.classList.add(className);
            });
        }

        // Set CSS custom properties and data attributes
        if (varsToSet) {
            Object.entries(varsToSet).forEach(([key, value]) => {
                // Set as CSS custom property
                element.style.setProperty(`--${key}`, String(value));
                // Also set as data attribute for use with attr() in CSS
                element.setAttribute(`data-${key}`, String(value));
            });
        }

        // Apply rotation to static wind markers by modifying the transform property
        if (classesToAdd && classesToAdd.includes('marker-wind-static')) {
            const currentTransform = element.style.transform || '';
            // Get computed CSS variable value (from CSS classes, not inline styles)
            const computedStyle = window.getComputedStyle(element);
            const rotationValue = computedStyle.getPropertyValue('--rotation').trim() || '0deg';

            // console.log('Rotation value from CSS:', rotationValue);

            // Set transform-origin separately (not part of transform value)
            element.style.transformOrigin = 'center center';

            // Preserve existing translate3d and add rotation
            if (currentTransform.includes('translate3d')) {
                element.style.transform = `${currentTransform} rotate(${rotationValue})`;
                // console.log('Applied rotation to transform:', element.style.transform);
            } else {
                element.style.transform = `rotate(${rotationValue})`;
            }
        }

        // Special handling for static wind markers: add speed text and arrow as DOM elements
        // (since <img> elements cannot have ::before/::after pseudo-elements)
        if (classesToAdd && classesToAdd.includes('marker-wind-static')) {
            const parent = element.parentElement;
            // console.log('Static wind marker detected, parent:', parent);
            if (parent) {
                // Get the marker's position from its transform style
                const transformStyle = element.style.transform || '';
                // console.log('Element transform:', transformStyle);

                // Extract translate3d values using regex
                const match = transformStyle.match(/translate3d\(([^,]+),\s*([^,]+),\s*([^)]+)\)/);
                let leftPos = '50%';
                let topPosSpeed = '-25px';

                if (match) {
                    const xPos = match[1].trim();
                    const yPos = match[2].trim();
                    // console.log('Extracted position:', xPos, yPos);

                    // Position labels at the marker's exact position (from translate3d)
                    leftPos = xPos;

                    // Parse the Y position and offset it upward for labels
                    const yValue = parseFloat(yPos);
                    if (!isNaN(yValue)) {
                        topPosSpeed = `${yValue - 25}px`;
                        // topPosArrow = `${yValue - 45}px`;
                        // console.log(
                        //     'Calculated label positions - speed:',
                        //     topPosSpeed,
                        //     'arrow:',
                        //     topPosArrow
                        // );
                    }
                }

                if (this.markerStyles.length === 0) {
                    // remove all wind-speed-label
                    document.querySelectorAll('.wind-speed-label').forEach((el) => el.remove());
                }

                // Add speed text label
                if (varsToSet && varsToSet['speed-text']) {
                    const speedLabel = document.createElement('div');
                    speedLabel.className = 'wind-speed-label';
                    speedLabel.textContent = String(varsToSet['speed-text']);
                    speedLabel.style.cssText = `position: absolute; left: ${leftPos}; top: ${topPosSpeed}; transform: translateX(-50%); font-size: 11px; font-weight: bold; color: rgba(255, 255, 255, 0.95); background: rgba(0, 0, 0, 0.6); padding: 2px 5px; border-radius: 3px; text-shadow: 0 0 2px rgba(0, 0, 0, 0.8); pointer-events: none; white-space: nowrap; z-index: 10000;`;
                    parent.appendChild(speedLabel);
                    // console.log(
                    //     'Added speed label:',
                    //     speedLabel.textContent,
                    //     'at position',
                    //     leftPos,
                    //     topPosSpeed
                    // );
                }

                // Add direction arrow
                // const arrow = document.createElement('div');
                // arrow.className = 'wind-arrow-indicator';
                // arrow.textContent = '→';
                // arrow.style.cssText = `position: absolute; left: ${leftPos}; top: ${topPosArrow}; font-size: 18px; font-weight: bold; color: rgba(100, 150, 255, 0.95); text-shadow: 0 0 4px rgba(0, 0, 0, 0.7); pointer-events: none; transform-origin: center; z-index: 10000; transform: translateX(-50%);`;
                // parent.appendChild(arrow);
                // console.log('Added arrow indicator at position', leftPos, topPosArrow);

                this.markerStyles.push({marker: markerFound, style, cssVars});
            } else {
                console.warn('No parent element found for static wind marker');
            }
        }
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
        const styles = this.markerStyles.filter((m) => !!m);

        // Rebuild styles
        this.markerStyles = [];
        for (const markerStyle of styles) {
            this.changeMarkerStyle(
                markerStyle.marker.getLatLng(),
                markerStyle.style,
                markerStyle.cssVars
            );
        }
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
