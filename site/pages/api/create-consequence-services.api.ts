import { Service, ServicesConsequence, Stop } from "@create-disruptions-data/shared-ts/disruptionTypes";
import { servicesConsequenceSchema } from "@create-disruptions-data/shared-ts/disruptionTypes.zod";
import { Datasource } from "@create-disruptions-data/shared-ts/enums";
import { NextApiRequest, NextApiResponse } from "next";
import {
    COOKIES_CONSEQUENCE_SERVICES_ERRORS,
    CREATE_CONSEQUENCE_SERVICES_PATH,
    DASHBOARD_PAGE_PATH,
    DISRUPTION_DETAIL_PAGE_PATH,
    REVIEW_DISRUPTION_PAGE_PATH,
    TYPE_OF_CONSEQUENCE_PAGE_PATH,
} from "../../constants";
import { getNocCodesForOperatorOrg } from "../../data/dynamo";
import { TooManyConsequencesError } from "../../errors";
import { flattenZodErrors } from "../../utils";
import {
    destroyCookieOnResponseObject,
    getReturnPage,
    handleUpsertConsequence,
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
        const queryParam = getReturnPage(req);
        const isFromTemplate = isDisruptionFromTemplate(req);

        const { template, addAnotherConsequence } = req.query;

        const body = req.body as ServicesConsequence;

        const formattedBody = formatCreateConsequenceStopsServicesBody(body);

        const validatedBody = servicesConsequenceSchema.safeParse(formattedBody);

        const session = getSession(req);

        const { draft } = req.query;

        if (!session) {
            throw new Error("No session found");
        }

        if (!validatedBody.success) {
            if (!body.disruptionId || !body.consequenceIndex) {
                throw new Error("No disruptionId or consequenceIndex found");
            }

            setCookieOnResponseObject(
                COOKIES_CONSEQUENCE_SERVICES_ERRORS,
                JSON.stringify({
                    inputs: {
                        ...formattedBody,
                        services: [],
                        stops: [],
                        serviceRefs: formattedBody.services.map((service) =>
                            service.dataSource === Datasource.bods ? service.lineId : service.serviceCode,
                        ),
                        stopRefs: formattedBody.stops.map((stop) => stop.atcoCode),
                    },
                    errors: flattenZodErrors(validatedBody.error),
                }),
                res,
            );

            redirectToWithQueryParams(
                req,
                res,
                template ? ["template"] : [],
                `${CREATE_CONSEQUENCE_SERVICES_PATH}/${body.disruptionId}/${body.consequenceIndex}`,
                queryParam ? [queryParam] : [],
            );
            return;
        }

        if (session.isOperatorUser && session.operatorOrgId) {
            const operatorUserNocCodes = await getNocCodesForOperatorOrg(session.orgId, session.operatorOrgId);

            const consequenceIncludesOperatorUserNocCode = validatedBody.data.services.map((service) => {
                return operatorUserNocCodes.includes(service.nocCode);
            });

            if (consequenceIncludesOperatorUserNocCode.includes(false)) {
                setCookieOnResponseObject(
                    COOKIES_CONSEQUENCE_SERVICES_ERRORS,
                    JSON.stringify({
                        inputs: formattedBody,
                        errors: [
                            {
                                errorMessage:
                                    "Operator user can only create service type consequence for services that contain their own NOC codes.",
                                id: "",
                            },
                        ],
                    }),
                    res,
                );

                redirectToWithQueryParams(
                    req,
                    res,
                    template ? ["template"] : [],
                    `${CREATE_CONSEQUENCE_SERVICES_PATH}/${validatedBody.data.disruptionId}/${validatedBody.data.consequenceIndex}`,
                    queryParam ? [queryParam] : [],
                );
                return;
            }
        }

        const maxConsequenceIndex = await handleUpsertConsequence(
            validatedBody.data,
            session.orgId,
            session.name,
            session.isOrgStaff,
            template === "true",
            formattedBody,
            COOKIES_CONSEQUENCE_SERVICES_ERRORS,
            res,
        );
        destroyCookieOnResponseObject(COOKIES_CONSEQUENCE_SERVICES_ERRORS, res);

        const redirectPath =
            (!isFromTemplate || template) &&
            queryParam &&
            decodeURIComponent(queryParam).includes(DISRUPTION_DETAIL_PAGE_PATH)
                ? DISRUPTION_DETAIL_PAGE_PATH
                : REVIEW_DISRUPTION_PAGE_PATH;

        if (addAnotherConsequence) {
            const currentIndex = validatedBody.data.consequenceIndex;
            const nextIndex = currentIndex >= maxConsequenceIndex ? currentIndex + 1 : maxConsequenceIndex + 1;

            redirectToWithQueryParams(
                req,
                res,
                template ? ["template"] : [],
                `${TYPE_OF_CONSEQUENCE_PAGE_PATH}/${validatedBody.data.disruptionId}/${nextIndex}`,
                queryParam ? [queryParam] : [],
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
            queryParam ? [queryParam] : [],
        );
        return;
    } catch (e) {
        if (e instanceof TooManyConsequencesError) {
            const body = req.body as ServicesConsequence;
            const queryParam = getReturnPage(req);

            redirectToWithQueryParams(
                req,
                res,
                req.query.template === "true" ? ["template"] : [],
                `${CREATE_CONSEQUENCE_SERVICES_PATH}/${body.disruptionId}/${body.consequenceIndex}`,
                queryParam ? [queryParam] : [],
            );

            return;
        }

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
