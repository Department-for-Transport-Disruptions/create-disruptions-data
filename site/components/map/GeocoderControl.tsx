/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import MapboxGeocoder, { GeocoderOptions } from "@mapbox/mapbox-gl-geocoder";
import { useControl, ControlPosition } from "react-map-gl";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

type GeocoderControlProps = Omit<GeocoderOptions, "accessToken" | "mapboxgl"> & {
    mapboxAccessToken: string;
    position: ControlPosition;
};

const GeocoderControl = (props: GeocoderControlProps): null => {
    const geocoder = useControl<MapboxGeocoder>(
        (): MapboxGeocoder => {
            const ctrl: MapboxGeocoder = new MapboxGeocoder({
                ...props,
                marker: false,
                accessToken: props.mapboxAccessToken,
                countries: "GB",
            });
            return ctrl;
        },
        {
            position: props.position,
        },
    );

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore (TS2339) private member
    if (geocoder._map) {
        if (geocoder.getCountries() !== props.countries && props.countries !== undefined) {
            geocoder.setCountries(props.countries);
        }
    }
    return null;
};

export default GeocoderControl;
