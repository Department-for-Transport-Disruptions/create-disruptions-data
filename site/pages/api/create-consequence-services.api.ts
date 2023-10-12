import { Service, ServicesConsequence, Stop } from "@create-disruptions-data/shared-ts/disruptionTypes";
import { servicesConsequenceSchema } from "@create-disruptions-data/shared-ts/disruptionTypes.zod";
import { PublishStatus } from "@create-disruptions-data/shared-ts/enums";
import { NextApiRequest, NextApiResponse } from "next";
import {
    COOKIES_CONSEQUENCE_SERVICES_ERRORS,
    CREATE_CONSEQUENCE_SERVICES_PATH,
    DASHBOARD_PAGE_PATH,
    DISRUPTION_DETAIL_PAGE_PATH,
    REVIEW_DISRUPTION_PAGE_PATH,
    TYPE_OF_CONSEQUENCE_PAGE_PATH,
} from "../../constants";
import { upsertConsequence } from "../../data/dynamo";
import { flattenZodErrors, getLargestConsequenceIndex } from "../../utils";
import {
    destroyCookieOnResponseObject,
    isDisruptionFromTemplate,
    redirectTo,
    redirectToError,
    redirectToWithQueryParams,
    setCookieOnResponseObject,
} from "../../utils/apiUtils";
import { getSession } from "../../utils/apiUtils/auth";

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
        const isFromTemplate = isDisruptionFromTemplate(req);

        const { template, addAnotherConsequence } = req.query;

        const formattedBody = formatCreateConsequenceStopsServicesBody(req.body as object);

        const validatedBody = servicesConsequenceSchema.safeParse(formattedBody);

        const session = getSession(req);

        const { draft } = req.query;

        if (!session) {
            throw new Error("No session found");
        }

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

            redirectToWithQueryParams(
                req,
                res,
                template ? ["template"] : [],
                `${CREATE_CONSEQUENCE_SERVICES_PATH}/${body.disruptionId}/${body.consequenceIndex}`,
                isFromTemplate ? ["isFromTemplate=true"] : [],
            );
            return;
        }

        const disruption = await upsertConsequence(
            validatedBody.data,
            session.orgId,
            session.isOrgStaff,
            template === "true",
        );
        destroyCookieOnResponseObject(COOKIES_CONSEQUENCE_SERVICES_ERRORS, res);

        const redirectPath =
            (!isFromTemplate || template) && disruption?.publishStatus !== PublishStatus.draft
                ? DISRUPTION_DETAIL_PAGE_PATH
                : REVIEW_DISRUPTION_PAGE_PATH;

        if (addAnotherConsequence) {
            if (!disruption) {
                throw new Error("No disruption found to add another consequence");
            }
            const currentIndex = validatedBody.data.consequenceIndex;
            const largestIndex = getLargestConsequenceIndex(disruption);
            const nextIndex = currentIndex >= largestIndex ? currentIndex + 1 : largestIndex + 1;

            redirectToWithQueryParams(
                req,
                res,
                template ? ["template"] : [],
                `${TYPE_OF_CONSEQUENCE_PAGE_PATH}/${validatedBody.data.disruptionId}/${nextIndex}`,
                isFromTemplate ? ["isFromTemplate=true"] : [],
            );
            return;
        }

        if (draft) {
            redirectTo(res, DASHBOARD_PAGE_PATH);
            return;
        }
        redirectToWithQueryParams(
            req,
            res,
            template ? ["template"] : [],
            `${redirectPath}/${validatedBody.data.disruptionId}`,
            isFromTemplate ? ["isFromTemplate=true"] : [],
        );
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
