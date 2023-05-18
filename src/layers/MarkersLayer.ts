import {icon, IconOptions, layerGroup, LayerGroup, Map, Marker, marker, MarkerOptions} from 'leaflet';
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

    public render(markers: MapLatLng[]): LayerGroup {
        if (this._layerGroup) {
            this._layerGroup.clearLayers();
        }

        const MapIconOptions: IconOptions = {
            iconAnchor: [0, 42],
            iconSize: [25, 42],
            iconUrl: './assets/maps/marker-icon.png', // './assets/maps/mario_mle.gif',
            shadowUrl: './assets/maps/marker-shadow.png',
            shadowSize: [41, 41],
            shadowAnchor: [0, 41],
        };

        // Add markers
        const iconL = icon(MapIconOptions);
        const n: number = markers.length;
        let i: number;
        const ms: Marker[] = [];
        let x: number;
        let y: number;
        for (i = 0; i < n; ++i) {
            const markerToDisplay = markers[i];

            x = markerToDisplay.lat;
            y = markerToDisplay.lng;

            if (x !== undefined && !isNaN(x) && y !== undefined && !isNaN(y)) {
                const options: MarkerOptions = {
                    // icon: iconL,
                    title: markerToDisplay.name,
                    alt: markerToDisplay.id
                };
                ms.push(marker([x, y], options));
            } else {
                // implement your own error handling
                console.error('MARKER ERROR, Marker number: ', (i + 1), 'x: ', x, ' y: ', y);
            }
        }
        // this.markerGroup = layerGroup(ms);
        // this.markerGroup.addTo(this.map);

        this._layerGroup = layerGroup(ms);
        return this._layerGroup;
    }

}
