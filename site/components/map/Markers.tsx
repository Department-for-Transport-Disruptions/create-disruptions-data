import { Stop } from "@create-disruptions-data/shared-ts/disruptionTypes";
import { uniqueId } from "lodash";
import { Dispatch, ReactElement, SetStateAction, memo } from "react";
import { Marker } from "react-map-gl";

interface MarkersProps {
    selected: Stop[];
    searched: Stop[];
    markerData: Stop[];
    unselectMarker: (id: string) => void;
    selectMarker: (id: string) => void;
    handleMouseEnter: (id: string) => void;
    setPopupInfo: Dispatch<SetStateAction<Partial<Stop>>>;
}

const Markers = ({
    selected,
    searched,
    markerData,
    unselectMarker,
    selectMarker,
    handleMouseEnter,
    setPopupInfo,
}: MarkersProps): ReactElement | null => {
    const dataFromPolygon =
        selected && selected.length > 0
            ? markerData.filter((sToFilter: Stop) => !selected.some((s) => s.atcoCode === sToFilter.atcoCode))
            : markerData;

    const filterSelected =
        selected && selected.length > 0
            ? searched.filter((sToFilter: Stop) => !selected.some((s) => s.atcoCode === sToFilter.atcoCode))
            : searched;

    const notInTable =
        markerData && markerData.length > 0
            ? filterSelected.filter((sToFilter: Stop) => !markerData.some((s) => s.atcoCode === sToFilter.atcoCode))
            : filterSelected;

    return (
        <>
            {selected && selected.length > 0
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
                : null}
            {[...dataFromPolygon, ...notInTable].map((s) => (
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
            ))}
        </>
    );
};

export default memo(Markers);
