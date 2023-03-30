import { CSSProperties, ReactElement } from "react";
import Map, { ViewState } from "react-map-gl";

interface MapProps {
    initialViewState: Partial<ViewState>;
    style: CSSProperties;
    mapStyle: string;
}

const MapBox = ({ initialViewState, style, mapStyle }: MapProps): ReactElement | null => {
    const mapboxAccessToken = process.env.MAP_BOX_ACCESS_TOKEN;

    return mapboxAccessToken ? (
        <Map
            initialViewState={initialViewState}
            style={style}
            mapStyle={mapStyle}
            mapboxAccessToken={mapboxAccessToken}
        />
    ) : null;
};

export default MapBox;
