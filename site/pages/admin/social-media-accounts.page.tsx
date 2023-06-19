import startCase from "lodash/startCase";
import { NextPageContext } from "next";
import Link from "next/link";
import { parseCookies } from "nookies";
import { Fragment, ReactElement, ReactNode } from "react";
import Table from "../../components/form/Table";
import { BaseLayout } from "../../components/layout/Layout";
import { COOKIES_ID_TOKEN, COOKIES_REFRESH_TOKEN, HOOTSUITE_URL } from "../../constants";
import { getParameter, getParametersByPath, putParameter } from "../../data/ssm";
import { hootsuiteMeSchema, hootsuiteTokenSchema, hootsuiteSocialProfilesSchema } from "../../schemas/hootsuite.schema";
import { HootsuiteProfiles, SocialMediaAccountsSchema } from "../../schemas/social-media-accounts.schema";
import { toLowerStartCase } from "../../utils";
import { getSessionWithOrgDetail } from "../../utils/apiUtils/auth";

const title = "Social Media Accounts - Create Transport Disruptions Service";
const description = "Social Media Accounts page for the Create Transport Disruptions Service";

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

        const [clientId, clientSecret, keys] = await Promise.all([
            getParameter(`/social/hootsuite/client_id`),
            getParameter(`/social/hootsuite/client_secret`),
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

        const tokensByOrganisation = await getParametersByPath(`/social/${orgId}/hootsuite`);
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
                    const resp = await fetch(`${HOOTSUITE_URL}oauth2/token`, {
                        method: "POST",
                        body: new URLSearchParams({
                            grant_type: "refresh_token",
                            refresh_token: token.value ?? "",
                        }),
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded",
                            Authorization: authToken,
                        },
                    });
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
export interface SocialMediaAccountsPageProps {
    socialMediaData: SocialMediaAccountsSchema;
    username: string;
    clientId: string;
}

const SocialMediaAccounts = ({ socialMediaData, username, clientId }: SocialMediaAccountsPageProps): ReactElement => {
    const getLink = (type: string, id: string) => {
        switch (type.toLocaleUpperCase()) {
            case "TWITTER":
                return `https://twitter.com/intent/user?user_id=${id}/`;
            case "FACEBOOK":
                return `https://www.facebook.com/app_scoped_user_id/${id}/`;
            default:
                return "";
        }
    };

    const getRows = () => {
        const keys = ["accountType", "email", "addedBy", "expiresIn"];
        return socialMediaData.length > 0
            ? socialMediaData.map((item: SocialMediaAccountsSchema[0]) => ({
                  cells: [
                      ...keys.map((k) => <p key={k}>{item[k as keyof SocialMediaAccountsSchema[0]] as ReactNode}</p>),
                      item.hootsuiteProfiles.map((profile) => (
                          <Fragment key={profile.id}>
                              <li className="list-none">
                                  <Link
                                      className="govuk-link text-govBlue"
                                      key={`${toLowerStartCase(profile.type)}/${profile.id}`}
                                      href={getLink(profile.type, profile.socialNetworkId)}
                                  >
                                      {`${toLowerStartCase(profile.type)}/${profile.id}`}
                                  </Link>
                              </li>
                          </Fragment>
                      )),
                  ],
              }))
            : [];
    };

    return (
        <BaseLayout title={title} description={description}>
            <>
                <h1 className="govuk-heading-xl">Social media accounts</h1>
                <Table
                    columns={["Account type", "Username/page", "Added by", "Expires in", "Hootsuite Profiles"]}
                    rows={getRows()}
                />
                <Link
                    className="govuk-button mt-8"
                    data-module="govuk-button"
                    href={`${HOOTSUITE_URL}oauth2/auth?response_type=code&scope=offline&redirect_uri=http://localhost:3000/api/hootsuite-callback&client_id=${clientId}&state=${username}`}
                >
                    Connect hootsuite
                </Link>
            </>
        </BaseLayout>
    );
};

export const getServerSideProps = async (ctx: NextPageContext): Promise<{ props: SocialMediaAccountsPageProps }> => {
    if (!ctx.req) {
        throw new Error("No context request");
    }

    const session = await getSessionWithOrgDetail(ctx.req);

    if (!session) {
        throw new Error("Session data not found");
    }

    const { clientId, userData } = await getHootsuiteData(ctx, session.username, session.orgId);
    return {
        props: { socialMediaData: userData, username: session.username, clientId },
    };
};

export default SocialMediaAccounts;
