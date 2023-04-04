import uniqueId from "lodash/uniqueId";
import { CSSProperties, ReactElement, ReactNode } from "react";
import MapBox, { Marker, ViewState } from "react-map-gl";

interface MapProps<T> {
    initialViewState: Partial<ViewState>;
    style: CSSProperties;
    mapStyle: string;
    selected?: T[];
    searched?: T[];
    inputId?: keyof T;
}

const Map = <T extends object>({
    initialViewState,
    style,
    mapStyle,
    selected,
    searched,
    inputId,
}: MapProps<T>): ReactElement | null => {
    const mapboxAccessToken = process.env.MAP_BOX_ACCESS_TOKEN;

    const getMarkers = (selected: T[], searched: T[], inputId: keyof T): ReactNode => {
        const inTable =
            selected && selected.length > 0
                ? selected.map((s) => (
                      <Marker
                          key={uniqueId(s[inputId])}
                          longitude={Number(s["longitude" as keyof T])}
                          latitude={Number(s["latitude" as keyof T])}
                          anchor="bottom"
                      />
                  ))
                : [];
        const notInTable = searched
            .filter((sToFilter: T) =>
                selected && selected.length > 0
                    ? !selected.map((s) => s[inputId]).includes(sToFilter[inputId])
                    : sToFilter,
            )
            .map((s) => (
                <Marker
                    key={uniqueId(s[inputId])}
                    longitude={Number(s["longitude" as keyof T])}
                    latitude={Number(s["latitude" as keyof T])}
                    anchor="bottom"
                    color="grey"
                />
            ));

        const markers = [...inTable, ...notInTable];

        return markers.length > 0 ? markers.slice(0, 100) : null;
    };

    return mapboxAccessToken ? (
        <MapBox
            initialViewState={initialViewState}
            style={style}
            mapStyle={mapStyle}
            mapboxAccessToken={mapboxAccessToken}
        >
            {inputId && selected && searched ? getMarkers(selected, searched, inputId) : null}
        </MapBox>
    ) : null;
};

export default Map;
