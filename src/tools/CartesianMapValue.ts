import {CartesianValue} from 'raain-model';
import {ConverterFromPolar} from 'raain-quality';
import {MapLatLng} from './MapLatLng';
import {LatLng} from 'leaflet';

export class CartesianMapValue extends MapLatLng {

    constructor(
        value: number,
        public readonly latitude: number,
        public readonly longitude: number,
        public readonly latitude2?: number,
        public readonly longitude2?: number,
        id?: string,
        name?: string) {

        super(latitude, longitude, undefined, id, name, value);
    }

    public static Duplicate(src: CartesianMapValue): CartesianMapValue {
        return new CartesianMapValue(
            src.value,
            src.latitude,
            src.longitude,
            src.latitude2,
            src.longitude2,
            src.id,
            src.name,
        );
    }

    public static From(cartesianValues: CartesianValue[], width?: LatLng): CartesianMapValue[] {

        let widthForMap = width;
        if (!widthForMap) {
            // @ts-ignore
            widthForMap = ConverterFromPolar.ComputeLatLngWidth(cartesianValues);
        }

        const cartesianMapValues = [];
        cartesianValues.forEach(cartesianValue => {
            cartesianMapValues.push(new CartesianMapValue(
                cartesianValue.value,
                cartesianValue.lat,
                cartesianValue.lng,
                cartesianValue.lat + widthForMap.lat,
                cartesianValue.lng + widthForMap.lng
            ));
        });
        return cartesianMapValues;
    }

    public static ConvertFromPolar(converterFromPolar: ConverterFromPolar, widthInKm: number): CartesianMapValue[] {

        const center = converterFromPolar.getCenter();
        const pointToGetLatWidth = ConverterFromPolar.GetLatLngFromDistances(center, 0, 1000);
        const pointToGetLngWidth = ConverterFromPolar.GetLatLngFromDistances(center, 1000, 0);

        const width = new LatLng(pointToGetLatWidth.lat - center.lat, pointToGetLngWidth.lng - center.lng);
        converterFromPolar.setWidth(width.lat, width.lng);
        const rainCartesianMeasureValue = converterFromPolar.getRainCartesianMeasureValue(widthInKm);

        const cartesianValues = rainCartesianMeasureValue.getCartesianValues();

        return CartesianMapValue.From(cartesianValues, width);
    }

}
