import { Journey, JourneysConsequence, Service } from "@create-disruptions-data/shared-ts/disruptionTypes";
import { journeysConsequenceSchema } from "@create-disruptions-data/shared-ts/disruptionTypes.zod";
import { Datasource } from "@create-disruptions-data/shared-ts/enums";
import { NextApiRequest, NextApiResponse } from "next";
import {
    COOKIES_CONSEQUENCE_JOURNEYS_ERRORS,
    CREATE_CONSEQUENCE_JOURNEYS_PATH,
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
    getReturnPage,
    handleUpsertConsequence,
    isDisruptionFromTemplate,
    redirectTo,
    redirectToError,
    redirectToWithQueryParams,
    setCookieOnResponseObject,
} from "../../utils/apiUtils";
import { getSession } from "../../utils/apiUtils/auth";

export const formatCreateConsequenceJourneysServicesBody = (body: object) => {
    const services = Object.entries(body)
        .filter((item) => item.toString().startsWith("service"))
        .map((arr: string[]) => {
            const [, values] = arr;
            return JSON.parse(values) as Service;
        });

    const cleansedBody = Object.fromEntries(
        Object.entries(body).filter(
            (item) => !item.toString().startsWith("journey") && !item.toString().startsWith("service"),
        ),
    );

    const journeys = Object.entries(body)
        .filter((item) => item.toString().startsWith("journey"))
        .map((arr: string[]) => {
            const [, values] = arr;
            return JSON.parse(values) as Journey;
        });

    return {
        ...cleansedBody,
        services,
        journeys,
    };
};

const createConsequenceJourneys = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    try {
        const queryParam = getReturnPage(req);
        const isFromTemplate = isDisruptionFromTemplate(req);

        const { template, addAnotherConsequence } = req.query;

        const body = req.body as JourneysConsequence;

        const formattedBody = formatCreateConsequenceJourneysServicesBody(body);

        const validatedBody = journeysConsequenceSchema.safeParse(formattedBody);

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
                COOKIES_CONSEQUENCE_JOURNEYS_ERRORS,
                JSON.stringify({
                    inputs: {
                        ...formattedBody,
                        services: [],
                        journeys: [],
                        serviceRefs: formattedBody.services.map((service) =>
                            service.dataSource === Datasource.bods ? service.lineId : service.serviceCode,
                        ),
                        journeyRefs: formattedBody.journeys.map((journey) => journey.vehicleJourneyCode),
                    },
                    errors: flattenZodErrors(validatedBody.error),
                }),
                res,
            );

            redirectToWithQueryParams(
                req,
                res,
                template ? ["template"] : [],
                `${CREATE_CONSEQUENCE_JOURNEYS_PATH}/${body.disruptionId}/${body.consequenceIndex}`,
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
                    COOKIES_CONSEQUENCE_JOURNEYS_ERRORS,
                    JSON.stringify({
                        inputs: formattedBody,
                        errors: [
                            {
                                errorMessage:
                                    "Operator user can only create journey type consequence for services that contain their own NOC codes.",
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
                    `${CREATE_CONSEQUENCE_JOURNEYS_PATH}/${validatedBody.data.disruptionId}/${validatedBody.data.consequenceIndex}`,
                    queryParam ? [queryParam] : [],
                );
                return;
            }
        }

        const disruption = await handleUpsertConsequence(
            validatedBody.data,
            session.orgId,
            session.isOrgStaff,
            template === "true",
            formattedBody,
            COOKIES_CONSEQUENCE_JOURNEYS_ERRORS,
            res,
        );
        destroyCookieOnResponseObject(COOKIES_CONSEQUENCE_JOURNEYS_ERRORS, res);

        const redirectPath =
            (!isFromTemplate || template) &&
            queryParam &&
            decodeURIComponent(queryParam).includes(DISRUPTION_DETAIL_PAGE_PATH)
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
            const body = req.body as JourneysConsequence;
            const queryParam = getReturnPage(req);

            redirectToWithQueryParams(
                req,
                res,
                req.query.template === "true" ? ["template"] : [],
                `${CREATE_CONSEQUENCE_JOURNEYS_PATH}/${body.disruptionId}/${body.consequenceIndex}`,
                queryParam ? [queryParam] : [],
            );

            return;
        }

        if (e instanceof Error) {
            const message = "There was a problem adding a consequence journeys.";
            redirectToError(res, message, "api.create-consequence-journeys", e);
            return;
        }

        redirectToError(res);
        return;
    }
};

export default createConsequenceJourneys;
