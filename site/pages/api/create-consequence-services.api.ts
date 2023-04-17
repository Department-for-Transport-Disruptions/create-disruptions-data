import { NextApiRequest, NextApiResponse } from "next";
import {
    COOKIES_CONSEQUENCE_SERVICES_ERRORS,
    CREATE_CONSEQUENCE_SERVICES_PATH,
    REVIEW_DISRUPTION_PAGE_PATH,
} from "../../constants";
import { upsertConsequence } from "../../data/dynamo";
import { Service, Stop, servicesConsequenceSchema, ServicesConsequence } from "../../schemas/consequence.schema";
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
            return JSON.parse(values) as Service;
        });

    const cleansedBody = Object.fromEntries(
        Object.entries(body).filter(
            (item) => !item.toString().startsWith("stop") && !item.toString().startsWith("service"),
        ),
    );

    return {
        ...cleansedBody,
        stops,
        services,
    };
};

const createConsequenceServices = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    try {
        const queryParam = req.headers.referer?.split("?")[1] || "";

        const formattedBody = formatCreateConsequenceStopsServicesBody(req.body as object);

        const validatedBody = servicesConsequenceSchema.safeParse(formattedBody);

        if (!validatedBody.success) {
            const body = req.body as ServicesConsequence;

            if (!body.disruptionId || !body.consequenceIndex) {
                throw new Error("No disruptionId or consequenceIndex found");
            }

            setCookieOnResponseObject(
                COOKIES_CONSEQUENCE_SERVICES_ERRORS,
                JSON.stringify({
                    inputs: formattedBody,
                    errors: flattenZodErrors(validatedBody.error),
                }),
                res,
            );

            queryParam
                ? redirectTo(
                      res,
                      `${CREATE_CONSEQUENCE_SERVICES_PATH}/${body.disruptionId}/${body.consequenceIndex}?${queryParam}`,
                  )
                : redirectTo(res, `${CREATE_CONSEQUENCE_SERVICES_PATH}/${body.disruptionId}/${body.consequenceIndex}`);
            return;
        }

        await upsertConsequence(validatedBody.data);
        destroyCookieOnResponseObject(COOKIES_CONSEQUENCE_SERVICES_ERRORS, res);

        redirectTo(res, `${REVIEW_DISRUPTION_PAGE_PATH}/${validatedBody.data.disruptionId}`);
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
