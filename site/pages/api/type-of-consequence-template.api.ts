import { NextApiRequest, NextApiResponse } from "next";
import {
    TYPE_OF_CONSEQUENCE_TEMPLATE_PAGE_PATH,
    CREATE_TEMPLATE_CONSEQUENCE_SERVICES_PATH,
    CREATE_TEMPLATE_CONSEQUENCE_STOPS_PATH,
    CREATE_TEMPLATE_CONSEQUENCE_OPERATOR_PATH,
    CREATE_TEMPLATE_CONSEQUENCE_NETWORK_PATH,
    COOKIES_CONSEQUENCE_TYPE_TEMPLATE_ERRORS,
} from "../../constants/index";
import { ConsequenceType, typeOfConsequenceSchema } from "../../schemas/type-of-consequence.schema";
import { flattenZodErrors } from "../../utils";
import {
    destroyCookieOnResponseObject,
    redirectTo,
    redirectToError,
    setCookieOnResponseObject,
} from "../../utils/apiUtils";

const addConsequenceTemplate = (req: NextApiRequest, res: NextApiResponse): void => {
    try {
        const validatedBody = typeOfConsequenceSchema.safeParse(req.body);

        if (!validatedBody.success) {
            const body = req.body as ConsequenceType;

            if (!body.disruptionId || !body.consequenceIndex) {
                throw new Error("No disruptionId or consequenceIndex found");
            }
            setCookieOnResponseObject(
                COOKIES_CONSEQUENCE_TYPE_TEMPLATE_ERRORS,
                JSON.stringify({
                    inputs: req.body as object,
                    errors: flattenZodErrors(validatedBody.error),
                }),
                res,
            );

            redirectTo(res, `${TYPE_OF_CONSEQUENCE_TEMPLATE_PAGE_PATH}/${body.disruptionId}/${body.consequenceIndex}`);
            return;
        }

        destroyCookieOnResponseObject(COOKIES_CONSEQUENCE_TYPE_TEMPLATE_ERRORS, res);

        let redirectPath: string;

        switch (validatedBody.data.consequenceType) {
            case "networkWide":
                redirectPath = CREATE_TEMPLATE_CONSEQUENCE_NETWORK_PATH;
                break;
            case "operatorWide":
                redirectPath = CREATE_TEMPLATE_CONSEQUENCE_OPERATOR_PATH;
                break;
            case "stops":
                redirectPath = CREATE_TEMPLATE_CONSEQUENCE_STOPS_PATH;
                break;
            case "services":
                redirectPath = CREATE_TEMPLATE_CONSEQUENCE_SERVICES_PATH;
                break;
            default:
                redirectPath = TYPE_OF_CONSEQUENCE_TEMPLATE_PAGE_PATH;
                break;
        }

        redirectTo(res, `${redirectPath}/${validatedBody.data.disruptionId}/${validatedBody.data.consequenceIndex}`);
    } catch (e) {
        if (e instanceof Error) {
            const message = "There was a problem adding a consequence template.";
            redirectToError(res, message, "api.type-of-consequence-template", e);
            return;
        }

        redirectToError(res);
        return;
    }
};

export default addConsequenceTemplate;
