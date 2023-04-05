import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import { point, polygon } from "@turf/helpers";
import { GeoJsonProperties, Feature, Polygon, MultiPolygon } from "geojson";
import uniqueId from "lodash/uniqueId";
import inside from "point-in-polygon";
import { CSSProperties, ReactElement, ReactNode, useCallback, useEffect, useState } from "react";
import MapBox, { Marker, ViewState } from "react-map-gl";
import DrawControl from "./DrawControl";
import { Stop } from "../../schemas/consequence.schema";
interface MapProps {
    initialViewState: Partial<ViewState>;
    style: CSSProperties;
    mapStyle: string;
    selected?: Stop[];
    searched?: Stop[];
    inputId?: keyof Stop;
    stops: Stop[];
}

const Map = ({ initialViewState, style, mapStyle, selected, searched, stops }: MapProps): ReactElement | null => {
    const mapboxAccessToken = process.env.MAP_BOX_ACCESS_TOKEN;
    const [features, setFeatures] = useState<GeoJsonProperties>({});
    // const pt = point([-1.127863269531645, 53.43772119254368]);
    // const poly = polygon([
    //     [
    //         [-5.127863269531645, 54.43772119254368],
    //         [3.9457530437413197, 54.43772119254368],
    //         [-2.113682507931401, 50.66168321889711],
    //         [-5.127863269531645, 54.43772119254368],
    //     ],
    // ]);
    // console.log(
    //     JSON.stringify(Object.values(features)[0]?.geometry?.coordinates),
    //     Object.values(features)[0]?.geometry?.coordinates?.length > 0 ? booleanPointInPolygon(pt, poly) : "",
    // );
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
        const notInTable = searched
            .filter((sToFilter: Stop) =>
                selected && selected.length > 0
                    ? !selected.map((s) => s.atcoCode).includes(sToFilter.atcoCode)
                    : sToFilter,
            )
            .map((s) => (
                <Marker
                    key={uniqueId(s.atcoCode)}
                    longitude={Number(s.longitude)}
                    latitude={Number(s.latitude)}
                    color="grey"
                />
            ));

        const markers = [...inTable, ...notInTable];

        return markers.length > 0 ? markers.slice(0, 100) : null;
    };

    useEffect(() => {
        if (features && Object.values(features).length > 0 && stops) {
            // const poly = polygon(Object.values(features)[0].geometry.coordinates);
            // console.log(Object.values(features)[0].geometry.coordinates);
            // const markers = stops.filter((stop) => {
            //     const pt = point([Number(stop.longitude), Number(stop.latitude)]);
            //     if (booleanPointInPolygon(pt, poly)) {
            //         return stop;
            //     }
            //     return;
            // });

            const markers: Stop[] = stops.filter((stop) =>
                inside(
                    [Number(stop.longitude), Number(stop.latitude)],
                    Object.values(features)[0].geometry.coordinates[0],
                ),
            );
            console.log(markers);
        }
    }, [features, stops]);

    const onUpdate = useCallback((e) => {
        setFeatures((currFeatures) => {
            const newFeatures = { ...currFeatures };
            for (const f of e.features) {
                newFeatures[f.id] = f;
            }
            return newFeatures;
        });
    }, []);

    const onDelete = useCallback((e) => {
        setFeatures((currFeatures) => {
            const newFeatures = { ...currFeatures };
            for (const f of e.features) {
                delete newFeatures[f.id];
            }
            return newFeatures;
        });
    }, []);

    return mapboxAccessToken ? (
        <>
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
                    onCreate={onUpdate}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                />
            </MapBox>
        </>
    ) : null;
};

export default Map;
