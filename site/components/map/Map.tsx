import { Feature, GeoJsonProperties, Geometry } from "geojson";
import uniqueId from "lodash/uniqueId";
import { LineLayout, LinePaint } from "mapbox-gl";
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
import MapBox, { Layer, Marker, Popup, Source, ViewState } from "react-map-gl";
import { z } from "zod";
import DrawControl, { PolygonFeature } from "./DrawControl";
import { ADMIN_AREA_CODE, API_BASE_URL } from "../../constants";
import { PageState } from "../../interfaces";
import {
    Routes,
    ServicesConsequence,
    Stop,
    StopsConsequence,
    servicesConsequenceSchema,
    stopSchema,
    stopsConsequenceSchema,
} from "../../schemas/consequence.schema";
import { flattenZodErrors } from "../../utils";
import { sortStops } from "../../utils/formUtils";
interface MapProps {
    initialViewState: Partial<ViewState>;
    style: CSSProperties;
    mapStyle: string;
    selected: Stop[];
    searched: Stop[];
    inputId?: keyof Stop;
    showSelectAllButton?: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    stateUpdater: Dispatch<SetStateAction<PageState<any>>>;
    state: PageState<Partial<StopsConsequence | ServicesConsequence>>;
    searchedRoutes?: Routes;
}

const lineLayout: LineLayout = {
    "line-join": "round",
    "line-cap": "round",
};

const lineStyle: LinePaint = {
    "line-color": "rgba(3, 170, 238, 0.5)",
    "line-width": 5,
};

