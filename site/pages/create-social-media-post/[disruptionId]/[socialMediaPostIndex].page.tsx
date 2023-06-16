import { NextPageContext } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { parseCookies } from "nookies";
import { ReactElement, useState } from "react";
import crypto from "crypto";
import ErrorSummary from "../../../components/ErrorSummary";
import DateSelector from "../../../components/form/DateSelector";
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
import { getParameter, getParametersByPath, putParameter } from "../../../data/ssm";
import { PageState, ErrorInfo } from "../../../interfaces";
import { HootsuiteProfiles, SocialMediaAccountsSchema } from "../../../schemas/social-media-accounts.schema";
import { SocialMediaPost, socialMediaPostSchema } from "../../../schemas/social-media.schema";
import { destroyCookieOnResponseObject, getPageState } from "../../../utils/apiUtils";
import { getSession } from "../../../utils/apiUtils/auth";
import { getStateUpdater, handleBlur } from "../../../utils/formUtils";
const title = "Create social media message";
const description = "Create social media message page for the Create Transport Disruptions Service";

export interface CreateSocialMediaPostPageProps extends PageState<Partial<SocialMediaPost>> {
    disruptionSummary: string;
    socialMediaPostIndex: number;
    csrfToken?: string;
    socialAccounts: { value: string; display: string; socialMediaProfiles: { value: string; display: string }[] }[];
}

