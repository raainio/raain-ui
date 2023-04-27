import {Map} from 'leaflet';

export interface IPixiLayer {

    addToMap(map: Map);

    removeFromMap(map: Map);

    setCurrentWidth(width:number);

    setCurrentHeight(height:number);

}
