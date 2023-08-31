import { Service } from "@create-disruptions-data/shared-ts/disruptionTypes";
import { serviceSchema } from "@create-disruptions-data/shared-ts/disruptionTypes.zod";
import { Datasource } from "@create-disruptions-data/shared-ts/enums";
import { makeFilteredArraySchema } from "@create-disruptions-data/shared-ts/utils/zod";
import fetch from "node-fetch";

const API_BASE_URL = "https://api.test.ref-data.dft-create-data.com/v1";

interface FetchServicesByOperatorsInput {
    nocCode: string;
    dataSource?: Datasource;
    lineNames?: string;
}

export const fetchServicesByOperators = async (input: FetchServicesByOperatorsInput): Promise<Service | {}> => {
    const searchApiUrl = `${API_BASE_URL}/operators/${input.nocCode}/services`;

    const queryStringItems = [];

    if (input.dataSource) {
        queryStringItems.push(`dataSource=${input.dataSource}`);
    }

    if (input.lineNames) {
        queryStringItems.push(`lineNames=${input.lineNames}`);
    }

    const res = await fetch(`${searchApiUrl}${queryStringItems.length > 0 ? `?${queryStringItems.join("&")}` : ""}`, {
        method: "GET",
    });

    const parseResult = makeFilteredArraySchema(serviceSchema).safeParse(await res.json());

    if (!parseResult.success) {
        return {};
    }

    return parseResult.data[0];
};