const Map = ({
    initialViewState,
    style,
    mapStyle,
    selected,
    searched,
    showSelectAllButton = false,
    stateUpdater = () => "",
    state,
    searchedRoutes,
}: MapProps): ReactElement | null => {
    const mapboxAccessToken = process.env.MAP_BOX_ACCESS_TOKEN;
    const [features, setFeatures] = useState<{ [key: string]: PolygonFeature }>({});
    const [markerData, setMarkerData] = useState<Stop[]>([]);
    const [selectAll, setSelectAll] = useState<boolean>(true);
    const [popupInfo, setPopupInfo] = useState<Partial<Stop>>({});

    const createLineString = (coordinates: Stop[]): Feature<Geometry, GeoJsonProperties> => ({
        type: "Feature",
        properties: {},
        geometry: {
            type: "LineString",
            coordinates: coordinates.map((stop) => [stop.longitude, stop.latitude]),
        },
    });

    const handleMouseEnter = useCallback(
        (id: string) => {
            const stopsOnMap = [...selected, ...searched];
            const stopInfo = stopsOnMap.find((stop) => stop.atcoCode === id);
            if (stopInfo) setPopupInfo(stopInfo);
        },
        [searched, selected],
    );

    const unselectMarker = useCallback(
        (id: string) => {
            if (state) {
                const stops = sortStops(selected.filter((stop: Stop) => stop.atcoCode !== id));

                stateUpdater({
                    inputs: {
                        ...state.inputs,
                        stops,
                    },
                    errors: state.errors,
                });
            }
        },
        [selected, state, stateUpdater],
    );

    const selectMarker = useCallback(
        (id: string) => {
            if (state) {
                const stop: Stop[] = searched.filter((stop: Stop) => stop.atcoCode === id);

                stateUpdater({
                    inputs: {
                        ...state.inputs,
                        stops: sortStops([...selected, ...stop]),
                    },
                    errors: state.errors,
                });
            }
        },
        [searched, selected, state, stateUpdater],
    );

    const getMarkers = useCallback(
        (selected: Stop[], searched: Stop[]): ReactNode => {
            const inTable =
                selected && selected.length > 0
                    ? selected.map((s: Stop) => (
                          <Marker
                              key={uniqueId(s.atcoCode)}
                              longitude={Number(s.longitude)}
                              latitude={Number(s.latitude)}
                              onClick={() => {
                                  unselectMarker(s.atcoCode);
                              }}
                          >
                              <div
                                  className="bg-markerActive h-4 w-4 rounded-full inline-block cursor-pointer"
                                  onMouseEnter={() => {
                                      handleMouseEnter(s.atcoCode);
                                  }}
                                  onMouseLeave={() => {
                                      setPopupInfo({});
                                  }}
                              />
                          </Marker>
                      ))
                    : [];
            const dataFromPolygon = markerData.filter((sToFilter: Stop) =>
                selected && selected.length > 0
                    ? !selected.map((s) => s.atcoCode).includes(sToFilter.atcoCode)
                    : sToFilter,
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
                    onClick={() => {
                        selectMarker(s.atcoCode);
                    }}
                >
                    <div
                        className="bg-markerDefault h-4 w-4 rounded-full inline-block cursor-pointer"
                        onMouseEnter={() => {
                            handleMouseEnter(s.atcoCode);
                        }}
                        onMouseLeave={() => {
                            setPopupInfo({});
                        }}
                    />
                </Marker>
            ));

            const markers = [...inTable, ...greyMarkers];

            return markers.length > 0 ? markers.slice(0, 100) : null;
        },
        [markerData, handleMouseEnter, selectMarker, unselectMarker],
    );

    useEffect(() => {
        if (features && Object.values(features).length > 0) {
            const polygon = Object.values(features)[0].geometry.coordinates[0];
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
    }, [features]);

    const onUpdate = useCallback((evt: { features: PolygonFeature[] }) => {
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
        setPopupInfo({});
    }, []);

    const onDelete = useCallback((evt: { features: PolygonFeature[] }) => {
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
        setPopupInfo({});
    }, []);

    const selectAllStops = (evt: SyntheticEvent) => {
        evt.preventDefault();
        if (searchedRoutes) {
            if (!selectAll) {
                stateUpdater({
                    inputs: {
                        ...state.inputs,
                        stops: [],
                    },
                    errors: state.errors,
                });
            } else {
                const parsed = z.array(stopSchema).safeParse(searched);
                if (!parsed.success) {
                    stateUpdater({
                        ...state,
                        errors: [
                            ...state.errors.filter(
                                (err) => !Object.keys(servicesConsequenceSchema.shape).includes(err.id),
                            ),
                            ...flattenZodErrors(parsed.error),
                        ],
                    });
                } else {
                    if (searched.length > 0 && selectAll) {
                        stateUpdater({
                            inputs: {
                                ...state.inputs,
                                stops: sortStops(
                                    [...(state.inputs.stops ?? []), ...searched]
                                        .splice(0, 100)
                                        .filter(
                                            (value, index, self) =>
                                                index === self.findIndex((s) => s.atcoCode === value.atcoCode),
                                        ),
                                ),
                            },
                            errors: [
                                ...state.errors.filter(
                                    (err) => !Object.keys(servicesConsequenceSchema.shape).includes(err.id),
                                ),
                            ],
                        });
                    }
                }
            }
            setSelectAll(!selectAll);
            return;
        }
        if (!selectAll) {
            stateUpdater({
                inputs: {
                    ...state.inputs,
                    stops: selected.filter((sToFilter: Stop) =>
                        markerData && markerData.length > 0
                            ? !markerData.map((s) => s.atcoCode).includes(sToFilter.atcoCode)
                            : sToFilter,
                    ),
                },
                errors: state.errors,
            });
        } else {
            const parsed = z.array(stopSchema).safeParse(markerData);
            if (!parsed.success) {
                stateUpdater({
                    ...state,
                    errors: [
                        ...state.errors.filter((err) => !Object.keys(stopsConsequenceSchema.shape).includes(err.id)),
                        ...flattenZodErrors(parsed.error),
                    ],
                });
            } else {
                if (markerData.length > 0 && selectAll) {
                    stateUpdater({
                        inputs: {
                            ...state.inputs,
                            stops: sortStops(
                                [...selected, ...markerData]
                                    .splice(0, 100)
                                    .filter(
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
                }
            }
        }
        setSelectAll(!selectAll);
    };

    return mapboxAccessToken ? (
        <>
            <div className="govuk-warning-text">
                <span className="govuk-warning-text__icon" aria-hidden="true">
                    !
                </span>
                <strong className="govuk-warning-text__text">
                    <span className="govuk-warning-text__assistive">Warning</span>
                    {`Stop selection capped at 100, ${selected.length || "0"} stops currently selected`}
                </strong>
            </div>
            {showSelectAllButton ? (
                <button
                    className="govuk-button govuk-button--secondary mt-2"
                    data-module="govuk-button"
                    onClick={selectAllStops}
                    disabled={
                        (!(features && Object.values(features).length > 0) && !searchedRoutes) ||
                        (searchedRoutes && searchedRoutes.inbound.length === 0 && searchedRoutes.outbound.length === 0)
                    }
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
                {searchedRoutes && searchedRoutes.inbound ? (
                    <Source id="inboundRoute" type="geojson" data={createLineString(searchedRoutes.inbound)}>
                        <Layer
                            id="lineInboundLayer"
                            type="line"
                            source="my-data"
                            layout={lineLayout}
                            paint={lineStyle}
                        />
                    </Source>
                ) : null}
                {searchedRoutes && searchedRoutes.outbound ? (
                    <Source id="outboundRoute" type="geojson" data={createLineString(searchedRoutes.outbound)}>
                        <Layer
                            id="lineOutboundLayer"
                            type="line"
                            source="my-data"
                            layout={lineLayout}
                            paint={lineStyle}
                        />
                    </Source>
                ) : null}
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
                {popupInfo.atcoCode && (
                    <Popup
                        anchor="top"
                        longitude={Number(popupInfo.longitude)}
                        latitude={Number(popupInfo.latitude)}
                        onClose={() => setPopupInfo({})}
                        closeButton={false}
                        closeOnMove
                    >
                        <div>
                            <p className="govuk-body-s mb-1">AtcoCode: {popupInfo.atcoCode}</p>
                            <p className="govuk-body-s mb-1">Bearing: {popupInfo.bearing || "N/A"}</p>
                            <p className="govuk-body-s mb-1">Name: {popupInfo.commonName}</p>
                        </div>
                    </Popup>
                )}
            </MapBox>
        </>
    ) : null;
};

export default Map;
