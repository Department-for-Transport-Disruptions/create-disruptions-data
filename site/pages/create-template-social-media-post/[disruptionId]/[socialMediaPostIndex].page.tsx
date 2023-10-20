import { PublishStatus } from "@create-disruptions-data/shared-ts/enums";
import { NextPageContext } from "next";
import Link from "next/link";
import { parseCookies } from "nookies";
import { ReactElement, useState } from "react";
import ErrorSummary from "../../../components/form/ErrorSummary";
import FormElementWrapper, { FormGroupWrapper } from "../../../components/form/FormElementWrapper";
import Select from "../../../components/form/Select";
import TextInput from "../../../components/form/TextInput";
import { BaseLayout } from "../../../components/layout/Layout";
import {
    COOKIES_TEMPLATE_SOCIAL_MEDIA_ERRORS,
    REVIEW_TEMPLATE_PAGE_PATH,
    TEMPLATE_OVERVIEW_PAGE_PATH,
} from "../../../constants";
import { getTemplateById } from "../../../data/dynamo";
import { getHootsuiteAccountList } from "../../../data/hootsuite";
import { getTwitterAccountList } from "../../../data/twitter";
import { PageState, ErrorInfo } from "../../../interfaces";
import { SocialMediaAccount } from "../../../schemas/social-media-accounts.schema";
import { HootsuitePost, SocialMediaPost, socialMediaPostSchema } from "../../../schemas/social-media.schema";
import { destroyCookieOnResponseObject, getPageState } from "../../../utils/apiUtils";
import { getSession } from "../../../utils/apiUtils/auth";
import { getStateUpdater } from "../../../utils/formUtils";

const title = "Create social media message";
const description = "Create social media message page for the Create Transport Disruptions Service";

export interface CreateSocialMediaPostPageProps extends PageState<Partial<HootsuitePost>> {
    disruptionDescription: string;
    socialMediaPostIndex: number;
    csrfToken?: string;
    socialAccounts: SocialMediaAccount[];
    template?: string;
}

