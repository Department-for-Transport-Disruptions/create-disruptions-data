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
import MapBox, { Marker, Popup, ViewState } from "react-map-gl";
import { z } from "zod";
import { PolygonFeature } from "./DrawControl";
import MapControls from "./MapControls";
import { ADMIN_AREA_CODE, API_BASE_URL } from "../../constants";
import { PageState } from "../../interfaces";
import { Stop, StopsConsequence, stopSchema, stopsConsequenceSchema } from "../../schemas/consequence.schema";
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
                const stop: Stop[] = [...searched, ...markerData].filter((stop: Stop) => stop.atcoCode === id);

                stateUpdater({
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
                    disabled={!((features && Object.values(features).length > 0) || markerData.length > 0)}
                >
                    {showSelectAllText ? "Select all stops" : "Unselect all stops"}
                </button>
            ) : null}
            <MapBox
                initialViewState={initialViewState}
                style={style}
                mapStyle={mapStyle}
                mapboxAccessToken={mapboxAccessToken}
                onRender={(event) => event.target.resize()}
            >
                <MapControls onUpdate={onUpdate} onDelete={onDelete} />
                {selected && searched ? getMarkers(selected, searched) : null}
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
            </MapBox>
        </>
    ) : null;
};

export default Map;
