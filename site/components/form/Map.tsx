import { DrawCreateEvent, DrawDeleteEvent, DrawUpdateEvent } from "@mapbox/mapbox-gl-draw";
import { Feature, GeoJsonProperties, Geometry, Polygon } from "geojson";
import uniqueId from "lodash/uniqueId";
import {
    CSSProperties,
    Dispatch,
    ReactElement,
    ReactNode,
    SetStateAction,
    SyntheticEvent,
    useCallback,
    useEffect,
    useState,
} from "react";
import MapBox, { Marker, ViewState } from "react-map-gl";
import { z } from "zod";
import DrawControl from "./DrawControl";
import { ADMIN_AREA_CODE, API_BASE_URL } from "../../constants";
import { PageState } from "../../interfaces";
import { Stop, StopsConsequence, stopSchema, stopsConsequenceSchema } from "../../schemas/consequence.schema";
import { flattenZodErrors } from "../../utils";
import { sortStops } from "../../utils/formUtils";
interface MapProps {
    initialViewState: Partial<ViewState>;
    style: CSSProperties;
    mapStyle: string;
    selected?: Stop[];
    searched?: Stop[];
    inputId?: keyof Stop;
    stops: Stop[];
    showSelectAllButton?: boolean;
    stateUpdater?: Dispatch<SetStateAction<PageState<Partial<StopsConsequence>>>>;
    state?: PageState<Partial<StopsConsequence>>;
}

const Map = ({
    initialViewState,
    style,
    mapStyle,
    selected,
    searched,
    stops,
    showSelectAllButton = false,
    stateUpdater = () => "",
    state,
}: MapProps): ReactElement | null => {
    const mapboxAccessToken = process.env.MAP_BOX_ACCESS_TOKEN;
    const [features, setFeatures] = useState<{ [key: string]: Feature<Geometry, GeoJsonProperties> }>({});
    const [markerData, setMarkerData] = useState<Stop[]>([]);
    const [selectAll, setSelectAll] = useState<boolean>(true);

    const getMarkers = (selected: Stop[], searched: Stop[]): ReactNode => {
        const inTable =
            selected && selected.length > 0
                ? selected.map((s: Stop) => (
                      <Marker
                          key={uniqueId(s.atcoCode)}
                          longitude={Number(s.longitude)}
                          latitude={Number(s.latitude)}
                      />
                  ))
                : [];
        const dataFromPolygon = markerData.filter((sToFilter: Stop) =>
            selected && selected.length > 0 ? !selected.map((s) => s.atcoCode).includes(sToFilter.atcoCode) : sToFilter,
        );

        const notInTable = searched
            .filter((sToFilter: Stop) =>
                selected && selected.length > 0
                    ? !selected.map((s) => s.atcoCode).includes(sToFilter.atcoCode)
                    : sToFilter,
            )
            .filter((sToFilter: Stop) =>
                markerData && markerData.length > 0
                    ? !markerData.map((s) => s.atcoCode).includes(sToFilter.atcoCode)
                    : sToFilter,
            );

        const greyMarkers = [...dataFromPolygon, ...notInTable].map((s) => (
            <Marker
                key={uniqueId(s.atcoCode)}
                longitude={Number(s.longitude)}
                latitude={Number(s.latitude)}
                color="grey"
            />
        ));

        const markers = [...inTable, ...greyMarkers];

        return markers.length > 0 ? markers.slice(0, 100) : null;
    };

    useEffect(() => {
        if (features && Object.values(features).length > 0 && stops) {
            const polygon = Object.values(features as { [key: string]: Feature<Polygon> })[0].geometry.coordinates[0];
            const loadOptions = async () => {
                const searchApiUrl = `${API_BASE_URL}stops?adminAreaCodes=${ADMIN_AREA_CODE}&polygon=${JSON.stringify(
                    polygon,
                )}`;
                const res = await fetch(searchApiUrl, { method: "GET" });
                const data: Stop[] = z.array(stopSchema).parse(await res.json());
                if (data) {
                    setMarkerData(data);
                } else {
                    setMarkerData([]);
                }
            };

            loadOptions()
                // eslint-disable-next-line no-console
                .catch(console.error);
        }
    }, [features, stops]);

    const onUpdate = useCallback((evt: DrawUpdateEvent | DrawCreateEvent) => {
        setFeatures((currFeatures) => {
            const newFeatures = { ...currFeatures };
            for (const f of evt.features) {
                if (f.id) {
                    newFeatures[f.id] = f;
                }
            }
            return newFeatures;
        });
        setSelectAll(true);
    }, []);

    const onDelete = useCallback((evt: DrawDeleteEvent) => {
        setFeatures((currFeatures) => {
            const newFeatures = { ...currFeatures };
            for (const f of evt.features) {
                if (f.id) {
                    delete newFeatures[f.id];
                }
            }
            return newFeatures;
        });
        setSelectAll(true);
        setMarkerData([]);
    }, []);

    const selectAllStops = (evt: SyntheticEvent) => {
        evt.preventDefault();
        if (!selectAll && state) {
            stateUpdater({
                inputs: {
                    ...state.inputs,
                    stops: [],
                },
                errors: state.errors,
            });
        } else {
            const parsed = z.array(stopSchema).safeParse(markerData);
            if (!parsed.success && state) {
                stateUpdater({
                    ...state,
                    errors: [
                        ...state.errors.filter((err) => !Object.keys(stopsConsequenceSchema.shape).includes(err.id)),
                        ...flattenZodErrors(parsed.error),
                    ],
                });
            } else {
                if (markerData.length > 0 && selectAll && state) {
                    stateUpdater({
                        inputs: {
                            ...state.inputs,
                            stops: sortStops(
                                [...(selected ?? []), ...markerData].filter(
                                    (value, index, self) =>
                                        index === self.findIndex((s) => s.atcoCode === value.atcoCode),
                                ),
                            ),
                        },
                        errors: [
                            ...state.errors.filter(
                                (err) => !Object.keys(stopsConsequenceSchema.shape).includes(err.id),
                            ),
                        ],
                    });
                    setMarkerData([]);
                }
            }
        }
        setSelectAll(!selectAll);
    };

    return mapboxAccessToken ? (
        <>
            {showSelectAllButton ? (
                <button
                    className="govuk-button govuk-button--secondary mt-2"
                    data-module="govuk-button"
                    onClick={selectAllStops}
                >
                    {!selectAll ? "Unselect all stops" : "Select all stops"}
                </button>
            ) : null}
            <MapBox
                initialViewState={initialViewState}
                style={style}
                mapStyle={mapStyle}
                mapboxAccessToken={mapboxAccessToken}
            >
                {selected && searched ? getMarkers(selected, searched) : null}
                <DrawControl
                    position="top-left"
                    displayControlsDefault={false}
                    controls={{
                        polygon: true,
                        trash: true,
                    }}
                    defaultMode="draw_polygon"
                    onCreate={(evt) => {
                        onUpdate(evt as DrawCreateEvent);
                    }}
                    onUpdate={(evt) => {
                        onUpdate(evt as DrawUpdateEvent);
                    }}
                    onDelete={(evt) => {
                        onDelete(evt as DrawDeleteEvent);
                    }}
                />
            </MapBox>
        </>
    ) : null;
};

export default Map;
