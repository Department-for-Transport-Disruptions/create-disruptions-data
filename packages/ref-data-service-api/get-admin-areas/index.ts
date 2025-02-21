import { APIGatewayEvent, APIGatewayProxyResultV2 } from "aws-lambda";

import { AdminAreas, getAdminAreas } from "../utils/db";
import { executeClientWithoutInput } from "../utils/execute-client";

export const main = async (event: APIGatewayEvent): Promise<APIGatewayProxyResultV2> =>
    executeClientWithoutInput(event, getAdminAreas, sortAdminAreas);
export const sortAdminAreas = async (adminAreas: AdminAreas) => {
    adminAreas.sort((a, b) => (a.administrativeAreaCode ?? "").localeCompare(b.administrativeAreaCode ?? ""));
};
