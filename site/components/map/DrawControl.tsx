import MapboxDraw, { DrawMode, MapboxDrawControls } from "@mapbox/mapbox-gl-draw";
import { Feature, GeoJsonProperties, Polygon } from "geojson";
import extend from "lodash/extend";
import { useControl } from "react-map-gl";
import type { ControlPosition } from "react-map-gl";

export type PolygonFeature = Feature<Polygon, GeoJsonProperties>;

type DrawControlProps = ConstructorParameters<typeof MapboxDraw>[0] & {
    position?: ControlPosition;
    controls?: MapboxDrawControls | undefined;
    displayControlsDefault?: boolean;
    onCreate: (evt: { features: PolygonFeature[] }) => void;
    onUpdate: (evt: { features: PolygonFeature[]; action: string }) => void;
    onDelete: () => void;
};

const NewSimpleSelect = extend(MapboxDraw.modes.simple_select, {
    dragMove() {
        return;
    },
});

const NewDirectSelect = extend(MapboxDraw.modes.direct_select, {
    dragFeature() {
        return;
    },
});

const DrawControl = ({
    onCreate,
    onUpdate,
    onDelete,
    position,
    controls,
    displayControlsDefault,
}: DrawControlProps): null => {
    const draw = new MapboxDraw({
        controls,
        displayControlsDefault,
        modes: {
            ...MapboxDraw.modes,
            simple_select: NewSimpleSelect,
            direct_select: NewDirectSelect,
        },
    });

    const selectFeature = (featureId: string) => {
        draw.changeMode("simple_select", {
            featureIds: [featureId],
        });
    };

    useControl<MapboxDraw>(
        () => {
            return draw;
        },

        ({ map }) => {
            map.on("draw.create", onCreate);
            map.on("draw.update", onUpdate);
            map.on("draw.delete", () => {
                setTimeout(() => {
                    draw.deleteAll();
                    onDelete();
                }, 0);
            });
            map.on("draw.modechange", (e: { mode: DrawMode }) => {
                const features = draw.getAll().features;

                if (features.length > 1 && features[0].id) {
                    if (e.mode === "draw_polygon") {
                        selectFeature(features[0].id.toString());
                        setTimeout(() => {
                            draw.deleteAll();
                            onDelete();
                            draw.changeMode("draw_polygon");
                        }, 0);
                    }
                } else if (features.length === 1 && features[0].id) {
                    if (e.mode === "direct_select") {
                        selectFeature(features[0].id.toString());
                    }
                }
            });

            map.on("draw.selectionchange", () => {
                const features = draw.getAll().features;
                if (features.length === 0) {
                    draw.changeMode("draw_polygon");
                } else if (features.length > 0 && features[0].id) {
                    selectFeature(features[0].id.toString());
                }
            });
        },
        ({ map }) => {
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
