import { APIGatewayEvent, APIGatewayProxyResultV2 } from "aws-lambda";

import { ClientError } from "../error";
import { isDataSource, isServiceStops, isValidMode } from "../utils";
import { ServiceStop, ServiceStops, ServiceStopsQueryInput, ServiceTracks, Stops, getServiceStops } from "../utils/db";
import { RefVehicleMode } from "../utils/enums";
import { executeClient } from "../utils/execute-client";

export const main = async (event: APIGatewayEvent): Promise<APIGatewayProxyResultV2> =>
    executeClient(event, getQueryInput, getServiceStops, formatStops);

const MAX_ADMIN_AREA_CODES = process.env.MAX_ADMIN_AREA_CODES || "5";

export const getQueryInput = (event: APIGatewayEvent): ServiceStopsQueryInput => {
    const { pathParameters, queryStringParameters } = event;

    const serviceRef = pathParameters?.serviceId;

    if (!serviceRef) {
        throw new ClientError("Service Ref must be provided");
    }

    const dataSourceInput = queryStringParameters?.dataSource || "bods";

    if (!isDataSource(dataSourceInput)) {
        throw new ClientError("Invalid datasource provided");
    }

    const modes = queryStringParameters?.modes || "";
    const modesArray = modes
        .split(",")
        .filter((mode) => mode)
        .map((mode) => mode.trim());

    const filteredModesArray = modesArray.filter(isValidMode);

    if (filteredModesArray.length !== modesArray.length) {
        throw new ClientError("Invalid mode provided");
    }

    if (filteredModesArray.includes(RefVehicleMode.bus)) {
        filteredModesArray.push(RefVehicleMode.blank);
    }

    const adminAreaCodes = queryStringParameters?.adminAreaCodes ?? "";
    const adminAreaCodeArray = adminAreaCodes
        .split(",")
        .filter((adminAreaCode) => adminAreaCode)
        .map((adminAreaCode) => adminAreaCode.trim());

    if (adminAreaCodeArray.length > Number(MAX_ADMIN_AREA_CODES)) {
        throw new ClientError(`Only up to ${MAX_ADMIN_AREA_CODES} administrative area codes can be provided`);
    }

    return {
        serviceRef,
        dataSource: dataSourceInput,
        ...(filteredModesArray && filteredModesArray.length > 0 ? { modes: filteredModesArray } : {}),
        ...(adminAreaCodes && adminAreaCodeArray.length > 0 ? { adminAreaCodes: adminAreaCodeArray } : {}),
    };
};

export const flattenStops = (stops: ServiceStops): ServiceStop[] => {
    return stops.flatMap((stop) => {
        const stopArray: ServiceStop[] = [];
        if (stop.fromStatus === "active") {
            stopArray.push({
                id: stop.fromId,
                atcoCode: stop.fromAtcoCode,
                naptanCode: stop.fromNaptanCode,
                commonName: stop.fromCommonName,
                street: stop.fromStreet,
                indicator: stop.fromIndicator,
                bearing: stop.fromBearing,
                nptgLocalityCode: stop.fromNptgLocalityCode,
                localityName: stop.fromLocalityName,
                parentLocalityName: stop.fromParentLocalityName,
                longitude: stop.fromLongitude,
                latitude: stop.fromLatitude,
                stopType: stop.fromStopType,
                busStopType: stop.fromBusStopType,
                timingStatus: stop.fromTimingStatus,
                administrativeAreaCode: stop.fromAdministrativeAreaCode,
                status: stop.fromStatus,
                direction: stop.direction || "",
                sequenceNumber: stop.fromSequenceNumber || "",
                journeyPatternId: stop.journeyPatternId,
            });
        }

        if (stop.toStatus === "active") {
            stopArray.push({
                id: stop.toId,
                atcoCode: stop.toAtcoCode,
                naptanCode: stop.toNaptanCode,
                commonName: stop.toCommonName,
                street: stop.toStreet,
                indicator: stop.toIndicator,
                bearing: stop.toBearing,
                nptgLocalityCode: stop.toNptgLocalityCode,
                localityName: stop.toLocalityName,
                parentLocalityName: stop.toParentLocalityName,
                longitude: stop.toLongitude,
                latitude: stop.toLatitude,
                stopType: stop.toStopType,
                busStopType: stop.toBusStopType,
                timingStatus: stop.toTimingStatus,
                administrativeAreaCode: stop.toAdministrativeAreaCode,
                status: stop.toStatus,
                direction: stop.direction || "",
                sequenceNumber: stop.toSequenceNumber || "",
                journeyPatternId: stop.journeyPatternId,
            });
        }

        return stopArray;
    });
};
export const formatStops = async (stops: ServiceStops | ServiceTracks): Promise<Stops> => {
    if (!isServiceStops(stops)) {
        return [];
    }

    return flattenStops(stops).filter(
        (flattenedStop, index, self) => index === self.findIndex((stop) => stop.atcoCode === flattenedStop.atcoCode),
    );
};
