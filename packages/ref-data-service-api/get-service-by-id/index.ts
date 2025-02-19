import { APIGatewayEvent, APIGatewayProxyResultV2 } from "aws-lambda";

import { Datasource } from "@create-disruptions-data/shared-ts/enums";

import { ClientError } from "../error";
import { isDataSource } from "../utils";
import { ServiceByIdQueryInput, getServiceById } from "../utils/db";
import { executeClient } from "../utils/execute-client";

export const main = async (event: APIGatewayEvent): Promise<APIGatewayProxyResultV2> =>
    executeClient(event, getQueryInput, getServiceById);

export const getQueryInput = (event: APIGatewayEvent): ServiceByIdQueryInput => {
    const { pathParameters, queryStringParameters } = event;

    const nocCode = pathParameters?.nocCode ?? "";

    if (!nocCode) {
        throw new ClientError("NOC must be provided");
    }

    const serviceRef = pathParameters?.serviceId;

    if (!serviceRef) {
        throw new ClientError("Service ref must be provided");
    }

    const dataSourceInput = queryStringParameters?.dataSource;

    return {
        nocCode,
        serviceRef: serviceRef,
        dataSource: dataSourceInput && isDataSource(dataSourceInput) ? dataSourceInput : Datasource.bods,
    };
};
