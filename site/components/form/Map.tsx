import { CSSProperties, ReactElement } from "react";
import MapBox, { ViewState } from "react-map-gl";

interface MapProps {
    initialViewState: Partial<ViewState>;
    style: CSSProperties;
    mapStyle: string;
}

const Map = ({ initialViewState, style, mapStyle }: MapProps): ReactElement | null => {
    const mapboxAccessToken = process.env.MAP_BOX_ACCESS_TOKEN;

    return mapboxAccessToken ? (
        <MapBox
            initialViewState={initialViewState}
            style={style}
            mapStyle={mapStyle}
            mapboxAccessToken={mapboxAccessToken}
        />
    ) : null;
};

export default Map;
