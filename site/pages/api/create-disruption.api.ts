import { DisruptionInfo } from "@create-disruptions-data/shared-ts/disruptionTypes";
import { disruptionInfoSchemaRefined } from "@create-disruptions-data/shared-ts/disruptionTypes.zod";
import cryptoRandomString from "crypto-random-string";
import { NextApiRequest, NextApiResponse } from "next";
import {
    COOKIES_DISRUPTION_ERRORS,
    CREATE_DISRUPTION_PAGE_PATH,
    DASHBOARD_PAGE_PATH,
    TYPE_OF_CONSEQUENCE_PAGE_PATH,
} from "../../constants/index";
import { upsertDisruptionInfo } from "../../data/dynamo";
import { flattenZodErrors } from "../../utils";
import {
    destroyCookieOnResponseObject,
    getReturnPage,
    isDisruptionFromTemplate,
    redirectTo,
    redirectToError,
    redirectToWithQueryParams,
    setCookieOnResponseObject,
} from "../../utils/apiUtils";
import { getSession } from "../../utils/apiUtils/auth";

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
                endDate = values[0] ? values[0] : values[1];
            }
            return endDate;
        });

    const displayId = Object.entries(body)
        .filter((item) => item.includes("displayId"))
        .flat();

    const cleansedBody = Object.fromEntries(
        Object.entries(body).filter((item) => !item.toString().startsWith("validity")),
    );

    return {
        ...cleansedBody,
        validity,
        disruptionRepeatsEndDate: disruptionRepeatsEndDate ? disruptionRepeatsEndDate[0] : disruptionRepeatsEndDate,
        displayId:
            displayId && displayId.length > 1 && displayId[1]
                ? (displayId[1] as string)
                : cryptoRandomString({ length: 6 }),
    };
};

const createDisruption = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    try {
        const queryParam = getReturnPage(req);
        const isFromTemplate = isDisruptionFromTemplate(req);

        const { draft } = req.query;

        const body = req.body as DisruptionInfo & { consequenceIndex: number | undefined };

        const consequenceIndex = body.consequenceIndex || 0;

        if (!body.disruptionId) {
            throw new Error("No disruptionId found");
        }

        const session = getSession(req);

        if (!session) {
            throw new Error("No session found");
        }

        const { template } = req.query;

        const formattedBody = formatCreateDisruptionBody(req.body as object);

        const validatedBody = disruptionInfoSchemaRefined.safeParse({
            ...formattedBody,
            orgId: session.orgId,
        });

        if (!validatedBody.success) {
            setCookieOnResponseObject(
                COOKIES_DISRUPTION_ERRORS,
                JSON.stringify({
                    inputs: formattedBody,
                    errors: flattenZodErrors(validatedBody.error),
                }),
                res,
            );

            redirectToWithQueryParams(
                req,
                res,
                template ? ["template"] : [],
                `${CREATE_DISRUPTION_PAGE_PATH}/${body.disruptionId}`,
                queryParam ? [queryParam] : [],
            );

            return;
        }

        validatedBody.data = {
            ...validatedBody.data,
            disruptionEndDate: validatedBody.data.disruptionEndDate || "",
            disruptionEndTime: validatedBody.data.disruptionEndTime || "",
            publishEndDate: validatedBody.data.publishEndDate || "",
            publishEndTime: validatedBody.data.publishEndTime || "",
            disruptionNoEndDateTime: validatedBody.data.disruptionNoEndDateTime || "",
        };

        await upsertDisruptionInfo(
            validatedBody.data,
            session.orgId,
            session.isOrgStaff,
            template === "true",
            session.isOperatorUser ? session.operatorOrgId : null,
        );

        destroyCookieOnResponseObject(COOKIES_DISRUPTION_ERRORS, res);

        queryParam && (!isFromTemplate || template)
            ? redirectToWithQueryParams(
                  req,
                  res,
                  template ? ["template"] : [],
                  `${decodeURIComponent(queryParam.split("=")[1].split("&")[0])}/${validatedBody.data.disruptionId}`,
              )
            : draft
              ? redirectTo(res, DASHBOARD_PAGE_PATH)
              : redirectToWithQueryParams(
                    req,
                    res,
                    template ? ["template"] : [],
                    `${TYPE_OF_CONSEQUENCE_PAGE_PATH}/${validatedBody.data.disruptionId}/${consequenceIndex}`,
                    isFromTemplate ? [`${isFromTemplate}`] : [],
                );

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
