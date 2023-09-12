import { NextPageContext } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { parseCookies } from "nookies";
import { ReactElement, useState } from "react";
import DateSelector from "../../../components/form/DateSelector";
import ErrorSummary from "../../../components/form/ErrorSummary";
import FormElementWrapper, { FormGroupWrapper } from "../../../components/form/FormElementWrapper";
import Select from "../../../components/form/Select";
import TimeSelector from "../../../components/form/TimeSelector";
import { BaseLayout } from "../../../components/layout/Layout";
import {
    COOKIES_SOCIAL_MEDIA_ERRORS,
    DISRUPTION_DETAIL_PAGE_PATH,
    REVIEW_DISRUPTION_PAGE_PATH,
} from "../../../constants";
import { getDisruptionById } from "../../../data/dynamo";
import { getHootsuiteAccountList } from "../../../data/hootsuite";
import { getTwitterAccountList } from "../../../data/twitter";
import { PageState, ErrorInfo } from "../../../interfaces";
import { SocialMediaAccount } from "../../../schemas/social-media-accounts.schema";
import { SocialMediaPost, socialMediaPostSchema } from "../../../schemas/social-media.schema";
import { destroyCookieOnResponseObject, getPageState } from "../../../utils/apiUtils";
import { getSession } from "../../../utils/apiUtils/auth";
import { getStateUpdater } from "../../../utils/formUtils";

const title = "Create social media message";
const description = "Create social media message page for the Create Transport Disruptions Service";

export interface CreateSocialMediaPostPageProps extends PageState<Partial<SocialMediaPost>> {
    disruptionSummary: string;
    socialMediaPostIndex: number;
    csrfToken?: string;
    socialAccounts: SocialMediaAccount[];
}

