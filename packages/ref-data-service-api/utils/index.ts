import { getAreaOfPolygon } from "geolib";
import { z } from "zod";
import { ServiceStops, ServiceTracks } from "../client";
import { ClientError } from "../error";

export const getPolygon = (polygon: string, maxArea: number): string => {
    let parsedPolygon: [number, number][];

    try {
        parsedPolygon = z
            .array(z.tuple([z.number(), z.number()]))
            .min(4)
            .parse(JSON.parse(polygon))
            .map((point) => [point[0], point[1]]);
    } catch (_e) {
        throw new ClientError("Invalid polygon provided");
    }

    const polygonArea = getAreaOfPolygon(parsedPolygon);

    if (polygonArea / 1000000 > maxArea) {
        throw new ClientError(`Area of polygon must be below ${maxArea}km2`);
    }

    return `POLYGON((${formatPolygon(parsedPolygon)}))`;
};