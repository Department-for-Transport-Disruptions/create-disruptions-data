import MapboxDraw, { MapboxDrawControls } from "@mapbox/mapbox-gl-draw";
import { Feature, GeoJsonProperties, Polygon } from "geojson";
import { useControl } from "react-map-gl";
import type { MapRef, ControlPosition } from "react-map-gl";

export type PolygonFeature = Feature<Polygon, GeoJsonProperties>;

type DrawControlProps = ConstructorParameters<typeof MapboxDraw>[0] & {
    position?: ControlPosition;
    controls?: MapboxDrawControls | undefined;
    displayControlsDefault?: boolean;
    onCreate: (evt: { features: PolygonFeature[] }) => void;
    onUpdate: (evt: { features: PolygonFeature[]; action: string }) => void;
    onDelete: (evt: { features: PolygonFeature[] }) => void;
};

const DrawControl = ({
    onCreate,
    onUpdate,
    onDelete,
    position,
    controls,
    displayControlsDefault,
}: DrawControlProps): null => {
    useControl<MapboxDraw>(
        () => new MapboxDraw({ controls, displayControlsDefault }),
        ({ map }: { map: MapRef }) => {
            map.on("draw.create", onCreate);
            map.on("draw.update", onUpdate);
            map.on("draw.delete", onDelete);
        },
        ({ map }: { map: MapRef }) => {
            map.off("draw.create", onCreate);
            map.off("draw.update", onUpdate);
            map.off("draw.delete", onDelete);
        },
        {
            position: position,
        },
    );

    return null;
};

export default DrawControl;
