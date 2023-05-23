import { NextPageContext } from "next";
import { parseCookies } from "nookies";
import { ReactElement, useState } from "react";
import ErrorSummary from "../../../components/ErrorSummary";
import CsrfForm from "../../../components/form/CsrfForm";
import DateSelector from "../../../components/form/DateSelector";
import { FormGroupWrapper } from "../../../components/form/FormElementWrapper";
import Select from "../../../components/form/Select";
import TextInput from "../../../components/form/TextInput";
import TimeSelector from "../../../components/form/TimeSelector";
import { BaseLayout } from "../../../components/layout/Layout";
import { COOKIES_SOCIAL_MEDIA_ERRORS } from "../../../constants";
import { getDisruptionById } from "../../../data/dynamo";
import { PageState } from "../../../interfaces";
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
}

const CreateSocialMediaPost = (props: CreateSocialMediaPostPageProps): ReactElement => {
    const [pageState, setPageState] = useState<PageState<Partial<SocialMediaPost>>>(props);

    const stateUpdater = getStateUpdater(setPageState, pageState);
    return (
        <BaseLayout title={title} description={description}>
            <CsrfForm
                encType="multipart/form-data"
                action={`/api/create-social-media-post?_csrf=${props.csrfToken || ""}`}
                method="post"
                csrfToken={props.csrfToken}
                hideCsrf
            >
                <>
                    <ErrorSummary errors={props.errors} />
                    <div className="govuk-form-group">
                        <h1 className="govuk-heading-xl">Social media message</h1>

                        <TextInput<SocialMediaPost>
                            display="Message content"
                            inputName="messageContent"
                            widthClass="w-3/4"
                            displaySize="l"
                            textArea
                            rows={3}
                            hint={"You can enter up to 200 characters"}
                            maxLength={500}
                            stateUpdater={stateUpdater}
                            value={pageState.inputs.messageContent}
                            initialErrors={pageState.errors}
                            schema={socialMediaPostSchema.shape.messageContent}
                        />

                        <button
                            disabled={!!(pageState.inputs.messageContent && pageState.inputs.messageContent.length > 0)}
                            className="mt-3 govuk-link"
                            data-module="govuk-button"
                            onClick={() => {
                                stateUpdater(props.disruptionSummary, "messageContent");
                            }}
                        >
                            <p className="text-govBlue govuk-body-m">Copy from disruption summary</p>
                        </button>

                        <br />

                        <FormGroupWrapper errorIds={["image"]} errors={pageState.errors}>
                            <input
                                className="govuk-file-upload"
                                type="file"
                                id="image"
                                name="image"
                                accept="image/png, image/jpeg, image/jpg"
                            />
                        </FormGroupWrapper>
                    </div>
                    <div className="govuk-form-group">
                        <h2 className="govuk-heading-l">Publish time and date</h2>

                        <DateSelector<SocialMediaPost>
                            display="Date"
                            hint="Enter in format DD/MM/YYYY"
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
                                selectValues={[{ value: "TWITTER", display: "Twitter" }]}
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
                                selectValues={[{ value: "hootsuite1", display: "Hootsuite 1" }]}
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
                    </div>
                </>
            </CsrfForm>
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

    if (ctx.res) destroyCookieOnResponseObject(COOKIES_SOCIAL_MEDIA_ERRORS, ctx.res);

    return {
        props: {
            ...getPageState(errorCookie, socialMediaPostSchema, disruptionId),
            disruptionSummary: disruption?.summary,
            socialMediaPostIndex: index,
        },
    };
};

export default CreateSocialMediaPost;
