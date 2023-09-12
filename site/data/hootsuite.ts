import { NextPageContext } from "next";
import { setCookie } from "nookies";
import { randomUUID } from "crypto";
import { addSocialAccountToOrg, getOrgSocialAccounts } from "./dynamo";
import { getParameter, putParameter } from "./ssm";
import { COOKIES_HOOTSUITE_STATE, HOOTSUITE_URL } from "../constants";
import { hootsuiteMeSchema, hootsuiteSocialProfilesSchema, hootsuiteTokenSchema } from "../schemas/hootsuite.schema";
import { SocialMediaAccount } from "../schemas/social-media-accounts.schema";
import { notEmpty } from "../utils";
import logger from "../utils/logger";

const [hootsuiteClientIdParam, hootsuiteClientSecretParam] = await Promise.all([
    getParameter(`/social/hootsuite/client_id`),
    getParameter(`/social/hootsuite/client_secret`),
]);

const hootsuiteClientId = hootsuiteClientIdParam.Parameter?.Value ?? "";
const hootsuiteClientSecret = hootsuiteClientSecretParam.Parameter?.Value ?? "";

export const hootsuiteRedirectUri = `${process.env.DOMAIN_NAME as string}/api/hootsuite-callback`;

const getSsmKey = (orgId: string, id: string) => `/social/${orgId}/hootsuite/${id}/refresh_token`;

export const addHootsuiteAccount = async (code: string, orgId: string, addedBy: string) => {
    const authHeader = getHootsuiteAuthHeader();

    const tokenResponse = await fetch(`${HOOTSUITE_URL}oauth2/token`, {
        method: "POST",
        body: new URLSearchParams({
            grant_type: "authorization_code",
            code,
            redirect_uri: hootsuiteRedirectUri,
        }),
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: authHeader,
        },
    });

    if (!tokenResponse.ok) {
        const message = `An error has occured: ${tokenResponse.status}`;
        throw new Error(message);
    }

    const tokenResult = hootsuiteTokenSchema.parse(await tokenResponse.json());

    const userDetailsResponse = await fetch(`${HOOTSUITE_URL}v1/me`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${tokenResult.accessToken}`,
        },
    });

    if (!userDetailsResponse.ok) {
        const message = `An error has occured: ${userDetailsResponse.status}`;
        throw new Error(message);
    }

    const userDetails = hootsuiteMeSchema.parse(await userDetailsResponse.json());

    await Promise.all([
        addSocialAccountToOrg(orgId, userDetails.id, userDetails.email, addedBy, "Hootsuite"),
        putParameter(getSsmKey(orgId, userDetails.id), tokenResult.refreshToken, "SecureString", true),
    ]);
};

export const refreshHootsuiteToken = async (
    refreshToken: string,
    authHeader: string,
    orgId: string,
    socialId: string,
) => {
    const resp = await fetch(`${HOOTSUITE_URL}oauth2/token`, {
        method: "POST",
        body: new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: refreshToken ?? "",
        }),
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: authHeader,
        },
    });

    if (!resp.ok) {
        throw new Error("Unable to retrieve tokens for hootsuite");
    }

    const parsedTokens = hootsuiteTokenSchema.parse(await resp.json());

    await putParameter(getSsmKey(orgId, socialId), parsedTokens.refreshToken, "SecureString", true);

    return parsedTokens.accessToken;
};

const getHootsuiteUserDetails = async (accessToken: string) => {
    const userDetailsResponse = await fetch(`${HOOTSUITE_URL}v1/me`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!userDetailsResponse.ok) {
        throw new Error("Not authorised to retrieve hootsuite user details");
    }

    return hootsuiteMeSchema.parse(await userDetailsResponse.json());
};

const getHootsuiteProfiles = async (hootsuiteAccessToken: string) => {
    const socialProfilesResponse = await fetch(`${HOOTSUITE_URL}v1/socialProfiles`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${hootsuiteAccessToken}`,
        },
    });

    if (!socialProfilesResponse.ok) {
        throw new Error("Not authorised to retrieve hootsuite profiles");
    }

    return hootsuiteSocialProfilesSchema.parse(await socialProfilesResponse.json());
};

export const getHootsuiteAuthHeader = () => {
    const key = `${hootsuiteClientId}:${hootsuiteClientSecret}`;

    return `Basic ${Buffer.from(key).toString("base64")}`;
};

export const getHootsuiteDetails = async (
    orgId: string,
    socialId: string,
    addedBy: string,
): Promise<SocialMediaAccount | null> => {
    try {
        const refreshTokenParam = await getParameter(getSsmKey(orgId, socialId), true);

        if (!refreshTokenParam.Parameter?.Value) {
            return null;
        }

        const refreshToken = refreshTokenParam.Parameter.Value;

        const authHeader = getHootsuiteAuthHeader();
        const hootsuiteAccessToken = await refreshHootsuiteToken(refreshToken, authHeader, orgId, socialId);

        const [hootsuiteUserDetails, hootsuiteProfiles] = await Promise.all([
            getHootsuiteUserDetails(hootsuiteAccessToken),
            getHootsuiteProfiles(hootsuiteAccessToken),
        ]);

        return {
            accountType: "Hootsuite",
            addedBy,
            display: hootsuiteUserDetails.email,
            id: socialId,
            expiresIn: "Never",
            hootsuiteProfiles,
        };
    } catch (e) {
        logger.error(e);
        return null;
    }
};

export const getHootsuiteAccountList = async (orgId: string): Promise<SocialMediaAccount[]> => {
    const socialAccounts = await getOrgSocialAccounts(orgId);

    const hootsuiteDetail = await Promise.all(
        socialAccounts.map(async (account) => {
            if (account.accountType !== "Hootsuite") {
                return null;
            }

            return getHootsuiteDetails(orgId, account.id, account.addedBy);
        }),
    );

    return hootsuiteDetail.filter(notEmpty);
};

export const getHootsuiteAuthUrl = (ctx: NextPageContext) => {
    const state = randomUUID();

    setCookie(ctx, COOKIES_HOOTSUITE_STATE, state, {
        sameSite: "lax",
        path: "/",
    });

    return `${HOOTSUITE_URL}oauth2/auth?response_type=code&scope=offline&redirect_uri=${hootsuiteRedirectUri}&client_id=${hootsuiteClientId}&state=${state}`;
};