const CreateTemplateSocialMediaPost = (props: CreateSocialMediaPostPageProps): ReactElement => {
    const [pageState, setPageState] = useState<PageState<Partial<HootsuitePost>>>(props);
    const [errorsMessageContent, setErrorsMessageContent] = useState<ErrorInfo[]>(pageState.errors);

    const returnPath =
        props.disruptionStatus !== PublishStatus.draft ? TEMPLATE_OVERVIEW_PAGE_PATH : REVIEW_TEMPLATE_PAGE_PATH;

    const isEditing =
        props.disruptionStatus === PublishStatus.editing ||
        props.disruptionStatus === PublishStatus.editPendingApproval ||
        props.disruptionStatus === PublishStatus.pendingAndEditing;

    const displayCancelButton = isEditing || props.inputs.socialAccount;

    const stateUpdater = getStateUpdater(setPageState, pageState);

    const accountType = props.socialAccounts?.find(
        (account) => account.id === pageState.inputs.socialAccount,
    )?.accountType;

    return (
        <BaseLayout title={title} description={description}>
            <form
                encType="multipart/form-data"
                action={`/api/create-template-social-media-post?_csrf=${props.csrfToken || ""}`}
                method="post"
            >
                <>
                    <ErrorSummary errors={props.errors} />
                    <div className="govuk-form-group">
                        <h1 className="govuk-heading-xl">Social media message</h1>

                        <div className="govuk-form-group govuk-!-padding-top-3">
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
                                display="Select social media account"
                            />
                            {accountType === "Hootsuite" && (
                                <Select<HootsuitePost>
                                    inputName="hootsuiteProfile"
                                    defaultDisplay="Social account"
                                    display={"Select Hootsuite profile"}
                                    selectValues={
                                        props.socialAccounts
                                            ?.find((account) => account.id === pageState.inputs.socialAccount)
                                            ?.hootsuiteProfiles?.map((profile) => ({
                                                display: `${profile.type}/${profile.id}`,
                                                value: profile.id,
                                            })) ?? []
                                    }
                                    stateUpdater={stateUpdater}
                                    value={
                                        pageState.inputs.accountType === "Hootsuite"
                                            ? pageState.inputs.hootsuiteProfile
                                            : undefined
                                    }
                                    initialErrors={pageState.errors}
                                    displaySize="s"
                                />
                            )}
                        </div>

                        <FormGroupWrapper errorIds={["messageContent"]} errors={errorsMessageContent}>
                            <div className="govuk-form-group" id={"message-content"}>
                                <FormElementWrapper
                                    errors={errorsMessageContent}
                                    errorId={"messageContent"}
                                    errorClass="govuk-input--error"
                                >
                                    <TextInput<SocialMediaPost>
                                        display="Message content"
                                        displaySize="l"
                                        hint="You can enter up to 280 characters"
                                        inputName="messageContent"
                                        maxLength={280}
                                        stateUpdater={stateUpdater}
                                        textArea
                                        widthClass="w-3/4"
                                        rows={3}
                                        value={pageState.inputs.messageContent}
                                    />
                                </FormElementWrapper>
                            </div>
                        </FormGroupWrapper>

                        {!pageState.inputs.messageContent ||
                        (pageState.inputs && pageState.inputs.messageContent.length === 0) ? (
                            <button
                                className="govuk-link"
                                data-module="govuk-button"
                                onClick={() => {
                                    setErrorsMessageContent(
                                        errorsMessageContent.filter((e) => e.id !== "messageContent"),
                                    );
                                    stateUpdater(props.disruptionDescription?.slice(0, 280), "messageContent");
                                }}
                            >
                                <p className="text-govBlue govuk-body-m">Copy from disruption description</p>
                            </button>
                        ) : null}

                        <br />

                        {accountType === "Hootsuite" && (
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
                        )}
                    </div>

                    <input type="hidden" name="disruptionId" value={pageState.disruptionId} />
                    <input type="hidden" name="socialMediaPostIndex" value={props.socialMediaPostIndex} />

                    <button className="govuk-button mt-8" data-module="govuk-button">
                        Save and continue
                    </button>
                    {displayCancelButton && pageState.disruptionId ? (
                        <Link
                            role="button"
                            href={`${returnPath}/${pageState.disruptionId}`}
                            className="govuk-button  mt-8 ml-5 govuk-button--secondary"
                        >
                            Back
                        </Link>
                    ) : null}
                </>
            </form>
        </BaseLayout>
    );
};

export const getServerSideProps = async (ctx: NextPageContext): Promise<{ props: object } | void> => {
    const cookies = parseCookies(ctx);
    const errorCookie = cookies[COOKIES_TEMPLATE_SOCIAL_MEDIA_ERRORS];

    if (!ctx.req) {
        throw new Error("No context request");
    }

    const session = getSession(ctx.req);

    if (!session) {
        throw new Error("No session found");
    }

    const index = ctx.query.socialMediaPostIndex ? Number(ctx.query.socialMediaPostIndex) : 0;

    const disruptionId = ctx.query.disruptionId?.toString() ?? "";
    const disruption = await getTemplateById(disruptionId, session.orgId);
    const socialMediaPost = disruption?.socialMediaPosts?.find((s) => s.socialMediaPostIndex === index);

    if (ctx.res) destroyCookieOnResponseObject(COOKIES_TEMPLATE_SOCIAL_MEDIA_ERRORS, ctx.res);

    const hootsuiteAccounts = await getHootsuiteAccountList(session.orgId);
    const twitterAccounts = await getTwitterAccountList(session.orgId);

    return {
        props: {
            ...getPageState(errorCookie, socialMediaPostSchema, disruptionId, socialMediaPost || undefined),
            disruptionDescription: disruption?.description || "",
            socialMediaPostIndex: index,
            socialAccounts: [...hootsuiteAccounts, ...twitterAccounts],
            disruptionStatus: disruption?.publishStatus,
        },
    };
};

export default CreateTemplateSocialMediaPost;
