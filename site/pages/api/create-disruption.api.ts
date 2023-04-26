import { NextApiRequest, NextApiResponse } from "next";
import {
    COOKIES_DISRUPTION_ERRORS,
    COOKIE_DISRUPTION_DETAIL_STATE,
    CREATE_DISRUPTION_PAGE_PATH,
    TYPE_OF_CONSEQUENCE_PAGE_PATH,
} from "../../constants/index";
import { upsertDisruptionInfo } from "../../data/dynamo";
import { createDisruptionsSchemaRefined, DisruptionInfo } from "../../schemas/create-disruption.schema";
import { flattenZodErrors } from "../../utils";
import {
    destroyCookieOnResponseObject,
    getReturnPage,
    redirectTo,
    redirectToError,
    setCookieOnResponseObject,
} from "../../utils/apiUtils";

export const formatCreateDisruptionBody = (body: object) => {
    const validity = Object.entries(body)
        .filter((item) => item.toString().startsWith("validity"))
        .map((arr: string[]) => {
            const [, values] = arr;

            return {
                disruptionStartDate: values[0],
                disruptionStartTime: values[1],
                disruptionEndDate: values[2],
                disruptionEndTime: values[3],
                disruptionNoEndDateTime: values[4],
                disruptionRepeats: values[5],
                disruptionRepeatsEndDate: values[6],
            };
        });

    const disruptionRepeatsEndDate = Object.entries(body)
        .filter((item) => item.toString().startsWith("disruptionRepeatsEndDate"))
        .map((arr: string[]) => {
            const [, values] = arr;
            let endDate = values;
            if (Array.isArray(values)) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                endDate = values[0] ? values[0] : values[1];
            }
            return endDate;
        });

    const cleansedBody = Object.fromEntries(
        Object.entries(body).filter((item) => !item.toString().startsWith("validity")),
    );

    return {
        ...cleansedBody,
        validity,
        disruptionRepeatsEndDate: disruptionRepeatsEndDate ? disruptionRepeatsEndDate[0] : disruptionRepeatsEndDate,
    };
};

const createDisruption = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    try {
        const queryParam = getReturnPage(req);

        const body = req.body as DisruptionInfo;

        if (!body.disruptionId) {
            throw new Error("No disruptionId found");
        }

        const formattedBody = formatCreateDisruptionBody(req.body as object);

        const validatedBody = createDisruptionsSchemaRefined.safeParse(formattedBody);

        if (!validatedBody.success) {
            setCookieOnResponseObject(
                COOKIES_DISRUPTION_ERRORS,
                JSON.stringify({
                    inputs: formattedBody,
                    errors: flattenZodErrors(validatedBody.error),
                }),
                res,
            );

            redirectTo(res, `${CREATE_DISRUPTION_PAGE_PATH}/${body.disruptionId}${queryParam ? `?${queryParam}` : ""}`);
            return;
        }

        if (!validatedBody.data.disruptionNoEndDateTime) {
            validatedBody.data.disruptionNoEndDateTime = "";
        }

        await upsertDisruptionInfo(validatedBody.data);

        destroyCookieOnResponseObject(COOKIES_DISRUPTION_ERRORS, res);
        setCookieOnResponseObject(COOKIE_DISRUPTION_DETAIL_STATE, "saved", res);

        queryParam
            ? redirectTo(res, `${decodeURIComponent(queryParam.split("=")[1])}/${validatedBody.data.disruptionId}`)
            : redirectTo(res, `${TYPE_OF_CONSEQUENCE_PAGE_PATH}/${validatedBody.data.disruptionId}/0`);

        return;
    } catch (e) {
        if (e instanceof Error) {
            const message = "There was a problem creating a disruption.";
            redirectToError(res, message, "api.create-disruption", e);
            return;
        }

        redirectToError(res);
        return;
    }
};

export default createDisruption;
