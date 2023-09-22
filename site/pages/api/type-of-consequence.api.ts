import { NextApiRequest, NextApiResponse } from "next";
import {
    TYPE_OF_CONSEQUENCE_PAGE_PATH,
    COOKIES_CONSEQUENCE_TYPE_ERRORS,
    CREATE_CONSEQUENCE_NETWORK_PATH,
    CREATE_CONSEQUENCE_OPERATOR_PATH,
    CREATE_CONSEQUENCE_STOPS_PATH,
    CREATE_CONSEQUENCE_SERVICES_PATH,
} from "../../constants";
import { ConsequenceType, typeOfConsequenceSchema } from "../../schemas/type-of-consequence.schema";
import { flattenZodErrors, getQueryParams } from "../../utils";
import {
    destroyCookieOnResponseObject,
    redirectTo,
    redirectToError,
    setCookieOnResponseObject,
} from "../../utils/apiUtils";

const addConsequence = (req: NextApiRequest, res: NextApiResponse): void => {
    try {
        const { template, return: returnPath } = req.query;
        const queryParams = getQueryParams(
            template === "true",
            returnPath ? decodeURIComponent(returnPath as string) : "",
        );

        const validatedBody = typeOfConsequenceSchema.safeParse(req.body);

        if (!validatedBody.success) {
            const body = req.body as ConsequenceType;

            if (!body.disruptionId || !body.consequenceIndex) {
                throw new Error("No disruptionId or consequenceIndex found");
            }
            setCookieOnResponseObject(
                COOKIES_CONSEQUENCE_TYPE_ERRORS,
                JSON.stringify({
                    inputs: req.body as object,
                    errors: flattenZodErrors(validatedBody.error),
                }),
                res,
            );

            redirectTo(
                res,
                `${TYPE_OF_CONSEQUENCE_PAGE_PATH}/${body.disruptionId}/${body.consequenceIndex}${queryParams}`,
            );

            return;
        }

        destroyCookieOnResponseObject(COOKIES_CONSEQUENCE_TYPE_ERRORS, res);

        let redirectPath: string;

        switch (validatedBody.data.consequenceType) {
            case "networkWide":
                redirectPath = CREATE_CONSEQUENCE_NETWORK_PATH;
                break;
            case "operatorWide":
                redirectPath = CREATE_CONSEQUENCE_OPERATOR_PATH;
                break;
            case "stops":
                redirectPath = CREATE_CONSEQUENCE_STOPS_PATH;
                break;
            case "services":
                redirectPath = CREATE_CONSEQUENCE_SERVICES_PATH;
                break;
            default:
                redirectPath = TYPE_OF_CONSEQUENCE_PAGE_PATH;
                break;
        }

        redirectTo(
            res,
            `${redirectPath}/${validatedBody.data.disruptionId}/${validatedBody.data.consequenceIndex}${queryParams}`,
        );
    } catch (e) {
        if (e instanceof Error) {
            const message = "There was a problem creating a disruption.";
            redirectToError(res, message, "api.type-of-consequence", e);
            return;
        }

        redirectToError(res);
        return;
    }
};

export default addConsequence;
