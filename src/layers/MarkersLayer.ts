import {layerGroup, LayerGroup, Map, Marker, marker as leafletMarker, MarkerOptions} from 'leaflet';
import {IPixiLayer} from './IPixiLayer';
import {MapLatLng, RaainDivIcon} from '../tools';

export class MarkersLayer implements IPixiLayer {
    protected _layerGroup: LayerGroup;
    protected _width: number;
    protected _height: number;

    constructor() {
        this._layerGroup = null;
        this._width = 0;
        this._height = 0;
    }

    public addToMap(map: Map) {
        if (!this._layerGroup) {
            return;
        }

        if (!map.hasLayer(this._layerGroup)) {
            map.addLayer(this._layerGroup);
        }
    }

    public removeFromMap(map: Map) {
        if (!this._layerGroup) {
            return;
        }

        if (map.hasLayer(this._layerGroup)) {
            map.removeLayer(this._layerGroup);
        }
    }

    public setCurrentWidth(width: number) {
        this._width = width;
    }

    public setCurrentHeight(height: number) {
        this._height = height;
    }

    public render(markers: {iconsLatLng: MapLatLng[]; raainDivIcon?: RaainDivIcon}[]): {
        markers: Marker[];
    } {
        if (this._layerGroup) {
            this._layerGroup.clearLayers();
        }

        // Add markers
        const ms: Marker[] = [];
        let x: number;
        let y: number;
        for (const marker of markers) {
            const raainDivIcon = marker.raainDivIcon;

            for (const iconsLatLng of marker.iconsLatLng) {
                x = iconsLatLng.lat;
                y = iconsLatLng.lng;

                if (x !== undefined && !isNaN(x) && y !== undefined && !isNaN(y)) {
                    const options: MarkerOptions = {
                        title: iconsLatLng.name,
                        alt: iconsLatLng.id,
                    };

                    if (raainDivIcon) {
                        options.icon = raainDivIcon;
                    }

                    const leafletMarkerInstance = leafletMarker([x, y], options);

                    if (raainDivIcon) {
                        raainDivIcon.bindToMarker(leafletMarkerInstance);
                    } else {
                        console.warn('raain-ui >> no raainDivIcon provided for this marker!');
                    }

                    ms.push(leafletMarkerInstance);
                } else {
                    // implement your own error handling
                    console.error(
                        'raain-ui >> MARKER ERROR: ',
                        iconsLatLng.id,
                        'x: ',
                        x,
                        ' y: ',
                        y
                    );
                }
            }
        }

        this._layerGroup = layerGroup(ms);
        return {markers: ms};
    }
}
