import { ReactElement } from "react";
import { NavigationControl, FullscreenControl } from "react-map-gl";
import DrawControl, { PolygonFeature } from "./DrawControl";
import GeocoderControl from "./GeocoderControl";

interface MapControlsProps {
    onUpdate: (evt: { features: PolygonFeature[] }) => void;
    onDelete: (evt: { features: PolygonFeature[] }) => void;
}

const MapControls = ({ onUpdate, onDelete }: MapControlsProps): ReactElement | null => {
    const mapboxAccessToken = process.env.MAP_BOX_ACCESS_TOKEN;

    return mapboxAccessToken ? (
        <>
            <GeocoderControl mapboxAccessToken={mapboxAccessToken} position="top-right" />
            <NavigationControl showCompass={false} />
            <FullscreenControl />
            <DrawControl
                position="top-left"
                displayControlsDefault={false}
                controls={{
                    polygon: true,
                    trash: true,
                }}
                defaultMode="draw_polygon"
                onCreate={(evt) => {
                    onUpdate(evt);
                }}
                onUpdate={(evt) => {
                    onUpdate(evt);
                }}
                onDelete={(evt) => {
                    onDelete(evt);
                }}
            />
        </>
    ) : null;
};

export default MapControls;
