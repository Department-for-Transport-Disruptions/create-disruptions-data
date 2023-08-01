import { Datasource, Modes, VehicleMode } from "@create-disruptions-data/shared-ts/enums";
import { LoadingBox } from "@govuk-react/loading-box";
import { Feature, GeoJsonProperties, Geometry } from "geojson";
import { LineLayout, LinePaint, MapLayerMouseEvent } from "mapbox-gl";
import {
    CSSProperties,
    Dispatch,
    ReactElement,
    SetStateAction,
    SyntheticEvent,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import MapBox, { Layer, Popup, Source, ViewState } from "react-map-gl";
import { z } from "zod";
import { PolygonFeature } from "./DrawControl";
import MapControls from "./MapControls";
import Markers from "./Markers";
import { fetchServicesByStops, fetchStops } from "../../data/refDataApi";
import { PageState } from "../../interfaces";
import {
    Routes,
    Service,
    ServicesConsequence,
    Stop,
    serviceSchema,
    servicesConsequenceSchema,
    stopSchema,
} from "../../schemas/consequence.schema";
import { flattenZodErrors } from "../../utils";
import { getStopType, sortStops } from "../../utils/formUtils";

interface ServiceMapProps extends MapProps {
    dataSource?: Datasource;
}
interface MapProps {
    initialViewState: Partial<ViewState>;
    style: CSSProperties;
    mapStyle: string;
    selected: Stop[];
    searched: Stop[];
    inputId?: keyof Stop;
    showSelectAllButton?: boolean;
    stateUpdater: Dispatch<SetStateAction<PageState<Partial<ServicesConsequence>>>>;
    state: PageState<Partial<ServicesConsequence>>;
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

export const getMarkerDataInAService = (
    markerData: Stop[],
    servicesStopsInPolygon: string[],
    servicesInPolygon: (Service & { stops: string[]; routes: Routes })[],
) => {
    return markerData
        .filter((marker) => servicesStopsInPolygon.includes(marker.atcoCode))
        .map((marker) => {
            const services = servicesInPolygon.filter((service) => service.stops.includes(marker.atcoCode));
            return {
                ...marker,
                serviceIds: services.length > 0 ? services.map((s) => s.id) : undefined,
            };
        });
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
    dataSource,
}: ServiceMapProps): ReactElement | null => {
    const mapboxAccessToken = process.env.MAP_BOX_ACCESS_TOKEN;
    const [features, setFeatures] = useState<{ [key: string]: PolygonFeature }>({});
    const [markerData, setMarkerData] = useState<Stop[]>([]);
    const [showSelectAllText, setShowSelectAllText] = useState<boolean>(true);
    const [popupInfo, setPopupInfo] = useState<Partial<Stop>>({});
    const [hoverInfo, setHoverInfo] = useState<{ longitude: number; latitude: number; serviceId: number }>(
        initialHoverState,
    );
    const [loading, setLoading] = useState(false);

    const [selectedServices, setSelectedServices] =
        useState<Partial<(Routes & { serviceId: number })[] | undefined>>(searchedRoutes);

    useEffect(() => {
        setSelectedServices(searchedRoutes);
    }, [searchedRoutes]);

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
            const searchedAtcoCodes = searched.map((searchItem) => searchItem.atcoCode);
            const selectedAtcoCodes = selected.map((selectedItem) => selectedItem.atcoCode);
            const stopsOnMap = [
                ...selected,
                ...searched,
                ...markerData.filter(
                    (item) => !searchedAtcoCodes.includes(item.atcoCode) && !selectedAtcoCodes.includes(item.atcoCode),
                ),
            ];
            const stopInfo = stopsOnMap.find((stop) => stop.atcoCode === id);
            if (stopInfo) setPopupInfo(stopInfo);
        },
        [searched, selected, markerData],
    );

    const unselectMarker = useCallback(
        (id: string) => {
            if (state) {
                const stops = sortStops(selected.filter((stop: Stop) => stop.atcoCode !== id));

                stateUpdater({
                    ...state,
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
                const stop: Stop[] = [...searched, ...markerData].filter((stop: Stop) => stop.atcoCode === id);

                stateUpdater({
                    ...state,
                    inputs: {
                        ...state.inputs,
                        stops: sortStops([...selected, ...stop]),
                    },
                    errors: state.errors,
                });
            }
        },
        [searched, selected, state, stateUpdater, markerData],
    );

    useEffect(() => {
        if (features && Object.values(features).length > 0) {
            const polygon = Object.values(features)[0].geometry.coordinates[0];
            const loadOptions = async () => {
                setLoading(true);
                const vehicleMode = state.inputs.vehicleMode as Modes | VehicleMode;
                const stopsData = await fetchStops({
                    adminAreaCodes: state.sessionWithOrg?.adminAreaCodes ?? ["undefined"],
                    polygon,
                    ...(vehicleMode === VehicleMode.bus ? { busStopType: "MKD" } : {}),
                    ...(vehicleMode === VehicleMode.bus
                        ? { stopTypes: ["BCT"] }
                        : vehicleMode === VehicleMode.tram || vehicleMode === Modes.metro
                        ? { stopTypes: ["MET", "PLT"] }
                        : vehicleMode === Modes.ferry || vehicleMode === VehicleMode.ferryService
                        ? { stopTypes: ["FER", "FBT"] }
                        : { stopTypes: ["undefined"] }),
                });

                if (stopsData) {
                    setMarkerData(stopsData);
                    setSelectedServices([]);
                    clearServicesAndStops();
                } else {
                    setMarkerData([]);
                }
            };

            loadOptions()
                // eslint-disable-next-line no-console
                .catch(console.error);
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const addSelectedStopsAndServices = async (includeMarkerData?: boolean) => {
        const parsed = z.array(stopSchema).safeParse(searched);
        if (!parsed.success) {
            stateUpdater({
                ...state,
                errors: [
                    ...state.errors.filter((err) => !Object.keys(servicesConsequenceSchema.shape).includes(err.id)),
                    ...flattenZodErrors(parsed.error),
                ],
            });
        } else {
            if (showSelectAllText) {
                setLoading(true);
                const atcoCodes = includeMarkerData ? markerData.map((marker) => marker.atcoCode) : [];

                const servicesInPolygon = includeMarkerData
                    ? dataSource
                        ? await fetchServicesByStops({ atcoCodes, includeRoutes: true, dataSource: dataSource })
                        : await fetchServicesByStops({ atcoCodes, includeRoutes: true })
                    : [];

                const servicesStopsInPolygon = servicesInPolygon.flatMap((service) => service.stops);

                const markerDataInAService = includeMarkerData
                    ? getMarkerDataInAService(markerData, servicesStopsInPolygon, servicesInPolygon)
                    : [];

                const servicesToAdd = servicesInPolygon
                    .filter((service) =>
                        service.stops.filter((stop) => markerData.map((marker) => marker.atcoCode).includes(stop)),
                    )
                    .map((service) => serviceSchema.parse(service));

                setSelectedServices(
                    [
                        ...(selectedServices ?? []),
                        ...(includeMarkerData
                            ? servicesInPolygon.map((service) => ({
                                  serviceId: service.id,
                                  inbound: service.routes.inbound,
                                  outbound: service.routes.outbound,
                              }))
                            : []),
                    ].filter(
                        (value, index, self) => index === self.findIndex((s) => s?.serviceId === value?.serviceId),
                    ),
                );

                stateUpdater({
                    ...state,
                    inputs: {
                        ...state.inputs,
                        stops: sortStops(
                            [
                                ...(state.inputs.stops ?? []),
                                ...(includeMarkerData ? markerDataInAService : []),
                                ...(searched.length > 0 ? searched : []),
                            ]
                                .filter(
                                    (value, index, self) =>
                                        index === self.findIndex((s) => s.atcoCode === value.atcoCode),
                                )
                                .splice(0, 100),
                        ),
                        ...(state.inputs?.services
                            ? {
                                  services: [...state.inputs?.services, ...servicesToAdd].filter(
                                      (value, index, self) => index === self.findIndex((s) => s.id === value.id),
                                  ),
                              }
                            : { services: [...servicesToAdd] }),
                    },
                    errors: [
                        ...state.errors.filter((err) => !Object.keys(servicesConsequenceSchema.shape).includes(err.id)),
                    ],
                });
                setLoading(false);
            }
        }
    };

    const clearServicesAndStops = () => {
        stateUpdater({
            ...state,
            inputs: {
                ...state.inputs,
                stops: [],
                ...(state.inputs?.services
                    ? {
                          services: [],
                      }
                    : {}),
            },
            errors: state.errors,
        });
    };

    const selectAllStops = async (evt: SyntheticEvent) => {
        evt.preventDefault();
        clearServicesAndStops();
        if (selectedServices && selectedServices.length > 0) {
            if (!showSelectAllText) {
                setSelectedServices(searchedRoutes);
            } else {
                await addSelectedStopsAndServices();
            }
        } else {
            await addSelectedStopsAndServices(true);
        }
        setShowSelectAllText(!showSelectAllText);
        return;
    };

    useEffect(() => {
        setShowSelectAllText(true);
    }, [searchedRoutes]);

    const onHover = useCallback((event: MapLayerMouseEvent) => {
        setHoverInfo(initialHoverState);
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
                        data={createLineString(searchedRoute.inbound as Stop[], searchedRoute?.serviceId)}
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
                        data={createLineString(searchedRoute.outbound as Stop[], searchedRoute?.serviceId)}
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
            selectedServices && selectedServices.length > 0
                ? selectedServices.flatMap((sr) => {
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
        [selectedServices],
    );

    const getServiceInfo = (id: number) => {
        const service = services ? services.find((service) => service.id === id) : null;
        return service
            ? `Line: ${service.lineName} - ${service.origin.replace("_", " ")} - ${service.destination.replace(
                  "_",
                  " ",
              )} (${service.operatorShortName})`
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
                        loading ||
                        !(
                            (features && Object.values(features).length > 0) ||
                            markerData.length > 0 ||
                            (searchedRoutes && searchedRoutes.length > 0)
                        )
                    }
                >
                    {showSelectAllText ? "Select all" : "Unselect all"}
                </button>
            ) : null}
            <LoadingBox loading={loading}>
                <MapBox
                    initialViewState={initialViewState}
                    style={style}
                    mapStyle={mapStyle}
                    mapboxAccessToken={mapboxAccessToken}
                    onMouseMove={onHover}
                    interactiveLayerIds={getInteractiveLayerIds()}
                    onRender={(event) => event.target.resize()}
                >
                    <MapControls onUpdate={onUpdate} onDelete={onDelete} />
                    <Markers
                        selected={selected}
                        searched={searched}
                        handleMouseEnter={handleMouseEnter}
                        markerData={markerData}
                        selectMarker={selectMarker}
                        unselectMarker={unselectMarker}
                        setPopupInfo={setPopupInfo}
                    />
                    {selectedServices ? getSourcesInbound(selectedServices) : null}
                    {selectedServices ? getSourcesOutbound(selectedServices) : null}
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
                                <p className="govuk-body-s mb-1">{`${getStopType(popupInfo.stopType)}: ${
                                    popupInfo.commonName || "N/A"
                                } (${popupInfo.indicator || ""})`}</p>
                                <p className="govuk-body-s mb-1">Bearing: {popupInfo.bearing || "N/A"}</p>
                                <p className="govuk-body-s mb-1">ATCO code: {popupInfo.atcoCode}</p>
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
            </LoadingBox>
        </>
    ) : null;
};

export default Map;
