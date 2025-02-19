import { Datasource } from "@create-disruptions-data/shared-ts/enums";
import { APIGatewayEvent, APIGatewayProxyResultV2 } from "aws-lambda";
import { ClientError } from "../error";
import { isValidMode } from "../utils";
import { ServicesForOperatorQueryInput, getServicesForOperator } from "../utils/db";
import { RefVehicleMode } from "../utils/enums";
import { executeClient } from "../utils/execute-client";

const isDataSource = (input: string): input is Datasource => input in Datasource;

export const main = async (event: APIGatewayEvent): Promise<APIGatewayProxyResultV2> =>
    executeClient(event, getQueryInput, getServicesForOperator);

export const getQueryInput = (event: APIGatewayEvent): ServicesForOperatorQueryInput => {
    const { pathParameters, queryStringParameters } = event;

    const nocCode = pathParameters?.nocCode ?? "";

    if (!nocCode) {
        throw new ClientError("NOC must be provided");
    }

    const modes = queryStringParameters?.modes ?? "";
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

    const dataSourceInput = queryStringParameters?.dataSource ?? Datasource.bods;

    if (!isDataSource(dataSourceInput)) {
        throw new ClientError("Provided dataSource must be tnds or bods");
    }

    const lineNames = queryStringParameters?.lineNames ?? "";
    const lineNamesArray = lineNames
        .split(",")
        .filter((lineName) => lineName)
        .map((lineName) => lineName.trim());

    return {
        nocCode,
        dataSource: dataSourceInput,
        ...(filteredModesArray && filteredModesArray.length > 0 ? { modes: filteredModesArray } : {}),
        ...(lineNamesArray && lineNamesArray.length > 0 ? { lineNames: lineNamesArray } : {}),
    };
};
