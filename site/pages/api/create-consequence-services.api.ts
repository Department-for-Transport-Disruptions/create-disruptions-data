import { NextApiRequest, NextApiResponse } from "next";
import {
    COOKIES_CONSEQUENCE_SERVICES_ERRORS,
    COOKIES_CONSEQUENCE_INFO,
    CREATE_CONSEQUENCE_SERVICES_PATH,
    REVIEW_DISRUPTION_PAGE_PATH,
} from "../../constants";
import { Service, Stop, servicesConsequenceSchema } from "../../schemas/consequence.schema";
import { flattenZodErrors } from "../../utils";
import {
    destroyCookieOnResponseObject,
    redirectTo,
    redirectToError,
    setCookieOnResponseObject,
} from "../../utils/apiUtils";

export const formatCreateConsequenceStopsServicesBody = (body: object) => {
    const stops = Object.entries(body)
        .filter((item) => item.toString().startsWith("stop"))
        .map((arr: string[]) => {
            const [, values] = arr;
            return JSON.parse(values) as Stop;
        });

    const services = Object.entries(body)
        .filter((item) => item.toString().startsWith("service"))
        .map((arr: string[]) => {
            const [, values] = arr;
            return values;
        });

    const cleansedBody = Object.fromEntries(
        Object.entries(body).filter(
            (item) => !item.toString().startsWith("stop") || !item.toString().startsWith("service"),
        ),
    );

    return {
        ...cleansedBody,
        stops,
        services,
    };
};

const createConsequenceServices = (req: NextApiRequest, res: NextApiResponse): void => {
    try {
        const formattedBody = formatCreateConsequenceStopsServicesBody(req.body as object);

        const validatedBody = servicesConsequenceSchema.safeParse(formattedBody);

        if (!validatedBody.success) {
            setCookieOnResponseObject(
                COOKIES_CONSEQUENCE_SERVICES_ERRORS,
                JSON.stringify({
                    inputs: formattedBody,
                    errors: flattenZodErrors(validatedBody.error),
                }),
                res,
            );
            destroyCookieOnResponseObject(COOKIES_CONSEQUENCE_INFO, res);

            redirectTo(res, CREATE_CONSEQUENCE_SERVICES_PATH);
            return;
        }

        setCookieOnResponseObject(COOKIES_CONSEQUENCE_INFO, JSON.stringify(validatedBody.data), res);
        destroyCookieOnResponseObject(COOKIES_CONSEQUENCE_SERVICES_ERRORS, res);

        redirectTo(res, REVIEW_DISRUPTION_PAGE_PATH);
        return;
    } catch (e) {
        if (e instanceof Error) {
            const message = "There was a problem adding a consequence services.";
            redirectToError(res, message, "api.create-consequence-services", e);
            return;
        }

        redirectToError(res);
        return;
    }
};

export default createConsequenceServices;
