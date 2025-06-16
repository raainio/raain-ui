import {
    Icon,
    icon as leafletIcon,
    IconOptions,
    layerGroup,
    LayerGroup,
    Map,
    Marker,
    marker as leafletMarker,
    MarkerOptions,
} from 'leaflet';
import {IPixiLayer} from './IPixiLayer';
import {MapLatLng} from '../tools/MapLatLng';

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

    public render(markers: {iconsLatLng: MapLatLng[]; iconOptions?: IconOptions}[]): {
        markers: Marker[];
    } {
        if (this._layerGroup) {
            this._layerGroup.clearLayers();
        }

        if (!markers) {
            return {markers: []};
        }

        // Add markers
        const ms: Marker[] = [];
        let x: number;
        let y: number;
        for (const marker of markers) {
            let iconOption: Icon;
            if (marker.iconOptions) {
                iconOption = leafletIcon(marker.iconOptions);
            }

            for (const iconsLatLng of marker.iconsLatLng) {
                x = iconsLatLng.lat;
                y = iconsLatLng.lng;
                if (x !== undefined && !isNaN(x) && y !== undefined && !isNaN(y)) {
                    const options: MarkerOptions = {
                        title: iconsLatLng.name,
                        alt: iconsLatLng.id,
                    };
                    if (iconOption) {
                        options.icon = iconOption;
                    }
                    ms.push(leafletMarker([x, y], options));
                } else {
                    // implement your own error handling
                    console.error('MARKER ERROR: ', iconsLatLng.id, 'x: ', x, ' y: ', y);
                }
            }
        }

        this._layerGroup = layerGroup(ms);
        return {markers: ms};
    }
}
