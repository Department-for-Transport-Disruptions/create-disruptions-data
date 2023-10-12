import { NextApiRequest, NextApiResponse } from "next";
import {
    TYPE_OF_CONSEQUENCE_PAGE_PATH,
    COOKIES_CONSEQUENCE_TYPE_ERRORS,
    CREATE_CONSEQUENCE_NETWORK_PATH,
    CREATE_CONSEQUENCE_OPERATOR_PATH,
    CREATE_CONSEQUENCE_STOPS_PATH,
    CREATE_CONSEQUENCE_SERVICES_PATH,
} from "../../constants/index";
import { ConsequenceType, typeOfConsequenceSchema } from "../../schemas/type-of-consequence.schema";
import { flattenZodErrors } from "../../utils";
import {
    destroyCookieOnResponseObject,
    isDisruptionFromTemplate,
    redirectToError,
    redirectToWithQueryParams,
    setCookieOnResponseObject,
} from "../../utils/apiUtils";

const addConsequence = (req: NextApiRequest, res: NextApiResponse): void => {
    try {
        const { template } = req.query;
        const isFromTemplate = isDisruptionFromTemplate(req);
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

            redirectToWithQueryParams(
                req,
                res,
                template ? ["template"] : [],
                `${TYPE_OF_CONSEQUENCE_PAGE_PATH}/${body.disruptionId}/${body.consequenceIndex}`,
                [],
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

        redirectToWithQueryParams(
            req,
            res,
            template ? ["template"] : [],
            `${redirectPath}/${validatedBody.data.disruptionId}/${validatedBody.data.consequenceIndex}`,
            isFromTemplate ? ["isFromTemplate=true"] : [],
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
