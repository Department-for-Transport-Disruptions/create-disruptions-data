import {Kysely, SelectQueryBuilder, sql } from "kysely";
import * as logger from "lambda-log";
import { Database } from "@create-disruptions-data/shared-ts/db/types";

const ignoredStopTypes = ["FTD", "LSE", "RSE", "TMU"];
const ignoredBusStopTypes = ["HAR", "FLX"];

export type StopsQueryInput = {
    atcoCodes?: string[];
    naptanCodes?: string[];
    adminAreaCodes?: string[];
    page?: number;
    polygon?: string;
    stopTypes?: string[];
    searchInput?: string;
};

export const getStops = async (dbClient: Kysely<Database>, input: StopsQueryInput) => {
    logger.info("Starting getStops...");

    const STOPS_PAGE_SIZE = process.env.IS_LOCAL === "true" ? 100 : 1000;

    const stops = await dbClient
        .selectFrom("stops")
        .innerJoin("localities", "localities.nptgLocalityCode", "stops.nptgLocalityCode")
        .select([
            "stops.id",
            "stops.atcoCode",
            "stops.naptanCode",
            "stops.commonName",
            "stops.street",
            "stops.indicator",
            "stops.bearing",
            "stops.nptgLocalityCode",
            "stops.localityName",
            "stops.parentLocalityName",
            "stops.longitude",
            "stops.latitude",
            "stops.stopType",
            "stops.busStopType",
            "stops.timingStatus",
            "localities.administrativeAreaCode",
            "stops.status",
        ])
        .where("stopType", "not in", ignoredStopTypes)
        .where("busStopType", "not in", ignoredBusStopTypes)
        .where("status", "=", "active")
        .$if(!!input.atcoCodes?.[0], (qb) => qb.where("atcoCode", "in", input.atcoCodes ?? ["---"]))
        .$if(!!input.naptanCodes?.[0], (qb) => qb.where("naptanCode", "in", input.naptanCodes ?? ["---"]))
        .$if(!!input.adminAreaCodes?.[0], (qb) =>
            qb
                .where("localities.administrativeAreaCode", "in", input.adminAreaCodes ?? ["---"])
                .$if(!!input.polygon, (qb) =>
                    qb.where(
                        sql<boolean>`ST_CONTAINS(ST_GEOMFROMTEXT(${input.polygon}), Point(stops.longitude, stops.latitude))`,
                    ),
                ),
        )
        .$if(!!input.stopTypes?.[0], (qb) => qb.where("stopType", "in", input.stopTypes ?? ["---"]))
        .$if(!!input.searchInput, (qb) =>
            qb.where((eb) =>
                eb.or([
                    eb("stops.commonName", "like", input.searchInput ? `%${input.searchInput}%` : "---"),
                    eb("stops.atcoCode", "like", input.searchInput ? `%${input.searchInput}%` : "---"),
                ]),
            ),
        )
        .offset((input.page || 0) * STOPS_PAGE_SIZE)
        .limit(STOPS_PAGE_SIZE)
        .execute();

    return stops;
};