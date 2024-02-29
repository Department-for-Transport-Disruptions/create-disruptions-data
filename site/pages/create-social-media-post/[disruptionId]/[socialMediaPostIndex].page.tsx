import { NextPageContext } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { parseCookies } from "nookies";
import { ReactElement, SyntheticEvent, useState } from "react";
import { ActionMeta } from "react-select";
import DateSelector from "../../../components/form/DateSelector";
import ErrorSummary from "../../../components/form/ErrorSummary";
import FormElementWrapper, { FormGroupWrapper } from "../../../components/form/FormElementWrapper";
import SearchSelect from "../../../components/form/SearchSelect";
import Select from "../../../components/form/Select";
import TextInput from "../../../components/form/TextInput";
import TimeSelector from "../../../components/form/TimeSelector";
import { BaseLayout } from "../../../components/layout/Layout";
import { COOKIES_SOCIAL_MEDIA_ERRORS } from "../../../constants";
import { getDisruptionById } from "../../../data/dynamo";
import { getHootsuiteAccountList } from "../../../data/hootsuite";
import { getNextdoorAccountList, getNextdoorAgencyBoundaries } from "../../../data/nextdoor";
import { getTwitterAccountList } from "../../../data/twitter";
import { PageState, ErrorInfo } from "../../../interfaces";
import { GroupId, GroupIds } from "../../../schemas/nextdoor.schema";
import { SocialMediaAccount } from "../../../schemas/social-media-accounts.schema";
import {
    CreateSocialMediaPostPage,
    HootsuitePost,
    SocialMediaPost,
    socialMediaPostSchema,
} from "../../../schemas/social-media.schema";
import { destroyCookieOnResponseObject, getPageState } from "../../../utils/apiUtils";
import { getSession } from "../../../utils/apiUtils/auth";
import { getStateUpdater, showCancelButton } from "../../../utils/formUtils";

const title = "Create social media message";
const description = "Create social media message page for the Create Transport Disruptions Service";

export interface CreateSocialMediaPostPageProps extends PageState<Partial<CreateSocialMediaPostPage>> {
    disruptionDescription: string;
    socialMediaPostIndex: number;
    csrfToken?: string;
    socialAccounts: SocialMediaAccount[];
    template?: string;
    operatorOrgId?: string;
    nextdoorAgencyBoundary?: GroupIds;
}