const CreateSocialMediaPost = (props: CreateSocialMediaPostPageProps): ReactElement => {
    const [pageState, setPageState] = useState<PageState<Partial<SocialMediaPost>>>(props);
    const [errorsMessageContent, setErrorsMessageContent] = useState<ErrorInfo[]>(pageState.errors);

    const queryParams = useRouter().query;
    const displayCancelButton =
        queryParams["return"]?.includes(REVIEW_DISRUPTION_PAGE_PATH) ||
        queryParams["return"]?.includes(DISRUPTION_DETAIL_PAGE_PATH);

    const stateUpdater = getStateUpdater(setPageState, pageState);

    const accountType = props.socialAccounts?.find(
        (account) => account.id === pageState.inputs.socialAccount,
    )?.accountType;

    return (
        <BaseLayout title={title} description={description}>
            <form
                encType="multipart/form-data"
                action={`/api/create-social-media-post?_csrf=${props.csrfToken || ""}`}
                method="post"
            >
                <>
                    <ErrorSummary errors={props.errors} />
                    <div className="govuk-form-group">
                        <h1 className="govuk-heading-xl">Social media message</h1>

                        <FormGroupWrapper errorIds={["messageContent"]} errors={errorsMessageContent}>
                            <div className="govuk-form-group" id={"message-content"}>
                                <label className={`govuk-label govuk-label--l`} htmlFor={`message-content-input`}>
                                    Message content
                                </label>

                                <div id={`message-content-hint`} className="govuk-hint">
                                    You can enter up to 200 characters
                                </div>

                                <FormElementWrapper
                                    errors={errorsMessageContent}
                                    errorId={"messageContent"}
                                    errorClass="govuk-input--error"
                                >
                                    <textarea
                                        className={`govuk-textarea w-3/4`}
                                        name={"messageContent"}
                                        id={`message-content-input`}
                                        rows={3}
                                        maxLength={500}
                                        defaultValue={pageState.inputs.messageContent}
                                        onChange={(e) => stateUpdater(e.target.value, "messageContent")}
                                        aria-describedby={`message-content-hint`}
                                    />
                                </FormElementWrapper>
                            </div>
                        </FormGroupWrapper>

                        {!pageState.inputs.messageContent ||
                        (pageState.inputs && pageState.inputs.messageContent.length === 0) ? (
                            <button
                                className="mt-3 govuk-link"
                                data-module="govuk-button"
                                onClick={() => {
                                    setErrorsMessageContent(
                                        errorsMessageContent.filter((e) => e.id !== "messageContent"),
                                    );
                                    stateUpdater(props.disruptionSummary, "messageContent");
                                }}
                            >
                                <p className="text-govBlue govuk-body-m">Copy from disruption summary</p>
                            </button>
                        ) : null}

                        <br />

                        <FormGroupWrapper errorIds={["image"]} errors={pageState.errors}>
                            <fieldset className="govuk-fieldset">
                                <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                                    <h2
                                        className="govuk-fieldset__heading govuk-visually-hidden"
                                        id="passenger-type-page-heading"
                                    >
                                        Upload file
                                    </h2>
                                </legend>
                                <FormElementWrapper
                                    errorId="image"
                                    errorClass="govuk-file-upload--error"
                                    errors={pageState.errors}
                                >
                                    <>
                                        <input
                                            className="govuk-file-upload"
                                            type="file"
                                            id="image"
                                            name="image"
                                            accept="image/png, image/jpeg, image/jpg"
                                        />
                                    </>
                                </FormElementWrapper>
                            </fieldset>
                        </FormGroupWrapper>
                    </div>
                    <div className="govuk-form-group govuk-!-padding-top-3">
                        <h2 className="govuk-heading-l">Select social media account</h2>

                        <Select<SocialMediaPost>
                            inputName="socialAccount"
                            selectValues={props.socialAccounts.map((account) => ({
                                value: account.id,
                                display: `${account.display} (${account.accountType})`,
                            }))}
                            defaultDisplay="Social account"
                            stateUpdater={stateUpdater}
                            value={pageState.inputs.socialAccount}
                            initialErrors={pageState.errors}
                            displaySize="l"
                            display={""}
                        />
                        <Select<SocialMediaPost>
                            inputName="hootsuiteProfile"
                            defaultDisplay="Social account"
                            hint={"Select Hootsuite profile"}
                            display={""}
                            selectValues={
                                props.socialAccounts
                                    ?.find((account) => account.id === pageState.inputs.socialAccount)
                                    ?.hootsuiteProfiles?.map((profile) => ({
                                        display: `${profile.type}/${profile.id}`,
                                        value: profile.id,
                                    })) ?? []
                            }
                            stateUpdater={stateUpdater}
                            value={pageState.inputs.hootsuiteProfile}
                            initialErrors={pageState.errors}
                            displaySize="l"
                            disabled={accountType === "Twitter"}
                        />
                    </div>
                    <div className="govuk-form-group">
                        <h2 className="govuk-heading-l">Publish time and date</h2>

                        <DateSelector<SocialMediaPost>
                            display="Date"
                            hint={{ hidden: false, text: "Enter in format DD/MM/YYYY" }}
                            value={pageState.inputs.publishDate}
                            disabled={accountType === "Twitter"}
                            disablePast={false}
                            inputName="publishDate"
                            stateUpdater={stateUpdater}
                            initialErrors={pageState.errors}
                        />

                        <TimeSelector<SocialMediaPost>
                            display="Time"
                            hint="Enter the time in 24hr format. For example 0900 is 9am, 1730 is 5:30pm"
                            value={pageState.inputs.publishTime}
                            disabled={accountType === "Twitter"}
                            inputName="publishTime"
                            stateUpdater={stateUpdater}
                            initialErrors={pageState.errors}
                        />

                        <input type="hidden" name="disruptionId" value={pageState.disruptionId} />
                        <input type="hidden" name="socialMediaPostIndex" value={props.socialMediaPostIndex} />
                        <input type="hidden" name="accountType" value={accountType} />

                        <button className="govuk-button mt-8" data-module="govuk-button">
                            Save and continue
                        </button>
                        {displayCancelButton && pageState.disruptionId ? (
                            <Link
                                role="button"
                                href={`${queryParams["return"] as string}/${pageState.disruptionId}`}
                                className="govuk-button  mt-8 ml-5 govuk-button--secondary"
                            >
                                Back
                            </Link>
                        ) : null}
                    </div>
                </>
            </form>
        </BaseLayout>
    );
};

export const getServerSideProps = async (ctx: NextPageContext): Promise<{ props: object } | void> => {
    const cookies = parseCookies(ctx);
    const errorCookie = cookies[COOKIES_SOCIAL_MEDIA_ERRORS];

    if (!ctx.req) {
        throw new Error("No context request");
    }

    const session = getSession(ctx.req);

    if (!session) {
        throw new Error("No session found");
    }

    const index = ctx.query.socialMediaPostIndex ? Number(ctx.query.socialMediaPostIndex) : 0;

    const disruptionId = ctx.query.disruptionId?.toString() ?? "";
    const disruption = await getDisruptionById(disruptionId, session.orgId);
    const socialMediaPost = disruption?.socialMediaPosts?.find((s) => s.socialMediaPostIndex === index);

    if (ctx.res) destroyCookieOnResponseObject(COOKIES_SOCIAL_MEDIA_ERRORS, ctx.res);

    const hootsuiteAccounts = await getHootsuiteAccountList(session.orgId);
    const twitterAccounts = await getTwitterAccountList(session.orgId);

    return {
        props: {
            ...getPageState(errorCookie, socialMediaPostSchema, disruptionId, socialMediaPost || undefined),
            disruptionSummary: disruption?.summary || "",
            socialMediaPostIndex: index,
            socialAccounts: [...hootsuiteAccounts, ...twitterAccounts],
        },
    };
};

export default CreateSocialMediaPost;