const CreateSocialMediaPost = (props: CreateSocialMediaPostPageProps): ReactElement => {
    const [pageState, setPageState] = useState<PageState<Partial<SocialMediaPost>>>(props);
    const [errorsMessageContent, setErrorsMessageContent] = useState<ErrorInfo[]>(pageState.errors);

    const queryParams = useRouter().query;
    const displayCancelButton =
        queryParams["return"]?.includes(REVIEW_DISRUPTION_PAGE_PATH) ||
        queryParams["return"]?.includes(DISRUPTION_DETAIL_PAGE_PATH);

    const stateUpdater = getStateUpdater(setPageState, pageState);
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
                                        onBlur={(e) =>
                                            handleBlur(
                                                e.target.value,
                                                "messageContent",
                                                stateUpdater,
                                                setErrorsMessageContent,
                                                socialMediaPostSchema.shape.messageContent,
                                            )
                                        }
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
                    <div className="govuk-form-group">
                        <h2 className="govuk-heading-l">Publish time and date</h2>

                        <DateSelector<SocialMediaPost>
                            display="Date"
                            hint={{ hidden: false, text: "Enter in format DD/MM/YYYY" }}
                            value={pageState.inputs.publishDate}
                            disabled={false}
                            disablePast={false}
                            inputName="publishDate"
                            stateUpdater={stateUpdater}
                            initialErrors={pageState.errors}
                            schema={socialMediaPostSchema.shape.publishDate}
                        />

                        <TimeSelector<SocialMediaPost>
                            display="Time"
                            hint="Enter the time in 24hr format. For example 0900 is 9am, 1730 is 5:30pm"
                            value={pageState.inputs.publishTime}
                            disabled={false}
                            inputName="publishTime"
                            stateUpdater={stateUpdater}
                            initialErrors={pageState.errors}
                            schema={socialMediaPostSchema.shape.publishTime}
                        />

                        <div className="govuk-form-group govuk-!-padding-top-3">
                            <h2 className="govuk-heading-l">Select social media account</h2>

                            <Select<SocialMediaPost>
                                inputName="socialAccount"
                                selectValues={props.socialAccounts.map((account) => ({
                                    value: account.value,
                                    display: account.display,
                                }))}
                                defaultDisplay="Social account"
                                stateUpdater={stateUpdater}
                                value={pageState.inputs.socialAccount}
                                initialErrors={pageState.errors}
                                schema={socialMediaPostSchema.shape.socialAccount}
                                displaySize="l"
                                display={""}
                            />
                            <Select<SocialMediaPost>
                                inputName="hootsuiteProfile"
                                defaultDisplay="Social account"
                                hint={"Select Hootsuite profile"}
                                display={""}
                                selectValues={
                                    props.socialAccounts?.find(
                                        (account) => account.value === pageState.inputs.socialAccount,
                                    )?.socialMediaProfiles || []
                                }
                                stateUpdater={stateUpdater}
                                value={pageState.inputs.hootsuiteProfile}
                                initialErrors={pageState.errors}
                                schema={socialMediaPostSchema.shape.hootsuiteProfile}
                                displaySize="l"
                            />
                        </div>
                        <input type="hidden" name="disruptionId" value={pageState.disruptionId} />
                        <input type="hidden" name="socialMediaPostIndex" value={props.socialMediaPostIndex} />

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

    const tokensByOrganisation = await getParametersByPath(`/social/${session.orgId}/hootsuite`);

    const refreshTokens = tokensByOrganisation?.Parameters?.map((token) => ({
        value: token.Value,
        name: token.Name,
        userId: token?.Name?.split("hootsuite/")[1].split("-")[0] ?? "",
    }));

    console.log(JSON.stringify(refreshTokens));
    let userData: SocialMediaAccountsSchema = [];
    const clientId = await getParameter(`/social/hootsuite/client_id`);
    const clientSecret = await getParameter(`/social/hootsuite/client_secret`);
    if (!clientId || !clientSecret) {
        throw new Error("clientId and clientSecret must be defined");
    }

    const hootsuiteKey = `${clientId.Parameter?.Value || ""}:${clientSecret.Parameter?.Value || ""}`;

    const authToken = `Basic ${Buffer.from(hootsuiteKey).toString("base64")}`;
    console.log(authToken);
    if (refreshTokens) {
        console.log("---------");
        await Promise.all(
            refreshTokens?.map(async (token) => {
                console.log(token.value);
                const resp = await fetch(`https://platform.hootsuite.com/oauth2/token`, {
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
                console.log("-----");

            
                if (resp.ok) {
                    const tokenResult = await resp.json();
                    console.log("oop");

                    const keys = await getParametersByPath(`/social/${session.orgId}/hootsuite`);

                    if (!keys || (refreshTokens && keys.Parameters?.length === 0)) {
                        throw new Error("Refresh token is required to fetch dropdown data");
                    }
                    const key: string = keys.Parameters?.find((rt) => rt.Name?.includes(`${token.userId}`))?.Name || "";
                    if (!key) {
                        throw new Error("Refresh token is required to fetch dropdown data");
                    }
                    console.log(key, "keyyy");
                    console.log(token.userId, "userid");
                    console.log(session.name);
                    console.log(session.name?.replace(" ", "_"));
                    await putParameter(key, tokenResult.refresh_token ?? "", "SecureString", true);
                    const userDetailsResponse = await fetch(`https://platform.hootsuite.com/v1/me`, {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${tokenResult.access_token ?? ""}`,
                        },
                    });
                    if (userDetailsResponse.ok) {
                        const userDetails = await userDetailsResponse.json();
                        const userInfo = userDetails.data || {};

                        const socialProfilesResponse = await fetch(`https://platform.hootsuite.com/v1/socialProfiles`, {
                            method: "GET",
                            headers: {
                                Authorization: `Bearer ${tokenResult.access_token ?? ""}`,
                            },
                        });
                        if (socialProfilesResponse.ok) {
                            const socialProfiles = await socialProfilesResponse.json();

                            userData = [
                                ...userData,
                                {
                                    ...userInfo,
                                    hootsuiteProfiles: (socialProfiles?.data?.map((sp: HootsuiteProfiles[0]) => ({
                                        type: sp.type,
                                        socialNetworkId: sp.socialNetworkId,
                                        id: sp.id,
                                    })) ?? []) as HootsuiteProfiles,
                                },
                            ] as SocialMediaAccountsSchema;
                        }
                    }
                }
            }),
        );
    }

    const socialAccounts = userData?.map((info) => ({
        value: info.id,
        display: info.email,
        socialMediaProfiles: info.hootsuiteProfiles.map((smp) => ({
            value: smp.id,
            display: `${smp.type}/${smp.id}`,
        })),
    }));

    return {
        props: {
            ...getPageState(errorCookie, socialMediaPostSchema, disruptionId, socialMediaPost || undefined),
            disruptionSummary: disruption?.summary || "",
            socialMediaPostIndex: index,
            socialAccounts,
        },
    };
};

export default CreateSocialMediaPost;
