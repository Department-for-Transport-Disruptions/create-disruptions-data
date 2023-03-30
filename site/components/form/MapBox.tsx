import { CSSProperties, ReactElement } from "react";
import Map, { ViewState } from "react-map-gl";

interface MapBoxProps {
    initialViewState: Partial<ViewState>;
    style: CSSProperties;
    mapStyle: string;
}

const MapBox = ({ initialViewState, style, mapStyle }: MapBoxProps): ReactElement => {
    const mapboxAccessToken = process.env.MAP_BOX_ACCESS_TOKEN || "";

    return (
        <Map
            initialViewState={initialViewState}
            style={style}
            mapStyle={mapStyle}
            mapboxAccessToken={mapboxAccessToken}
        />
    );
};

export default MapBox;
