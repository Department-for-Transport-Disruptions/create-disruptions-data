import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { useControl } from "react-map-gl";

import type { MapRef, ControlPosition } from "react-map-gl";
import { ControlProps } from "react-select";

type DrawControlProps = ConstructorParameters<typeof MapboxDraw>[0] & {
    position?: ControlPosition;
    controls?: ControlProps;
    displayControlsDefault?: boolean;
    onCreate?: (evt: { features: object[] }) => void;
    onUpdate?: (evt: { features: object[]; action: string }) => void;
    onDelete?: (evt: { features: object[] }) => void;
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
        () => new MapboxDraw({ onCreate, onUpdate, onDelete, position, controls, displayControlsDefault }),
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
