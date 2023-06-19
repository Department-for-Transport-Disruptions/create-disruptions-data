import startCase from "lodash/startCase";
import { NextPageContext } from "next";
import { parseCookies } from "nookies";
import { getParameter, getParametersByPath, putParameter } from "./ssm";
import { COOKIES_ID_TOKEN, COOKIES_REFRESH_TOKEN, HOOTSUITE_URL } from "../constants";
import { hootsuiteMeSchema, hootsuiteTokenSchema, hootsuiteSocialProfilesSchema } from "../schemas/hootsuite.schema";
import { HootsuiteProfiles, SocialMediaAccountsSchema } from "../schemas/social-media-accounts.schema";

export const getHootsuiteToken = async (refreshToken: string, authToken: string) => {
    return await fetch(`${HOOTSUITE_URL}oauth2/token`, {
        method: "POST",
        body: new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: refreshToken ?? "",
        }),
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: authToken,
        },
    });
};

export const getHootsuiteData = async (
    ctx: NextPageContext,
    username: string,
    orgId: string,
): Promise<{ clientId: string; userData: SocialMediaAccountsSchema }> => {
    const cookies = parseCookies(ctx);
    let clientIdValue = "";
    let userData: SocialMediaAccountsSchema = [];
    try {
        const idToken = cookies[COOKIES_ID_TOKEN];
        const refreshToken = cookies[COOKIES_REFRESH_TOKEN];

        const [clientId, clientSecret, keys, tokensByOrganisation] = await Promise.all([
            getParameter(`/social/hootsuite/client_id`),
            getParameter(`/social/hootsuite/client_secret`),
            getParametersByPath(`/social/${orgId}/hootsuite`),
            getParametersByPath(`/social/${orgId}/hootsuite`),
        ]);

        if (!clientId || !clientSecret) {
            throw new Error("clientId and clientSecret must be defined");
        }

        clientIdValue = clientId.Parameter?.Value || "";
        const key = `${clientId.Parameter?.Value || ""}:${clientSecret.Parameter?.Value || ""}`;

        const authToken = `Basic ${Buffer.from(key).toString("base64")}`;

        if (idToken && refreshToken)
            await Promise.all([
                putParameter(`/${username}/token`, idToken, "SecureString", true),
                putParameter(`/${username}/refresh-token`, refreshToken, "SecureString", true),
            ]);

        const refreshTokens = tokensByOrganisation?.Parameters?.map((token) => {
            return {
                value: token.Value,
                name: token.Name,
                userId: token?.Name?.split("hootsuite/")[1]?.split("-")[0] ?? "",
                accountType: startCase(token?.Name?.split("/")[3]) ?? "",
                addedBy: token?.Name?.split("/")[4]?.replace("_", " ")?.split("-")[1] ?? "",
            };
        });

        if (refreshTokens && refreshTokens.length > 0) {
            await Promise.all(
                refreshTokens?.map(async (token) => {
                    const resp = await getHootsuiteToken(token.value || "", authToken);
                    if (resp.ok) {
                        const tokenResult = hootsuiteTokenSchema.parse(await resp.json());

                        if (!keys || (refreshTokens && keys.Parameters?.length === 0)) {
                            throw new Error("Refresh token is required to fetch dropdown data");
                        }
                        const key: string =
                            keys.Parameters?.find((rt) => rt.Name?.includes(`${token.userId}`))?.Name || "";
                        if (!key) {
                            throw new Error("Refresh token is required to fetch dropdown data");
                        }

                        await putParameter(key, tokenResult.refresh_token ?? "", "SecureString", true);
                        const userDetailsResponse = await fetch(`${HOOTSUITE_URL}v1/me`, {
                            method: "GET",
                            headers: {
                                Authorization: `Bearer ${tokenResult.access_token ?? ""}`,
                            },
                        });
                        if (userDetailsResponse.ok) {
                            const userDetails = hootsuiteMeSchema.parse(await userDetailsResponse.json());
                            const userInfo = userDetails.data || {};

                            const extraInfo = {
                                ...userInfo,
                                accountType: token.accountType || "",
                                addedBy: token.addedBy || "",
                                expiresIn: "Never",
                            };

                            const socialProfilesResponse = await fetch(`${HOOTSUITE_URL}v1/socialProfiles`, {
                                method: "GET",
                                headers: {
                                    Authorization: `Bearer ${tokenResult.access_token ?? ""}`,
                                },
                            });
                            if (socialProfilesResponse.ok) {
                                const socialProfiles = hootsuiteSocialProfilesSchema.parse(
                                    await socialProfilesResponse.json(),
                                );

                                userData = [
                                    ...userData,
                                    {
                                        ...extraInfo,
                                        hootsuiteProfiles:
                                            socialProfiles.data?.map((sp: HootsuiteProfiles[0]) => ({
                                                type: sp.type,
                                                socialNetworkId: sp.socialNetworkId,
                                                id: sp.id,
                                            })) ?? [],
                                    },
                                ];
                            }
                        }
                    }
                }),
            );
        }

        return { clientId: clientIdValue, userData };
    } catch (e) {
        throw new Error(`${(e as Error).message}`);
    }
};
