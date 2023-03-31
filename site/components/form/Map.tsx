import { CSSProperties, ReactElement, ReactNode } from "react";
import MapBox, { ViewState } from "react-map-gl";

interface MapProps {
    initialViewState: Partial<ViewState>;
    style: CSSProperties;
    mapStyle: string;
    children?: ReactNode;
}

const Map = ({ initialViewState, style, mapStyle, children }: MapProps): ReactElement | null => {
    const mapboxAccessToken = process.env.MAP_BOX_ACCESS_TOKEN;

    return mapboxAccessToken ? (
        <MapBox
            initialViewState={initialViewState}
            style={style}
            mapStyle={mapStyle}
            mapboxAccessToken={mapboxAccessToken}
        >
            {children ? children : null}
        </MapBox>
    ) : null;
};

export default Map;
