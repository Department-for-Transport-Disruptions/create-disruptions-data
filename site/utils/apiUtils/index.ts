import { Consequence, Disruption } from "@create-disruptions-data/shared-ts/disruptionTypes";
import { MAX_CONSEQUENCES } from "@create-disruptions-data/shared-ts/disruptionTypes.zod";
import {
    Datasource,
    Progress,
    PublishStatus,
    Severity,
    SocialMediaPostStatus,
} from "@create-disruptions-data/shared-ts/enums";
import { getSortedDisruptionFinalEndDate } from "@create-disruptions-data/shared-ts/utils";
import { getDate, getDatetimeFromDateAndTime } from "@create-disruptions-data/shared-ts/utils/dates";
import { Dayjs } from "dayjs";
import { NextApiRequest, NextApiResponse } from "next";
import { parseCookies, setCookie } from "nookies";
import { TwitterApi } from "twitter-api-v2";
import { z } from "zod";
import { IncomingMessage, ServerResponse } from "http";
import { getDisplayByValue, mapValidityPeriods, notEmpty, reduceStringWithEllipsis } from "..";
import {
    COOKIES_POLICY_COOKIE,
    COOKIE_CSRF,
    COOKIES_ID_TOKEN,
    COOKIE_PREFERENCES_COOKIE,
    DISRUPTION_DETAIL_PAGE_PATH,
    REVIEW_DISRUPTION_PAGE_PATH,
    COOKIES_REFRESH_TOKEN,
    VEHICLE_MODES,
} from "../../constants";
import { upsertConsequence } from "../../data/dynamo";
import { getAccessToken, publishToHootsuite } from "../../data/hootsuite";
import { getTwitterClient, sendTweet } from "../../data/twitter";
import { TooManyConsequencesError } from "../../errors";
import { PageState } from "../../interfaces";
import { TableDisruption } from "../../schemas/disruption.schema";
import { SocialMediaPost } from "../../schemas/social-media.schema";
import { isLiveDisruption } from "../../utils/dates";
import logger from "../logger";

export const setCookieOnResponseObject = (
    cookieName: string,
    cookieValue: string,
    res: NextApiResponse | ServerResponse<IncomingMessage>,
    lifetime?: number,
    httpOnly = true,
    sameSite: "lax" | "strict" | "none" = "lax",
): void => {
    // From docs: All cookies are httponly by default, and cookies sent over SSL are secure by
    // default. An error will be thrown if you try to send secure cookies over an insecure socket.
    setCookie({ res }, cookieName, cookieValue, {
        path: "/",
        sameSite,
        secure: process.env.NODE_ENV !== "development",
        maxAge: lifetime,
        httpOnly,
    });
};

export const destroyCookieOnResponseObject = (
    cookieName: string,
    res: NextApiResponse | ServerResponse<IncomingMessage>,
): void => {
    setCookieOnResponseObject(cookieName, "", res, 0);
};

export const redirectTo = (res: NextApiResponse | ServerResponse, location: string): void => {
    res.writeHead(302, {
        Location: location,
    });
    res.end();
};

export const redirectToError = (
    res: NextApiResponse | ServerResponse,
    message?: string,
    context?: string,
    error?: Error,
): void => {
    if (message && context && error) {
        logger.error(message, { context, error: error.stack });
    }

    redirectTo(res, "/500");
};

export const cleardownCookies = (req: NextApiRequest, res: NextApiResponse) => {
    const cookies = parseCookies({ req });

    const saveList = [
        COOKIES_POLICY_COOKIE,
        COOKIE_PREFERENCES_COOKIE,
        COOKIES_ID_TOKEN,
        COOKIES_REFRESH_TOKEN,
        COOKIE_CSRF,
    ];

    Object.keys(cookies).forEach((cookie) => {
        if (!saveList.includes(cookie)) {
            destroyCookieOnResponseObject(cookie, res);
        }
    });
};

export const getPageState = <T>(errorCookie: string, schemaObject: z.ZodType<T>, disruptionId?: string, data?: T) => {
    const inputsProps: PageState<Partial<T>> = {
        errors: [],
        inputs: {},
        disruptionId: disruptionId || "",
    };

    if (errorCookie) {
        return { ...(JSON.parse(errorCookie) as PageState<Partial<T>>), disruptionId: disruptionId || "" };
    }

    if (disruptionId || !!data) {
        const parsedData = schemaObject.safeParse(data);

        if (parsedData.success) {
            inputsProps.inputs = parsedData.data;
        }
    }

    return inputsProps;
};

