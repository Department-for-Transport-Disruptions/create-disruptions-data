import MapboxDraw, { MapboxDrawControls } from "@mapbox/mapbox-gl-draw";
import { MapEventType } from "mapbox-gl";
import { useControl } from "react-map-gl";
import type { MapRef, ControlPosition } from "react-map-gl";

type DrawControlProps = ConstructorParameters<typeof MapboxDraw>[0] & {
    position?: ControlPosition;
    controls?: MapboxDrawControls | undefined;
    displayControlsDefault?: boolean;
    onCreate: (evt: { features: object[] }) => void;
    onUpdate: (evt: { features: object[]; action: string }) => void;
    onDelete: (evt: { features: object[] }) => void;
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
            map.on("draw.create" as keyof MapEventType, onCreate);
            map.on("draw.update" as keyof MapEventType, onUpdate);
            map.on("draw.delete" as keyof MapEventType, onDelete);
        },
        ({ map }: { map: MapRef }) => {
            map.off("draw.create" as keyof MapEventType, onCreate);
            map.off("draw.update" as keyof MapEventType, onUpdate);
            map.off("draw.delete" as keyof MapEventType, onDelete);
        },
        {
            position: position,
        },
    );

    return null;
};

export default DrawControl;
