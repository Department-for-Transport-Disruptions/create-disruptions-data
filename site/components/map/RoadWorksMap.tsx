import { LoadingBox } from "@govuk-react/loading-box";
import { FeatureCollection } from "geojson";
import { CSSProperties, ReactElement, useState } from "react";
import MapBox, { Layer, Source, SymbolLayer, ViewState, useMap } from "react-map-gl";
import MapControls from "./MapControls";
import cone from "../../public/assets/images/cone.png";

interface MapProps {
    initialViewState: Partial<ViewState>;
    style: CSSProperties;
    mapStyle: string;
    roadworks: {
        permitReferenceNumber: string;
        highwayAuthoritySwaCode: number;
        worksLocationCoordinates: {
            type: "Feature";
            geometry: {
                type: "Point";
                coordinates: [number, number];
            };
        };
        streetName: string;
        areaName: string;
        proposedStartDateTime: string;
        proposedEndDateTime: string;
        actualStartDateTime: string;
        actualEndDateTime: null;
        workStatus: string;
        activityType: string;
        permitStatus: string;
        town: string;
        administrativeAreaCode: string;
    }[];
}

const Map = ({ initialViewState, style, mapStyle, roadworks }: MapProps): ReactElement | null => {
    const mapboxAccessToken = process.env.MAP_BOX_ACCESS_TOKEN;
    const [loading, setLoading] = useState(false);

    const roadworkSource: FeatureCollection = {
        type: "FeatureCollection",
        features: roadworks.map((r) => ({ ...r.worksLocationCoordinates, properties: {} })),
    };

    const roadworkLayer: SymbolLayer = {
        id: "roadwork-icon-disruptions",
        type: "symbol",
        source: "roadwork-icon-disruptions",
        layout: {
            "icon-image": "cone",
            "icon-size": 0.1,
        },
    };

    const MapImage = () => {
        const { current: map } = useMap();

        if (map) {
            if (!map.hasImage("cone")) {
                map.loadImage(cone.src, (error, image) => {
                    if (error) throw error;
                    if (!map.hasImage("cone") && image) map.addImage("cone", image, { sdf: false });
                });
            }
        }

        return null;
    };

    return mapboxAccessToken ? (
        <>
            <LoadingBox loading={loading}>
                <MapBox
                    initialViewState={initialViewState}
                    style={style}
                    mapStyle={mapStyle}
                    mapboxAccessToken={mapboxAccessToken}
                    onRender={(event) => event.target.resize()}
                >
                    <MapControls onUpdate={() => {}} onDelete={() => {}} trash={false} polygon={false} />
                    <Source id="roadwork-icon-disruptions" type="geojson" data={roadworkSource}>
                        <Layer {...roadworkLayer} />
                    </Source>
                    <MapImage />
                </MapBox>
            </LoadingBox>
        </>
    ) : null;
};

export default Map;
