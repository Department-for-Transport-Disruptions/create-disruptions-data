import { ReactElement } from "react";
import { NavigationControl, FullscreenControl } from "react-map-gl";
import GeocoderControl from "./GeocoderControl";

const MapControls = (): ReactElement | null => {
    const mapboxAccessToken = process.env.MAP_BOX_ACCESS_TOKEN;

    return mapboxAccessToken ? (
        <>
            <GeocoderControl mapboxAccessToken={mapboxAccessToken} position="top-right" />
            <NavigationControl showCompass={false} />
            <FullscreenControl />
        </>
    ) : null;
};

export default MapControls;