const CreateSocialMediaPost = (props: CreateSocialMediaPostPageProps): ReactElement => {
    const [pageState, setPageState] = useState<PageState<Partial<CreateSocialMediaPostPage>>>(props);
    const [errorsMessageContent, setErrorsMessageContent] = useState<ErrorInfo[]>(pageState.errors);
    const [searchInput, setSearchInput] = useState("");
    const [selected, setSelected] = useState<{ name: string; groupId: GroupId } | null>(null);

    const queryParams = useRouter().query;
    const displayCancelButton = showCancelButton(queryParams);

    const stateUpdater = getStateUpdater(setPageState, pageState);

    const accountType = props.socialAccounts?.find(
        (account) => account.id === pageState.inputs.socialAccount,
    )?.accountType;

    const removeGroupId = (e: SyntheticEvent, index: number) => {
        e.preventDefault();
        if (accountType === "Nextdoor" && pageState.inputs.groupIds) {
            const groupIds = [...pageState.inputs.groupIds];
            groupIds.splice(index, 1);
            setPageState({
                ...pageState,
                inputs: {
                    ...pageState.inputs,
                    groupIds,
                },
            });
        }
    };

    const getGroupIdRows = () => {
        if (accountType === "Nextdoor" && pageState.inputs.groupIds) {
            return pageState.inputs.groupIds.map((group, i) => {
                const groupValue = props.nextdoorAgencyBoundary?.find((g) => g.groupId === group.groupId);
                return {
                    cells: [
                        groupValue?.name || "",
                        <button
                            id={`remove-groupId-${groupValue?.groupId || ""}`}
                            key={`remove-groupId-${groupValue?.groupId || ""}`}
                            className="govuk-link"
                            onClick={(e) => removeGroupId(e, i)}
                        >
                            Remove
                        </button>,
                    ],
                };
            });
        }
        return [];
    };

    const addGroupId = (value: { name: string; groupId: GroupId }) => {
        if (accountType === "Nextdoor") {
            setPageState({
                ...pageState,
                inputs: {
                    ...pageState.inputs,
                    groupIds: [
                        ...(pageState.inputs.groupIds || []),
                        { name: value.name, groupId: Number(value.groupId) },
                    ],
                },
            });
        }
    };
    const handleChange = (
        value: { name: string; groupId: GroupId } | null,
        actionMeta: ActionMeta<{ name: GroupId; groupId: GroupId }>,
    ) => {
        if (actionMeta.action === "clear") {
            setSearchInput("");
        }

        if (value) {
            if (
                accountType === "Nextdoor" &&
                (!pageState.inputs.groupIds ||
                    !pageState.inputs.groupIds.some((data) => data.groupId === Number(value?.groupId)))
            ) {
                addGroupId(value);
            }
            setSelected(null);
        }
    };

    return (
        <BaseLayout title={title} description={description}>
            <form
                encType="multipart/form-data"
                action={`/api/create-social-media-post?_csrf=${props.csrfToken || ""}${
                    queryParams["template"] ? "&template=true" : ""
                }`}
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
                                <Select<Partial<HootsuitePost>>
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
                        {accountType !== "Nextdoor" && (
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

                        {accountType === "Nextdoor" && (
                            <SearchSelect<{ name: string; groupId: GroupId }>
                                closeMenuOnSelect={false}
                                selected={selected}
                                inputName="groupIds"
                                initialErrors={pageState.errors}
                                placeholder={"Select area boundaries"}
                                getOptionLabel={(value) => value.name}
                                handleChange={handleChange}
                                tableData={
                                    pageState.inputs.groupIds?.map((group) => ({
                                        name: group.name.toString(),
                                        groupId: group.groupId.toString(),
                                    })) || []
                                }
                                getRows={getGroupIdRows}
                                getOptionValue={(value) => value.groupId}
                                display="Area boundaries"
                                displaySize="l"
                                inputId="groupIds"
                                inputValue={searchInput}
                                setSearchInput={setSearchInput}
                                isClearable
                                options={
                                    props.nextdoorAgencyBoundary?.map((group) => ({
                                        name: group.name,
                                        groupId: group.groupId.toString(),
                                    })) || []
                                }
                            />
                        )}
                    </div>

                    {accountType === "Hootsuite" && !queryParams["template"] && (
                        <div className="govuk-form-group">
                            <h2 className="govuk-heading-l">Publish time and date</h2>

                            <DateSelector<Partial<HootsuitePost>>
                                display="Date"
                                hint={{ hidden: false, text: "Enter in format DD/MM/YYYY" }}
                                value={
                                    pageState.inputs.accountType === "Hootsuite"
                                        ? pageState.inputs.publishDate
                                        : undefined
                                }
                                disablePast={false}
                                inputName="publishDate"
                                stateUpdater={stateUpdater}
                                initialErrors={pageState.errors}
                            />

                            <TimeSelector<HootsuitePost>
                                display="Time"
                                hint="Enter the time in 24hr format. For example 0900 is 9am, 1730 is 5:30pm"
                                value={
                                    pageState.inputs.accountType === "Hootsuite"
                                        ? pageState.inputs.publishTime
                                        : undefined
                                }
                                inputName="publishTime"
                                stateUpdater={stateUpdater}
                                initialErrors={pageState.errors}
                            />
                        </div>
                    )}

                    <input type="hidden" name="disruptionId" value={pageState.disruptionId} />
                    <input type="hidden" name="socialMediaPostIndex" value={props.socialMediaPostIndex} />
                    <input type="hidden" name="createdByOperatorOrgId" value={props.operatorOrgId} />

                    <button className="govuk-button mt-8" data-module="govuk-button">
                        Save and continue
                    </button>
                    {displayCancelButton && pageState.disruptionId ? (
                        <Link
                            role="button"
                            href={`${queryParams["return"] as string}/${pageState.disruptionId}${
                                queryParams["template"] ? "?template=true" : ""
                            }`}
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
    const disruption = await getDisruptionById(disruptionId, session.orgId, !!ctx.query?.template);
    const socialMediaPost = disruption?.socialMediaPosts?.find((s) => s.socialMediaPostIndex === index);

    if (ctx.res) destroyCookieOnResponseObject(COOKIES_SOCIAL_MEDIA_ERRORS, ctx.res);

    const hootsuiteAccounts = await getHootsuiteAccountList(session.orgId, session.operatorOrgId ?? "");
    const twitterAccounts = await getTwitterAccountList(session.orgId, session.operatorOrgId ?? "");
    const nextdoorAccounts = await getNextdoorAccountList(session.orgId, session.operatorOrgId ?? "");
    const nextdoorAgencyBoundary = await getNextdoorAgencyBoundaries(session.orgId);
    return {
        props: {
            ...getPageState(errorCookie, socialMediaPostSchema, disruptionId, socialMediaPost || undefined),
            disruptionDescription: disruption?.description || "",
            socialMediaPostIndex: index,
            socialAccounts: [...hootsuiteAccounts, ...twitterAccounts, ...nextdoorAccounts],
            template: disruption?.template?.toString() || "",
            operatorOrgId: session.operatorOrgId ?? "",
            nextdoorAgencyBoundary: nextdoorAgencyBoundary || [],
        },
    };
};

export default CreateSocialMediaPost;
