import uniqueId from "lodash/uniqueId";
import { CSSProperties, ReactElement, ReactNode } from "react";
import MapBox, { Marker, ViewState } from "react-map-gl";
import { Stop } from "../../schemas/consequence.schema";

interface MapProps {
    initialViewState: Partial<ViewState>;
    style: CSSProperties;
    mapStyle: string;
    selected?: Stop[];
    searched?: Stop[];
}

const Map = ({ initialViewState, style, mapStyle, selected, searched }: MapProps): ReactElement | null => {
    const mapboxAccessToken = process.env.MAP_BOX_ACCESS_TOKEN;

    const getMarkers = (selected: Stop[], searched: Stop[]): ReactNode => {
        const selectedMarkers =
            selected && selected.length > 0
                ? selected.map((s: Stop) => (
                      <Marker
                          key={uniqueId(s.atcoCode)}
                          longitude={s.longitude}
                          latitude={s.latitude}
                          anchor="bottom"
                      />
                  ))
                : [];
        const searchedMarkers = searched
            .filter((sToFilter: Stop) =>
                selected && selected.length > 0
                    ? !selected.map((s) => s.atcoCode).includes(sToFilter.atcoCode)
                    : sToFilter,
            )
            .map((s) => (
                <Marker
                    key={uniqueId(s.atcoCode)}
                    longitude={s.longitude}
                    latitude={s.latitude}
                    anchor="bottom"
                    color="grey"
                />
            ));

        const markers = [...selectedMarkers, ...searchedMarkers];

        return markers.length > 0 ? markers.slice(0, 100) : null;
    };

    return mapboxAccessToken ? (
        <MapBox
            initialViewState={initialViewState}
            style={style}
            mapStyle={mapStyle}
            mapboxAccessToken={mapboxAccessToken}
        >
            {selected && searched ? getMarkers(selected, searched) : null}
        </MapBox>
    ) : null;
};

export default Map;
