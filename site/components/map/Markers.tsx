import { uniqueId } from "lodash";
import { Dispatch, ReactElement, SetStateAction, memo } from "react";
import { Marker } from "react-map-gl";
import { Stop } from "../../schemas/consequence.schema";

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
    const dataFromPolygon = markerData.filter((sToFilter: Stop) =>
        selected && selected.length > 0 ? !selected.map((s) => s.atcoCode).includes(sToFilter.atcoCode) : sToFilter,
    );

    const notInTable = searched
        .filter((sToFilter: Stop) =>
            selected && selected.length > 0 ? !selected.map((s) => s.atcoCode).includes(sToFilter.atcoCode) : sToFilter,
        )
        .filter((sToFilter: Stop) =>
            markerData && markerData.length > 0
                ? !markerData.map((s) => s.atcoCode).includes(sToFilter.atcoCode)
                : sToFilter,
        );

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
