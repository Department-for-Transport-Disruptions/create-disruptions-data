import { APIGatewayEvent, APIGatewayProxyResultV2 } from "aws-lambda";

import { AdminAreaCodes, getAdminAreaCodes } from "../utils/db";
import { executeClientWithoutInput } from "../utils/execute-client";

export const main = async (event: APIGatewayEvent): Promise<APIGatewayProxyResultV2> =>
    executeClientWithoutInput(event, getAdminAreaCodes, sortAdminAreaCodes);

export const sortAdminAreaCodes = async (areaCodes: AdminAreaCodes) =>
    areaCodes.map((code) => code.administrativeAreaCode).sort();
