import { Service, ServicesConsequence, Stop } from "@create-disruptions-data/shared-ts/disruptionTypes";
import { servicesConsequenceSchema } from "@create-disruptions-data/shared-ts/disruptionTypes.zod";
import { PublishStatus, Datasource } from "@create-disruptions-data/shared-ts/enums";
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
import { flattenZodErrors, getLargestConsequenceIndex } from "../../utils";
import {
    destroyCookieOnResponseObject,
    handleUpsertConsequence,
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
        const { addAnotherConsequence, draft, isFromTemplate } = req.query;

        const body = req.body as ServicesConsequence;

        const formattedBody = formatCreateConsequenceStopsServicesBody(body);

        const validatedBody = servicesConsequenceSchema.safeParse(formattedBody);

        const session = getSession(req);

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
                [],
                `${CREATE_CONSEQUENCE_SERVICES_PATH}/${body.disruptionId}/${body.consequenceIndex}`,
                isFromTemplate ? ["isFromTemplate=true"] : [],
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
                    [],
                    `${CREATE_CONSEQUENCE_SERVICES_PATH}/${validatedBody.data.disruptionId}/${validatedBody.data.consequenceIndex}`,
                    isFromTemplate ? ["isFromTemplate=true"] : [],
                );
                return;
            }
        }

        const disruption = await handleUpsertConsequence(
            validatedBody.data,
            session.orgId,
            session.isOrgStaff,
            false,
            formattedBody,
            COOKIES_CONSEQUENCE_SERVICES_ERRORS,
            res,
        );
        destroyCookieOnResponseObject(COOKIES_CONSEQUENCE_SERVICES_ERRORS, res);

        const redirectPath =
            !isFromTemplate && disruption?.publishStatus !== PublishStatus.draft
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
                [],
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
            [],
            `${redirectPath}/${validatedBody.data.disruptionId}`,
            isFromTemplate ? ["isFromTemplate=true"] : [],
        );
        return;
    } catch (e) {
        if (e instanceof TooManyConsequencesError) {
            const body = req.body as ServicesConsequence;

            redirectToWithQueryParams(
                req,
                res,
                [],
                `${CREATE_CONSEQUENCE_SERVICES_PATH}/${body.disruptionId}/${body.consequenceIndex}`,
                [],
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