export const getReturnPage = (req: NextApiRequest) => {
    const queryParam = req.headers.referer?.split("?")[1];
    const decodedQueryParam = queryParam ? decodeURIComponent(queryParam) : null;
    return decodedQueryParam?.includes(REVIEW_DISRUPTION_PAGE_PATH) ||
        decodedQueryParam?.includes(DISRUPTION_DETAIL_PAGE_PATH)
        ? queryParam
        : null;
};

export const isDisruptionFromTemplate = (req: NextApiRequest) => {
    const queryParam = req.headers.referer?.split("?")[1];

    const decodedQueryParam = queryParam ? decodeURIComponent(queryParam) : null;
    return decodedQueryParam?.includes(DISRUPTION_DETAIL_PAGE_PATH) && decodedQueryParam.includes("template=true")
        ? queryParam
        : null;
};

export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const publishSocialMedia = async (
    socialMediaPosts: SocialMediaPost[],
    orgId: string,
    isUserStaff: boolean,
    canPublish: boolean,
) => {
    const authedTwitterClients: Record<string, TwitterApi> = {};
    const hootsuiteAccessTokens: Record<string, string> = {};

    const uniqueTwitterSocialAccounts = new Set(
        socialMediaPosts.filter((post) => post.accountType === "Twitter").map((post) => post.socialAccount),
    );

    const uniqueHootsuiteSocialAccounts = new Set(
        socialMediaPosts.filter((post) => post.accountType === "Hootsuite").map((post) => post.socialAccount),
    );

    for (const socialAccount of uniqueHootsuiteSocialAccounts) {
        const accessToken = await getAccessToken(orgId, socialAccount);
        hootsuiteAccessTokens[socialAccount] = accessToken;
    }

    for (const socialAccount of uniqueTwitterSocialAccounts) {
        const authedClient = await getTwitterClient({ orgId, twitterId: socialAccount });

        if (authedClient) {
            authedTwitterClients[socialAccount] = authedClient;
        }
    }

    const socialMediaPromises = socialMediaPosts.map((post) => {
        if (post.status === SocialMediaPostStatus.pending) {
            if (post.accountType === "Twitter") {
                return sendTweet(orgId, post, isUserStaff, canPublish, authedTwitterClients[post.socialAccount]);
            }

            return publishToHootsuite(post, orgId, isUserStaff, canPublish, hootsuiteAccessTokens[post.socialAccount]);
        }

        return null;
    });

    await Promise.all(socialMediaPromises);
};

export const redirectToWithQueryParams = (
    req: NextApiRequest,
    res: NextApiResponse,
    queryParamsToForward: string[],
    location: string,
    paramsToAdd?: string[],
) => {
    const queryStringParams = queryParamsToForward
        .map((p) => {
            const paramValue = req.query[p];

            return paramValue ? `${p}=${paramValue.toString()}` : null;
        })
        .filter(notEmpty);

    redirectTo(
        res,
        `${location}${
            [...queryStringParams, ...(paramsToAdd || [])].length > 0
                ? `?${[...queryStringParams, ...(paramsToAdd || [])].join("&")}`
                : ""
        }`,
    );
};

export const handleUpsertConsequence = async (
    consequence: Consequence | Pick<Consequence, "disruptionId" | "consequenceIndex">,
    orgId: string,
    isOrgStaff: boolean,
    isTemplate: boolean,
    inputs: unknown,
    errorCookie: string,
    res: NextApiResponse,
) => {
    try {
        return await upsertConsequence(consequence, orgId, isOrgStaff, isTemplate);
    } catch (e) {
        if (e instanceof TooManyConsequencesError) {
            setCookieOnResponseObject(
                errorCookie,
                JSON.stringify({
                    inputs,
                    errors: [
                        {
                            id: "",
                            errorMessage: `Max consequence limit of ${MAX_CONSEQUENCES} has been reached`,
                        },
                    ],
                }),
                res,
            );
        }

        throw e;
    }
};

export const formatAddOrEditUserBody = (body: object) => {
    const operatorOrg = Object.entries(body)
        .filter((item) => item.includes("operatorOrg"))
        .flat();

    const cleansedBody = Object.fromEntries(Object.entries(body).filter((item) => !item[0].startsWith("operatorOrg")));

    return {
        ...cleansedBody,
        operatorOrg: operatorOrg[1] ? (JSON.parse(operatorOrg[1] as string) as object) : undefined,
    };
};

export const getDisruptionStatus = (disruption: Disruption): Progress => {
    if (disruption.publishStatus === PublishStatus.draft) {
        return Progress.draft;
    }

    if (disruption.publishStatus === PublishStatus.rejected) {
        return Progress.rejected;
    }

    if (disruption.publishStatus === PublishStatus.pendingApproval) {
        return Progress.draftPendingApproval;
    }

    if (
        disruption.publishStatus === PublishStatus.editPendingApproval ||
        disruption.publishStatus === PublishStatus.pendingAndEditing
    ) {
        return Progress.editPendingApproval;
    }

    if (!disruption.validity && !disruption.template) {
        return Progress.closed;
    }

    const today = getDate();
    const disruptionEndDate = getSortedDisruptionFinalEndDate(disruption);

    if (!!disruptionEndDate && !disruption.template) {
        return isClosingOrClosed(disruptionEndDate, today);
    }

    return Progress.open;
};

