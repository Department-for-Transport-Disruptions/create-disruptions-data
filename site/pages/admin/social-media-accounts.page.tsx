import { NextPageContext } from "next";
import Link from "next/link";
import { Fragment, ReactElement, ReactNode } from "react";
import Table from "../../components/form/Table";
import { BaseLayout } from "../../components/layout/Layout";
import { HOOTSUITE_URL } from "../../constants";
import { getHootsuiteData } from "../../data/hoostuite";
import { SocialMediaAccountsSchema } from "../../schemas/social-media-accounts.schema";
import { toLowerStartCase } from "../../utils";
import { getSessionWithOrgDetail } from "../../utils/apiUtils/auth";

const title = "Social Media Accounts - Create Transport Disruptions Service";
const description = "Social Media Accounts page for the Create Transport Disruptions Service";

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
