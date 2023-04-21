import { Feature, GeoJsonProperties, Geometry } from "geojson";
import uniqueId from "lodash/uniqueId";
import { LineLayout, LinePaint, MapLayerMouseEvent } from "mapbox-gl";
import {
    CSSProperties,
    Dispatch,
    ReactElement,
    ReactNode,
    SetStateAction,
    SyntheticEvent,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import MapBox, { Layer, Marker, Popup, Source, ViewState } from "react-map-gl";
import { z } from "zod";
import DrawControl, { PolygonFeature } from "./DrawControl";
import GeocoderControl from "./GeocoderControl";
import { ADMIN_AREA_CODE, API_BASE_URL } from "../../constants";
import { PageState } from "../../interfaces";
import {
    Routes,
    Service,
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
    searchedRoutes?: Partial<(Routes & { serviceId: number })[]>;
    services?: Service[];
}

const lineLayout: LineLayout = {
    "line-join": "round",
    "line-cap": "round",
};

const lineStyle: LinePaint = {
    "line-color": "rgba(3, 170, 238, 0.5)",
    "line-width": 5,
};

const lineStyleHighlight: LinePaint = {
    "line-color": "rgba(47,146,188,255)",
    "line-width": 5,
    "line-opacity": 0.75,
};

const initialHoverState = {
    longitude: 0,
    latitude: 0,
    serviceId: -1,
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
    services,
}: MapProps): ReactElement | null => {
    const mapboxAccessToken = process.env.MAP_BOX_ACCESS_TOKEN;
    const [features, setFeatures] = useState<{ [key: string]: PolygonFeature }>({});
    const [markerData, setMarkerData] = useState<Stop[]>([]);
    const [showSelectAllText, setShowSelectAllText] = useState<boolean>(true);
    const [popupInfo, setPopupInfo] = useState<Partial<Stop>>({});
    const [hoverInfo, setHoverInfo] = useState<{ longitude: number; latitude: number; serviceId: number }>(
        initialHoverState,
    );

    const createLineString = (coordinates: Stop[], serviceId: number): Feature<Geometry, GeoJsonProperties> => ({
        type: "Feature",
        properties: { serviceId },
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
        setShowSelectAllText(true);
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
        setShowSelectAllText(true);
        setMarkerData([]);
        setPopupInfo({});
    }, []);

    const selectAllStops = (evt: SyntheticEvent) => {
        evt.preventDefault();
        if (searchedRoutes) {
            if (!showSelectAllText) {
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
                    if (searched.length > 0 && showSelectAllText) {
                        stateUpdater({
                            inputs: {
                                ...state.inputs,
                                stops: sortStops(
                                    [...(state.inputs.stops ?? []), ...searched]
                                        .filter(
                                            (value, index, self) =>
                                                index === self.findIndex((s) => s.atcoCode === value.atcoCode),
                                        )
                                        .splice(0, 100),
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
            setShowSelectAllText(!showSelectAllText);
            return;
        }
        if (!showSelectAllText) {
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
                if (markerData.length > 0 && showSelectAllText) {
                    stateUpdater({
                        inputs: {
                            ...state.inputs,
                            stops: sortStops(
                                [...selected, ...markerData]
                                    .filter(
                                        (value, index, self) =>
                                            index === self.findIndex((s) => s.atcoCode === value.atcoCode),
                                    )
                                    .splice(0, 100),
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
        setShowSelectAllText(!showSelectAllText);
    };

    useEffect(() => {
        setShowSelectAllText(true);
    }, [searchedRoutes]);

    const onHover = useCallback((event: MapLayerMouseEvent) => {
        const service = event.features && event.features[0];
        if (service && service.properties && service.properties.serviceId) {
            setHoverInfo({
                longitude: event.lngLat.lng,
                latitude: event.lngLat.lat,
                serviceId: service && (service.properties.serviceId as number),
            });
        }
    }, []);

    const selectedService = (hoverInfo && hoverInfo.serviceId) || "";
    const filter = useMemo(() => ["==", "serviceId", selectedService], [selectedService]);

    const getSourcesInbound = useCallback(
        (searchedRoutes: Partial<(Routes & { serviceId: number })[]>) =>
            searchedRoutes.map((searchedRoute) =>
                searchedRoute?.inbound && searchedRoute?.serviceId ? (
                    <Source
                        key={searchedRoute.serviceId}
                        id={`inbound-route-${searchedRoute.serviceId}`}
                        type="geojson"
                        data={createLineString(searchedRoute.inbound, searchedRoute?.serviceId)}
                    >
                        <Layer
                            id={`services-inbound-${searchedRoute.serviceId}`}
                            type="line"
                            source={`services-inbound-${searchedRoute.serviceId}`}
                            layout={lineLayout}
                            paint={lineStyle}
                        />
                        <Layer
                            id={`services-highlighted-inbound-${searchedRoute.serviceId}`}
                            type="line"
                            source={`services-inbound-${searchedRoute.serviceId}`}
                            layout={lineLayout}
                            paint={lineStyleHighlight}
                            filter={filter}
                        />
                    </Source>
                ) : null,
            ),

        [filter],
    );

    const getSourcesOutbound = useCallback(
        (searchedRoutes: Partial<(Routes & { serviceId: number })[]>) =>
            searchedRoutes.map((searchedRoute) =>
                searchedRoute?.outbound && searchedRoute?.serviceId ? (
                    <Source
                        key={searchedRoute.serviceId}
                        id={`outbound-route-${searchedRoute.serviceId}`}
                        type="geojson"
                        data={createLineString(searchedRoute.outbound, searchedRoute?.serviceId)}
                    >
                        <Layer
                            id={`services-outbound-${searchedRoute.serviceId}`}
                            type="line"
                            source={`services-outbound-${searchedRoute.serviceId}`}
                            layout={lineLayout}
                            paint={lineStyle}
                        />
                        <Layer
                            id={`services-highlighted-outbound-${searchedRoute.serviceId}`}
                            type="line"
                            source={`services-outbound-${searchedRoute.serviceId}`}
                            layout={lineLayout}
                            paint={lineStyleHighlight}
                            filter={filter}
                        />
                    </Source>
                ) : null,
            ),
        [filter],
    );

    const getInteractiveLayerIds = useCallback(
        () =>
            searchedRoutes && searchedRoutes.length > 0
                ? searchedRoutes.flatMap((sr) => {
                      if (sr?.inbound && sr.outbound && sr.serviceId) {
                          return [`services-inbound-${sr.serviceId || ""}`, `services-outbound-${sr.serviceId || ""}`];
                      }
                      if (sr?.inbound && sr.serviceId) {
                          return [`services-inbound-${sr?.serviceId || ""}`];
                      }
                      if (sr?.outbound && sr.serviceId) {
                          return [`services-outbound-${sr?.serviceId || ""}`];
                      }
                      return [];
                  })
                : [],
        [searchedRoutes],
    );

    const getServiceInfo = (id: number) => {
        const service = services ? services.find((service) => service.id === id) : null;
        return service
            ? `Line: ${service.origin.replace("_", " ")} - ${service.destination.replace("_", " ")}`
            : "Line: N/A";
    };
    return mapboxAccessToken ? (
        <>
            {selected.length === 100 ? (
                <div className="govuk-warning-text">
                    <span className="govuk-warning-text__icon" aria-hidden="true">
                        !
                    </span>
                    <strong className="govuk-warning-text__text">
                        <span className="govuk-warning-text__assistive">Warning</span>
                        {`Stop selection capped at 100, ${selected.length} stops currently selected`}
                    </strong>
                </div>
            ) : null}
            {showSelectAllButton ? (
                <button
                    className="govuk-button govuk-button--secondary mt-2"
                    data-module="govuk-button"
                    onClick={selectAllStops}
                    disabled={
                        !searchedRoutes
                            ? !(features && Object.values(features).length > 0) && !searchedRoutes
                            : searchedRoutes.length <= 0
                    }
                >
                    {showSelectAllText ? "Select all stops" : "Unselect all stops"}
                </button>
            ) : null}
            <MapBox
                initialViewState={initialViewState}
                style={style}
                mapStyle={mapStyle}
                mapboxAccessToken={mapboxAccessToken}
                onMouseMove={onHover}
                interactiveLayerIds={getInteractiveLayerIds()}
            >
                <GeocoderControl mapboxAccessToken={mapboxAccessToken} position="top-right" />
                {selected && searched ? getMarkers(selected, searched) : null}
                {searchedRoutes ? getSourcesInbound(searchedRoutes) : null}
                {searchedRoutes ? getSourcesOutbound(searchedRoutes) : null}
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
                            <p className="govuk-body-s mb-1">{`Name: ${popupInfo.commonName || "N/A"} (${
                                popupInfo.indicator || ""
                            })`}</p>
                        </div>
                    </Popup>
                )}
                {selectedService && hoverInfo.latitude ? (
                    <Popup
                        longitude={hoverInfo.longitude}
                        latitude={hoverInfo.latitude}
                        offset={[0, -10]}
                        onClose={() => setHoverInfo(initialHoverState)}
                        closeButton={false}
                        className="service-info"
                        closeOnMove
                    >
                        {getServiceInfo(selectedService)}
                    </Popup>
                ) : null}
            </MapBox>
        </>
    ) : null;
};

export default Map;
