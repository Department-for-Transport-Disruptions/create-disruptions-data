import { Modes, VehicleMode } from "@create-disruptions-data/shared-ts/enums";
import { LoadingBox } from "@govuk-react/loading-box";
import MapboxDraw, { DrawMode } from "@mapbox/mapbox-gl-draw";
import _ from "lodash";
import {
    CSSProperties,
    Dispatch,
    MutableRefObject,
    ReactElement,
    SetStateAction,
    SyntheticEvent,
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import MapBox, { MapRef, Popup, ViewState } from "react-map-gl";
import { z } from "zod";
import { PolygonFeature } from "./DrawControl";
import MapControls from "./MapControls";
import Markers from "./Markers";
import { fetchStops } from "../../data/refDataApi";
import { PageState } from "../../interfaces";
import { Stop, StopsConsequence, stopSchema, stopsConsequenceSchema } from "../../schemas/consequence.schema";
import { flattenZodErrors } from "../../utils";
import { getStopType, sortStops } from "../../utils/formUtils";

interface MapProps {
    initialViewState: Partial<ViewState>;
    style: CSSProperties;
    mapStyle: string;
    selected: Stop[];
    searched: Stop[];
    inputId?: keyof Stop;
    showSelectAllButton?: boolean;
    stateUpdater: Dispatch<SetStateAction<PageState<Partial<StopsConsequence>>>>;
    state: PageState<Partial<StopsConsequence>>;
}

const Map = ({
    initialViewState,
    style,
    mapStyle,
    selected,
    searched,
    showSelectAllButton = false,
    stateUpdater = () => "",
    state,
}: MapProps): ReactElement | null => {
    const mapboxAccessToken = process.env.MAP_BOX_ACCESS_TOKEN;
    const [features, setFeatures] = useState<{ [key: string]: PolygonFeature }>({});
    const [markerData, setMarkerData] = useState<Stop[]>([]);
    const [showSelectAllText, setShowSelectAllText] = useState<boolean>(true);
    const [popupInfo, setPopupInfo] = useState<Partial<Stop>>({});
    const [loading, setLoading] = useState(false);

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
                        : vehicleMode === Modes.rail
                        ? { stopTypes: ["RLY"] }
                        : { stopTypes: ["undefined"] }),
                });
                if (stopsData) {
                    setMarkerData(stopsData);
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

    const onDelete = useCallback(() => {
        setFeatures({});
        setShowSelectAllText(true);
        setMarkerData([]);
        setPopupInfo({});
    }, []);

    const mapRef = useRef<MutableRefObject<MapRef | undefined>>();

    const onMapLoad = useCallback(() => {
        const NewSimpleSelect = _.extend(MapboxDraw.modes.simple_select, {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            dragMove() {},
        });

        const NewDirectSelect = _.extend(MapboxDraw.modes.direct_select, {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            dragFeature() {},
        });

        const draw = new MapboxDraw({
            displayControlsDefault: false,
            controls: {
                polygon: true,
                trash: true,
            },
            modes: {
                ...MapboxDraw.modes,
                simple_select: NewSimpleSelect,
                direct_select: NewDirectSelect,
            },
        });

        const deleteFeatures = (event: { features: PolygonFeature[]; mode: DrawMode }) => {
            if (event?.features?.length < 1) {
                if (event.mode === "direct_select") {
                    draw.changeMode("simple_select");
                }
                draw.deleteAll();
                onDelete();
                draw.changeMode("draw_polygon");
            }
        };

        if (mapRef.current) {
            mapRef.current.on("draw.create", onUpdate);
            mapRef.current.on(
                "draw.update",
                (event: { features: PolygonFeature[]; mode: DrawMode; action: string }) => {
                    onUpdate(event);
                    if (event.action === "move") {
                        draw.deleteAll();
                        onDelete();
                    }
                },
            );

            mapRef.current.addControl(draw, "top-left");
            mapRef.current.on("draw.selectionchange", deleteFeatures);
            mapRef.current.on("draw.modechange", (event: { features: PolygonFeature[]; mode: DrawMode }) => {
                if (event.mode === "direct_select") {
                    draw.changeMode("draw_polygon");
                }
                if (event.mode === "draw_polygon") {
                    const data = draw.getAll();

                    const pids: string[] = [];
                    const lid = data.features[data.features.length - 1].id;
                    data.features.forEach((f) => {
                        if (f.geometry.type === "Polygon" && f.id !== lid) {
                            pids.push(f.id as string);
                        }
                    });
                    draw.delete(pids);
                }
            });

            mapRef.current.on("draw.delete", () => {
                setTimeout(() => {
                    draw.deleteAll();
                    onDelete();
                }, 0);
            });
        }
    }, [onUpdate, onDelete]);

    const selectAllStops = (evt: SyntheticEvent) => {
        evt.preventDefault();
        if (!showSelectAllText) {
            stateUpdater({
                ...state,
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
                        ...state,
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
                    disabled={loading || !((features && Object.values(features).length > 0) || markerData.length > 0)}
                >
                    {showSelectAllText ? "Select all stops" : "Unselect all stops"}
                </button>
            ) : null}
            <LoadingBox loading={loading}>
                <MapBox
                    initialViewState={initialViewState}
                    style={style}
                    mapStyle={mapStyle}
                    mapboxAccessToken={mapboxAccessToken}
                    onRender={(event) => event.target.resize()}
                    ref={mapRef}
                    onLoad={onMapLoad}
                >
                    <MapControls />
                    <Markers
                        selected={selected}
                        searched={searched}
                        handleMouseEnter={handleMouseEnter}
                        markerData={markerData}
                        selectMarker={selectMarker}
                        unselectMarker={unselectMarker}
                        setPopupInfo={setPopupInfo}
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
                                <p className="govuk-body-s mb-1">{`${getStopType(popupInfo.stopType)}: ${
                                    popupInfo.commonName || "N/A"
                                } (${popupInfo.indicator || ""})`}</p>
                                <p className="govuk-body-s mb-1">Bearing: {popupInfo.bearing || "N/A"}</p>
                                <p className="govuk-body-s mb-1">ATCO code: {popupInfo.atcoCode}</p>
                            </div>
                        </Popup>
                    )}
                </MapBox>
            </LoadingBox>
        </>
    ) : null;
};

export default Map;
