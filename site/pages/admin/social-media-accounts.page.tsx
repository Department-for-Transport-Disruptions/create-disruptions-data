import { NextPageContext } from "next";
import Link from "next/link";
import { Fragment, ReactElement, useState } from "react";
import Table from "../../components/form/Table";
import { BaseLayout } from "../../components/layout/Layout";
import DeleteConfirmationPopup from "../../components/popup/DeleteConfirmationPopup";
import { getHootsuiteAuthUrl, getHootsuiteAccountList } from "../../data/hootsuite";
import { getTwitterAuthUrl, getTwitterAccountList } from "../../data/twitter";
import { SocialMediaAccount } from "../../schemas/social-media-accounts.schema";
import { toLowerStartCase } from "../../utils";
import { getSessionWithOrgDetail } from "../../utils/apiUtils/auth";

const title = "Social Media Accounts - Create Transport Disruptions Service";
const description = "Social Media Accounts page for the Create Transport Disruptions Service";

export interface SocialMediaAccountsPageProps {
    socialMediaDetails: SocialMediaAccount[];
    hootsuiteAuthUrl: string;
    twitterAuthUrl: string;
    csrfToken?: string;
}

const SocialMediaAccounts = ({
    socialMediaDetails,
    hootsuiteAuthUrl,
    twitterAuthUrl,
    csrfToken,
}: SocialMediaAccountsPageProps): ReactElement => {
    const [socialAccountToDelete, setSocialAccountToDelete] = useState<SocialMediaAccount | null>(null);
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
        const keys: (keyof SocialMediaAccount)[] = ["accountType", "display", "addedBy", "expiresIn"];

        return socialMediaDetails.length > 0
            ? socialMediaDetails.map((item) => ({
                  cells: [
                      ...keys.map((k) => <p key={k}>{item[k]?.toString()}</p>),
                      item.hootsuiteProfiles?.map((profile) => (
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
                      )) ?? "N/A",
                      <button
                          className="govuk-link text-govBlue"
                          key={`remove-${item.id}`}
                          onClick={() => {
                              setSocialAccountToDelete(item);
                          }}
                      >
                          Remove
                      </button>,
                  ],
              }))
            : [];
    };

    const cancelActionHandler = () => {
        setSocialAccountToDelete(null);
    };

    return (
        <BaseLayout title={title} description={description}>
            <>
                <h1 className="govuk-heading-xl">Social media accounts</h1>
                {socialAccountToDelete ? (
                    <DeleteConfirmationPopup
                        entityName={`the ${
                            socialAccountToDelete.accountType === "Hootsuite" ? "hootsuite" : "twitter"
                        } connection`}
                        deleteUrl="/api/remove-social-connection"
                        cancelActionHandler={cancelActionHandler}
                        csrfToken={csrfToken || ""}
                        hiddenInputs={[
                            {
                                name: "profileId",
                                value: socialAccountToDelete.id,
                            },
                            {
                                name: "type",
                                value: socialAccountToDelete.accountType,
                            },
                        ]}
                    />
                ) : null}
                <Table
                    columns={[
                        "Account type",
                        "Username/page",
                        "Added by",
                        "Expires in",
                        "Hootsuite Profiles",
                        "Actions",
                    ]}
                    rows={getRows()}
                />

                <Link className="govuk-button mt-8 mr-4" data-module="govuk-button" href={hootsuiteAuthUrl}>
                    Connect Hootsuite
                </Link>
                <Link className="govuk-button mt-8" data-module="govuk-button" href={twitterAuthUrl}>
                    Connect Twitter
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

    const operatorOrgId = session.operatorOrgId || "";
    const [hootsuiteAccountList, twitterAccountList, hootsuiteAuthUrl, twitterAuthUrl] = await Promise.all([
        getHootsuiteAccountList(session.orgId, operatorOrgId),
        getTwitterAccountList(session.orgId, operatorOrgId),
        getHootsuiteAuthUrl(ctx),
        getTwitterAuthUrl(ctx),
    ]);

    return {
        props: {
            socialMediaDetails: [...hootsuiteAccountList, ...twitterAccountList],
            hootsuiteAuthUrl,
            twitterAuthUrl,
        },
    };
};

export default SocialMediaAccounts;