export const isClosingOrClosed = (endDate: Dayjs, today: Dayjs): Progress => {
    if (endDate.isBefore(today)) {
        return Progress.closed;
    } else if (endDate.diff(today, "hour") < 24) {
        return Progress.closing;
    }

    return Progress.open;
};

export const getWorstSeverity = (severitys: Severity[]): Severity => {
    const severityScoringMap: { [key in Severity]: number } = {
        unknown: 0,
        verySlight: 1,
        slight: 2,
        normal: 3,
        severe: 4,
        verySevere: 5,
    };

    let worstSeverity: Severity = Severity.unknown;

    severitys.forEach((severity) => {
        if (!worstSeverity) {
            worstSeverity = severity;
        } else if (severityScoringMap[worstSeverity] < severityScoringMap[severity]) {
            worstSeverity = severity;
        }
    });

    return worstSeverity;
};

export const formatSortedDisruption = (disruption: Disruption): TableDisruption => {
    const modes: string[] = [];
    const severitys: Severity[] = [];
    const services: TableDisruption["services"] = [];
    const disruptionOperators: string[] = [];
    const atcoCodeSet = new Set<string>();

    let isOperatorWideCq = false;
    let isNetworkWideCq = false;
    let stopsAffectedCount = 0;
    let servicesAffectedCount = 0;

    const getEndDateTime = getSortedDisruptionFinalEndDate(disruption);

    const isLive = disruption.validity ? isLiveDisruption(disruption.validity, getEndDateTime) : false;

    let dataSource: Datasource | undefined = undefined;

    if (disruption.consequences) {
        disruption.consequences.forEach((consequence) => {
            const modeToAdd = getDisplayByValue(VEHICLE_MODES, consequence.vehicleMode);
            if (!!modeToAdd && !modes.includes(modeToAdd)) {
                modes.push(modeToAdd);
            }

            severitys.push(consequence.disruptionSeverity);

            switch (consequence.consequenceType) {
                case "services":
                    consequence.services.forEach((service) => {
                        services.push({
                            nocCode: service.nocCode,
                            lineName: service.lineName,
                            ref: service.dataSource === Datasource.bods ? service.lineId : service.serviceCode,
                            dataSource: service.dataSource,
                        });
                        servicesAffectedCount++;
                    });

                    consequence.stops?.map((stop) => {
                        if (!atcoCodeSet.has(stop.atcoCode)) {
                            atcoCodeSet.add(stop.atcoCode);
                            stopsAffectedCount++;
                        }
                    });

                    dataSource = consequence.services[0].dataSource;

                    break;

                case "operatorWide":
                    isOperatorWideCq = true;
                    consequence.consequenceOperators.forEach((op) => {
                        disruptionOperators.push(op.operatorNoc);
                    });
                    break;

                case "networkWide":
                    isNetworkWideCq = true;
                    break;

                case "stops":
                    consequence.stops?.map((stop) => {
                        if (!atcoCodeSet.has(stop.atcoCode)) {
                            atcoCodeSet.add(stop.atcoCode);
                            stopsAffectedCount++;
                        }
                    });
                    break;
            }
        });
    }

    const status = getDisruptionStatus(disruption);

    return {
        displayId: disruption.displayId,
        modes,
        consequenceLength: disruption.consequences ? disruption.consequences.length : 0,
        status,
        severity: getWorstSeverity(severitys),
        services,
        dataSource,
        operators: disruptionOperators,
        id: disruption.disruptionId,
        summary: reduceStringWithEllipsis(disruption.summary, 95),
        validityPeriods: mapValidityPeriods(disruption),
        publishStartDate: getDatetimeFromDateAndTime(
            disruption.publishStartDate,
            disruption.publishStartTime,
        ).toISOString(),
        publishEndDate:
            disruption.publishEndDate && disruption.publishEndTime
                ? getDatetimeFromDateAndTime(disruption.publishEndDate, disruption.publishEndTime).toISOString()
                : "",
        isOperatorWideCq: isOperatorWideCq,
        isNetworkWideCq: isNetworkWideCq,
        isLive: isLive,
        stopsAffectedCount: stopsAffectedCount,
        servicesAffectedCount,
        disruptionType: disruption.disruptionType,
        description: disruption.description,
        disruptionReason: disruption.disruptionReason,
        creationTime: disruption.creationTime,
        history: disruption.history,
    };
};
