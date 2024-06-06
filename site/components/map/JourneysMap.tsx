import { Routes, Service, Stop } from "@create-disruptions-data/shared-ts/disruptionTypes";
import { Datasource } from "@create-disruptions-data/shared-ts/enums";
import { Feature, GeoJsonProperties, Geometry } from "geojson";
import { LineLayout, LinePaint, MapLayerMouseEvent, Point } from "mapbox-gl";
import {
    CSSProperties,
    Dispatch,
    ReactElement,
    SetStateAction,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import MapBox, { Layer, Popup, Source, ViewState } from "react-map-gl";
import MapControls from "./MapControls";
import Markers from "./Markers";
import { RouteWithServiceInfo } from "../../utils";
import { getStopType } from "../../utils/formUtils";

interface JourneysMapProps extends MapProps {
    dataSource: Datasource;
}
interface MapProps {
    initialViewState: Partial<ViewState>;
    style: CSSProperties;
    mapStyle: string;
    stopOptions: Stop[];
    inputId?: keyof Stop;
    searchedRoutes?: Partial<RouteWithServiceInfo[]>;
    setSearchedRoutes: Dispatch<SetStateAction<Partial<RouteWithServiceInfo[]>>>;
    serviceOptionsForDropdown: Service[];
    setServiceOptionsForDropdown: Dispatch<SetStateAction<Service[]>>;
    showUnderground?: boolean;
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
    stopOptions = [],
    searchedRoutes = [],
    serviceOptionsForDropdown = [],
}: JourneysMapProps): ReactElement | null => {
    const mapboxAccessToken = process.env.MAP_BOX_ACCESS_TOKEN;
    const [markerData, setMarkerData] = useState<Stop[]>([]);

    const [popupInfo, setPopupInfo] = useState<Partial<Stop>>({});
    const [hoverInfo, setHoverInfo] = useState<{ longitude: number; latitude: number; serviceId: number }>(
        initialHoverState,
    );

    const [selectedServicesRoutes, setSelectedServicesRoutes] =
        useState<Partial<(Routes & { serviceId: number })[]>>(searchedRoutes);

    useEffect(() => {
        setSelectedServicesRoutes(searchedRoutes);
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
            const searchedAtcoCodes = stopOptions.map((searchItem) => searchItem.atcoCode);

            const stopsOnMap = [
                ...stopOptions,
                ...markerData.filter((item) => !searchedAtcoCodes.includes(item.atcoCode)),
            ];
            const stopInfo = stopsOnMap.find((stop) => stop.atcoCode === id);
            if (stopInfo) setPopupInfo(stopInfo);
        },
        [stopOptions, markerData],
    );

    const unselectMarker = useCallback(() => {}, []);

    const selectMarker = useCallback(async () => {}, []);

    const onUpdate = useCallback(() => {
        setPopupInfo({});
    }, []);

    const onDelete = useCallback(() => {
        setMarkerData([]);
        setPopupInfo({});
    }, []);

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
            selectedServicesRoutes && selectedServicesRoutes.length > 0
                ? selectedServicesRoutes.flatMap((sr) => {
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
        [selectedServicesRoutes],
    );

    const getServiceInfo = (id: number) => {
        const service = serviceOptionsForDropdown
            ? serviceOptionsForDropdown.find((service) => service.id === id)
            : null;
        return service
            ? `Line: ${service.lineName} - ${service.origin.replace("_", " ")} - ${service.destination.replace(
                  "_",
                  " ",
              )} (${service.operatorShortName})`
            : "Line: N/A";
    };

    return mapboxAccessToken ? (
        <>
            <MapBox
                initialViewState={initialViewState}
                style={style}
                mapStyle={mapStyle}
                mapboxAccessToken={mapboxAccessToken}
                onMouseMove={onHover}
                interactiveLayerIds={getInteractiveLayerIds()}
                onRender={(event) => event.target.resize()}
            >
                <MapControls onUpdate={onUpdate} onDelete={onDelete} polygon={false} trash={false} />
                <Markers
                    selectedStops={[]}
                    stopOptions={stopOptions}
                    handleMouseEnter={handleMouseEnter}
                    markerData={markerData}
                    selectMarker={selectMarker}
                    unselectMarker={unselectMarker}
                    setPopupInfo={setPopupInfo}
                />
                {selectedServicesRoutes ? getSourcesInbound(selectedServicesRoutes) : null}
                {selectedServicesRoutes ? getSourcesOutbound(selectedServicesRoutes) : null}
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
                        offset={new Point(0, -10)}
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
