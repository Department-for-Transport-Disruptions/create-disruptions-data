import { Validity } from "@create-disruptions-data/shared-ts/disruptionTypes";
import { MAX_CONSEQUENCES } from "@create-disruptions-data/shared-ts/disruptionTypes.zod";
import { PublishStatus, SocialMediaPostStatus } from "@create-disruptions-data/shared-ts/enums";
import startCase from "lodash/startCase";
import { NextPageContext, Redirect } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { parseCookies } from "nookies";
import { ReactElement, ReactNode, useEffect, useRef, useState } from "react";
import CsrfForm from "../../components/form/CsrfForm";
import ErrorSummary from "../../components/form/ErrorSummary";
import Table, { CellProps } from "../../components/form/Table";
import { BaseLayout } from "../../components/layout/Layout";
import NotificationBanner from "../../components/layout/NotificationBanner";
import DeleteConfirmationPopup from "../../components/popup/DeleteConfirmationPopup";

import ReviewConsequenceTable, { createChangeLink } from "../../components/ReviewConsequenceTable";
import {
    TYPE_OF_CONSEQUENCE_PAGE_PATH,
    COOKIES_REVIEW_DISRUPTION_ERRORS,
    REVIEW_DISRUPTION_PAGE_PATH,
    CREATE_SOCIAL_MEDIA_POST_PAGE_PATH,
    DASHBOARD_PAGE_PATH,
    COOKIES_REVIEW_DISRUPTION_REFERER,
    DISRUPTION_NOT_FOUND_ERROR_PAGE,
    DISRUPTION_DETAIL_PAGE_PATH,
} from "../../constants";
import { getDisruptionById } from "../../data/dynamo";
import { getItem } from "../../data/s3";
import { ErrorInfo, PageState } from "../../interfaces";
import { FullDisruption } from "../../schemas/disruption.schema";
import { SocialMediaPost, SocialMediaPostTransformed } from "../../schemas/social-media.schema";
import { getLargestConsequenceIndex, splitCamelCaseToString } from "../../utils";
import { destroyCookieOnResponseObject, setCookieOnResponseObject } from "../../utils/apiUtils";
import { canPublish, getSession } from "../../utils/apiUtils/auth";
import { formatTime, getEndingOnDateText } from "../../utils/dates";

const title = "Review Disruption";
const description = "Review Disruption page for the Create Transport Disruptions Service";

interface ReviewDisruptionProps {
    disruption: FullDisruption;
    csrfToken?: string;
    errors: ErrorInfo[];
    canPublish: boolean;
    redirect: string;
    operatorOrgId?: string;
    isOperatorUser?: boolean;
}

const ReviewDisruption = ({
    disruption,
    csrfToken,
    errors,
    canPublish,
    redirect,
    operatorOrgId,
    isOperatorUser,
}: ReviewDisruptionProps): ReactElement => {
    const hasInitialised = useRef(false);
    const [popUpState, setPopUpState] = useState<{ name: string; hiddenInputs: { name: string; value: string }[] }>();
    const [socialMediaPostPopUpState, setSocialMediaPostPopUpState] = useState<{
        name: string;
        hiddenInputs: { name: string; value: string }[];
    }>();

    const queryParams = useRouter().query;

    const isEditingAllowed = operatorOrgId
        ? disruption.createdByOperatorOrgId === operatorOrgId
        : !(disruption.createdByOperatorOrgId && !isOperatorUser);

    const getSocialMediaRows = (post: SocialMediaPostTransformed) => {
        const isPendingOrRejected =
            post.status === SocialMediaPostStatus.pending || post.status === SocialMediaPostStatus.rejected;
        const socialMediaTableRows: { header?: string | ReactNode; cells: CellProps[] }[] = [
            {
                header: "Message to appear",
                cells: [
                    {
                        value: post.messageContent,
                    },
                    {
                        value:
                            isPendingOrRejected && isEditingAllowed
                                ? createChangeLink(
                                      "message-to-appear",
                                      CREATE_SOCIAL_MEDIA_POST_PAGE_PATH,
                                      disruption.disruptionId,
                                      post.socialMediaPostIndex,
                                      true,
                                      false,
                                      disruption.template,
                                  )
                                : "",
                        styles: {
                            width: "w-1/10",
                        },
                    },
                ],
            },
            {
                header: "Image",
                cells: [
                    {
                        value:
                            post.accountType === "Hootsuite" && post.image ? (
                                <Link
                                    className="govuk-link text-govBlue"
                                    key={post.image.key}
                                    href={post.image?.url ?? ""}
                                >
                                    {post.image.originalFilename}
                                </Link>
                            ) : (
                                "No image uploaded"
                            ),
                    },
                    {
                        value:
                            isPendingOrRejected && isEditingAllowed
                                ? createChangeLink(
                                      "hootsuite-profile",
                                      CREATE_SOCIAL_MEDIA_POST_PAGE_PATH,
                                      disruption.disruptionId,
                                      post.socialMediaPostIndex,
                                      true,
                                      false,
                                      disruption.template,
                                  )
                                : "",
                    },
                ],
            },
            {
                header: "Publish date",
                cells: [
                    {
                        value: post.accountType === "Hootsuite" && post.publishDate ? post.publishDate : "N/A",
                    },
                    {
                        value:
                            isPendingOrRejected && isEditingAllowed
                                ? createChangeLink(
                                      "publish-date",
                                      CREATE_SOCIAL_MEDIA_POST_PAGE_PATH,
                                      disruption.disruptionId,
                                      post.socialMediaPostIndex,
                                      true,
                                      false,
                                      disruption.template,
                                  )
                                : "",
                    },
                ],
            },
            {
                header: "Publish time",
                cells: [
                    {
                        value: post.accountType === "Hootsuite" && post.publishTime ? post.publishTime : "N/A",
                    },
                    {
                        value:
                            isPendingOrRejected && isEditingAllowed
                                ? createChangeLink(
                                      "publish-time",
                                      CREATE_SOCIAL_MEDIA_POST_PAGE_PATH,
                                      disruption.disruptionId,
                                      post.socialMediaPostIndex,
                                      true,
                                      false,
                                      disruption.template,
                                  )
                                : "",
                    },
                ],
            },
            {
                header: "Account name",
                cells: [
                    {
                        value:
                            post.display && post.accountType
                                ? `${post.display} (${post.accountType})`
                                : post.socialAccount,
                    },
                    {
                        value:
                            isPendingOrRejected && isEditingAllowed
                                ? createChangeLink(
                                      "account-to-publish",
                                      CREATE_SOCIAL_MEDIA_POST_PAGE_PATH,
                                      disruption.disruptionId,
                                      post.socialMediaPostIndex,
                                      true,
                                      false,
                                      disruption.template,
                                  )
                                : "",
                    },
                ],
            },
            {
                header: "HootSuite profile",
                cells: [
                    {
                        value: post.accountType === "Hootsuite" ? post.hootsuiteProfile : "N/A",
                    },
                    {
                        value:
                            isPendingOrRejected && isEditingAllowed
                                ? createChangeLink(
                                      "hootsuite-profile",
                                      CREATE_SOCIAL_MEDIA_POST_PAGE_PATH,
                                      disruption.disruptionId,
                                      post.socialMediaPostIndex,
                                      true,
                                      false,
                                      disruption.template,
                                  )
                                : "",
                    },
                ],
            },
            {
                header: "Status",
                cells: [
                    {
                        value: disruption.template ? "N/A" : post.status,
                    },
                    {
                        value: "",
                    },
                ],
            },
        ];

        return socialMediaTableRows;
    };

    const hiddenInputs = (index: number) => [
        {
            name: "id",
            value: index.toString(),
        },
        {
            name: "disruptionId",
            value: disruption.disruptionId,
        },
    ];

    const deleteActionHandler = (name: string, hiddenInputs: { name: string; value: string }[]): void => {
        setPopUpState({ name, hiddenInputs });
    };

    const deleteActionHandlerSocialMediaPost = (
        name: string,
        hiddenInputs: { name: string; value: string }[],
    ): void => {
        setSocialMediaPostPopUpState({ name, hiddenInputs });
    };

    const cancelActionHandler = (): void => {
        setPopUpState(undefined);
    };

    const cancelActionHandlerSocialMediaPost = (): void => {
        setSocialMediaPostPopUpState(undefined);
    };

    useEffect(() => {
        if (window.GOVUKFrontend && !hasInitialised.current) {
            window.GOVUKFrontend.initAll();
        }

        hasInitialised.current = true;
    });

    const getValidityRows = () => {
        const validity: Validity[] = [
            ...(disruption.validity ?? []),
            {
                disruptionStartDate: disruption.disruptionStartDate,
                disruptionStartTime: disruption.disruptionStartTime,
                disruptionEndDate: disruption.disruptionEndDate,
                disruptionEndTime: disruption.disruptionEndTime,
                disruptionRepeats: disruption.disruptionRepeats,
                disruptionRepeatsEndDate: disruption.disruptionRepeatsEndDate,
            },
        ];

        return validity.map((validity, i) => {
            const appendValue =
                validity.disruptionRepeats === "daily" ? (
                    <>
                        <br />
                        Repeats {validity.disruptionRepeats} until {validity.disruptionRepeatsEndDate} at{" "}
                        {validity.disruptionEndTime}
                    </>
                ) : validity.disruptionRepeats === "weekly" ? (
                    <>
                        <br />
                        Repeats every week until{" "}
                        {getEndingOnDateText(
                            validity.disruptionRepeats,
                            validity.disruptionRepeatsEndDate,
                            validity.disruptionStartDate,
                            validity.disruptionEndDate,
                        )}{" "}
                        at {validity.disruptionEndTime}
                    </>
                ) : (
                    <></>
                );
            return {
                header: `Validity period ${i + 1}`,
                cells: [
                    validity.disruptionEndDate && validity.disruptionEndTime && !validity.disruptionNoEndDateTime ? (
                        <span>
                            {validity.disruptionStartDate} {validity.disruptionStartTime} - {validity.disruptionEndDate}{" "}
                            {validity.disruptionEndTime} {appendValue}
                        </span>
                    ) : (
                        `${validity.disruptionStartDate} ${validity.disruptionStartTime} - No end date/time`
                    ),
                    isEditingAllowed
                        ? createChangeLink(
                              `validity-period-${i + 1}`,
                              "/create-disruption",
                              disruption.disruptionId,
                              undefined,
                              true,
                              false,
                              disruption.template,
                          )
                        : "",
                    false,
                    disruption.template,
                    ,
                ],
            };
        });
    };

    const nextIndex = getLargestConsequenceIndex(disruption) + 1;

    const nextIndexSocialMedia =
        disruption.socialMediaPosts && disruption.socialMediaPosts.length > 0
            ? disruption.socialMediaPosts?.reduce((p, s) => (p.socialMediaPostIndex > s.socialMediaPostIndex ? p : s))
                  .socialMediaPostIndex + 1
            : 0;

    const deleteUrl = (popUpStateName: string) =>
        popUpStateName === "consequence" ? "/api/delete-consequence" : "/api/delete-disruption";

    return (
        <BaseLayout title={title} description={description}>
            {queryParams["duplicate"] ? (
                <NotificationBanner content="You have successfully duplicated the disruption. The new disruption has been created below." />
            ) : null}
            {popUpState && csrfToken ? (
                <DeleteConfirmationPopup
                    entityName={`the ${popUpState.name}`}
                    deleteUrl={`${deleteUrl(popUpState.name)}${disruption.template ? "?template=true" : ""}`}
                    cancelActionHandler={cancelActionHandler}
                    hintText="This action is permanent and cannot be undone"
                    csrfToken={csrfToken}
                    hiddenInputs={popUpState.hiddenInputs}
                />
            ) : null}
            {socialMediaPostPopUpState && csrfToken ? (
                <DeleteConfirmationPopup
                    entityName={`the ${socialMediaPostPopUpState.name}`}
                    deleteUrl={`/api/delete-${socialMediaPostPopUpState.name}${
                        disruption.template ? "?template=true" : ""
                    }`}
                    cancelActionHandler={cancelActionHandlerSocialMediaPost}
                    hintText="This action is permanent and cannot be undone"
                    csrfToken={csrfToken}
                    hiddenInputs={socialMediaPostPopUpState.hiddenInputs}
                />
            ) : null}

            <CsrfForm
                action={`/api/publish${queryParams["template"] ? "?template=true" : ""}`}
                method="post"
                csrfToken={csrfToken}
            >
                <>
                    <ErrorSummary errors={errors} />
                    <div className="govuk-form-group">
                        <h1 className="govuk-heading-xl">{`Review your answers before submitting the ${
                            disruption.template ? "template" : "disruption"
                        }`}</h1>
                        <Table
                            rows={[
                                {
                                    header: "ID",
                                    cells: [
                                        {
                                            value: disruption.displayId,
                                        },
                                        {
                                            value: "",
                                        },
                                    ],
                                },
                                {
                                    header: "Type of disruption",
                                    cells: [
                                        {
                                            value: startCase(disruption.disruptionType),
                                        },
                                        {
                                            value: isEditingAllowed
                                                ? createChangeLink(
                                                      "type-of-disruption",
                                                      "/create-disruption",
                                                      disruption.disruptionId,
                                                      undefined,
                                                      true,
                                                      false,
                                                      disruption.template,
                                                  )
                                                : "",
                                            styles: {
                                                width: "w-1/10",
                                            },
                                        },
                                    ],
                                },
                                {
                                    header: "Summary",
                                    cells: [
                                        {
                                            value: disruption.summary,
                                        },
                                        {
                                            value: isEditingAllowed
                                                ? createChangeLink(
                                                      "summary",
                                                      "/create-disruption",
                                                      disruption.disruptionId,
                                                      undefined,
                                                      true,
                                                      false,
                                                      disruption.template,
                                                  )
                                                : "",
                                        },
                                    ],
                                },
                                {
                                    header: "Description",
                                    cells: [
                                        {
                                            value: disruption.description,
                                        },
                                        {
                                            value: isEditingAllowed
                                                ? createChangeLink(
                                                      "description",
                                                      "/create-disruption",
                                                      disruption.disruptionId,
                                                      undefined,
                                                      true,
                                                      false,
                                                      disruption.template,
                                                  )
                                                : "",
                                        },
                                    ],
                                },
                                {
                                    header: "Associated link",
                                    cells: [
                                        {
                                            value: disruption.associatedLink || "N/A",
                                        },
                                        {
                                            value: isEditingAllowed
                                                ? createChangeLink(
                                                      "associated-link",
                                                      "/create-disruption",
                                                      disruption.disruptionId,
                                                      undefined,
                                                      true,
                                                      false,
                                                      disruption.template,
                                                  )
                                                : "",
                                        },
                                    ],
                                },
                                {
                                    header: "Reason for disruption",
                                    cells: [
                                        {
                                            value: splitCamelCaseToString(disruption.disruptionReason),
                                        },
                                        {
                                            value: isEditingAllowed
                                                ? createChangeLink(
                                                      "disruption-reason",
                                                      "/create-disruption",
                                                      disruption.disruptionId,
                                                      undefined,
                                                      true,
                                                      false,
                                                      disruption.template,
                                                  )
                                                : "",
                                        },
                                    ],
                                },
                                ...getValidityRows(),
                                {
                                    header: "Publish start date",
                                    cells: [
                                        {
                                            value: disruption.publishStartDate,
                                        },
                                        {
                                            value: isEditingAllowed
                                                ? createChangeLink(
                                                      "publish-start-date",
                                                      "/create-disruption",
                                                      disruption.disruptionId,
                                                      undefined,
                                                      true,
                                                      false,
                                                      disruption.template,
                                                  )
                                                : "",
                                        },
                                    ],
                                },
                                {
                                    header: "Publish start time",
                                    cells: [
                                        {
                                            value: formatTime(disruption.publishStartTime),
                                        },
                                        {
                                            value: isEditingAllowed
                                                ? createChangeLink(
                                                      "publish-start-time",
                                                      "/create-disruption",
                                                      disruption.disruptionId,
                                                      undefined,
                                                      true,
                                                      false,
                                                      disruption.template,
                                                  )
                                                : "",
                                        },
                                    ],
                                },
                                {
                                    header: "Publish end date",
                                    cells: [
                                        {
                                            value: disruption.publishEndDate || "N/A",
                                        },
                                        {
                                            value: isEditingAllowed
                                                ? createChangeLink(
                                                      "publish-end-date",
                                                      "/create-disruption",
                                                      disruption.disruptionId,
                                                      undefined,
                                                      true,
                                                      false,
                                                      disruption.template,
                                                  )
                                                : "",
                                        },
                                    ],
                                },
                                {
                                    header: "Publish end time",
                                    cells: [
                                        {
                                            value: disruption.publishEndTime
                                                ? formatTime(disruption.publishEndTime)
                                                : "N/A",
                                        },
                                        {
                                            value: isEditingAllowed
                                                ? createChangeLink(
                                                      "publish-end-time",
                                                      "/create-disruption",
                                                      disruption.disruptionId,
                                                      undefined,
                                                      true,
                                                      false,
                                                      disruption.template,
                                                  )
                                                : "",
                                        },
                                    ],
                                },
                            ]}
                        />
                        <h2 className="govuk-heading-l">Consequences</h2>

                        <div className="govuk-accordion" data-module="govuk-accordion" id="accordion-default">
                            {disruption.consequences?.map((consequence, i) => (
                                <div key={`consequence-${i + 1}`} className="govuk-accordion__section">
                                    <div className="govuk-accordion__section-header">
                                        <h2 className="govuk-accordion__section-heading">
                                            <span
                                                className="govuk-accordion__section-button"
                                                id={`accordion-default-heading-${i + 1}`}
                                            >
                                                {`Consequence ${i + 1} - ${splitCamelCaseToString(
                                                    consequence.vehicleMode,
                                                )} - ${
                                                    consequence.consequenceType === "services"
                                                        ? `Services - ${consequence.services
                                                              .map((service) => service.lineName)
                                                              .join(", ")}`
                                                        : consequence.consequenceType === "stops"
                                                        ? "Stops"
                                                        : consequence.consequenceType === "operatorWide" &&
                                                          consequence.consequenceOperators
                                                        ? `Operator wide - ${consequence.consequenceOperators
                                                              .map((operator) => operator.operatorNoc)
                                                              .join(", ")}`
                                                        : `${"Network wide"}`
                                                }`}
                                            </span>
                                        </h2>
                                    </div>
                                    <div
                                        id={`accordion-default-content-${i + 1}`}
                                        className="govuk-accordion__section-content"
                                        aria-labelledby={`accordion-default-heading-${i + 1}`}
                                    >
                                        <ReviewConsequenceTable
                                            consequence={consequence}
                                            disruption={disruption}
                                            deleteActionHandler={deleteActionHandler}
                                            isTemplate={disruption.template}
                                            isEditingAllowed={isEditingAllowed}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Link
                            href={{
                                pathname: `${TYPE_OF_CONSEQUENCE_PAGE_PATH}/${disruption.disruptionId}/${nextIndex}`,
                                query: {
                                    return: REVIEW_DISRUPTION_PAGE_PATH,
                                    ...(disruption.template ? { template: disruption.template?.toString() } : {}),
                                },
                            }}
                            className={`govuk-button mt-2 govuk-button--secondary ${
                                disruption.consequences && disruption.consequences.length >= MAX_CONSEQUENCES
                                    ? "pointer-events-none govuk-button--disabled"
                                    : ""
                            }`}
                        >
                            {disruption.consequences?.length === 0 ? "Add a consequence" : "Add another consequence"}
                        </Link>

                        <br />
                        <h2 className="govuk-heading-l">Social media posts</h2>

                        <div className="govuk-accordion" data-module="govuk-accordion" id="accordion-default">
                            {disruption?.socialMediaPosts?.map((post, i) => (
                                <div key={`social-media-post-${i + 1}`} className="govuk-accordion__section">
                                    <div className="govuk-accordion__section-header">
                                        <h2 className="govuk-accordion__section-heading">
                                            <span
                                                className="govuk-accordion__section-button"
                                                id={`accordion-default-heading-${i + 1}`}
                                            >
                                                {`Social media post ${i + 1}`}
                                            </span>
                                        </h2>
                                    </div>
                                    <div
                                        id={`accordion-default-content-${i + 1}`}
                                        className="govuk-accordion__section-content"
                                        aria-labelledby={`accordion-default-heading-${i + 1}`}
                                    >
                                        <Table rows={getSocialMediaRows(post)} />
                                        {(post.status === SocialMediaPostStatus.pending ||
                                            post.status === SocialMediaPostStatus.rejected) &&
                                        isEditingAllowed ? (
                                            <button
                                                key={post.socialMediaPostIndex}
                                                className="govuk-button govuk-button--warning mt-4"
                                                data-module="govuk-button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    deleteActionHandlerSocialMediaPost(
                                                        "post",
                                                        hiddenInputs(post.socialMediaPostIndex),
                                                    );
                                                }}
                                            >
                                                Remove post
                                            </button>
                                        ) : null}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Link
                            className={`govuk-button mt-2 govuk-button--secondary ${
                                disruption.socialMediaPosts && disruption.socialMediaPosts.length >= 5
                                    ? "pointer-events-none govuk-button--disabled"
                                    : ""
                            }`}
                            href={{
                                pathname: `${CREATE_SOCIAL_MEDIA_POST_PAGE_PATH}/${disruption.disruptionId}/${nextIndexSocialMedia}`,
                                query: {
                                    return: REVIEW_DISRUPTION_PAGE_PATH,
                                    ...(disruption.template ? { template: disruption.template?.toString() } : {}),
                                },
                            }}
                        >
                            {disruption.socialMediaPosts && disruption.socialMediaPosts.length > 0
                                ? "Add another social media post"
                                : "Add a social media post"}
                        </Link>

                        <br />

                        <input type="hidden" name="disruptionId" value={disruption.disruptionId} />

                        {isEditingAllowed ? (
                            <>
                                <button className="govuk-button mt-8" data-module="govuk-button">
                                    {canPublish || disruption.template
                                        ? disruption.template
                                            ? "Create template"
                                            : "Publish disruption"
                                        : "Send to review"}
                                </button>
                                <button
                                    className="govuk-button govuk-button--warning ml-5 mt-8"
                                    data-module="govuk-button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        deleteActionHandler("disruption", [
                                            {
                                                name: "id",
                                                value: disruption.disruptionId,
                                            },
                                        ]);
                                    }}
                                >
                                    {disruption.template ? "Delete template" : "Delete disruption"}
                                </button>{" "}
                            </>
                        ) : (
                            <Link
                                role="button"
                                href={DASHBOARD_PAGE_PATH}
                                className={`govuk-button mt-8 ${
                                    canPublish && disruption.publishStatus !== PublishStatus.published
                                        ? "govuk-button--secondary mr-5"
                                        : ""
                                }`}
                            >
                                Close and Return
                            </Link>
                        )}
                        {!disruption.template && isEditingAllowed && (
                            <Link
                                className="govuk-button mt-8 ml-5 govuk-button--secondary"
                                data-module="govuk-button"
                                href={DASHBOARD_PAGE_PATH}
                            >
                                Save as draft
                            </Link>
                        )}

                        {(disruption.publishStatus === PublishStatus.editing ||
                            disruption.publishStatus === PublishStatus.pendingAndEditing) &&
                        isEditingAllowed ? (
                            <button
                                className="govuk-button govuk-button--secondary mt-8 ml-5"
                                data-module="govuk-button"
                                formAction={redirect}
                            >
                                Cancel all changes
                            </button>
                        ) : null}
                    </div>
                </>
            </CsrfForm>
        </BaseLayout>
    );
};

export const getServerSideProps = async (
    ctx: NextPageContext,
): Promise<{ props: ReviewDisruptionProps } | { redirect: Redirect } | void> => {
    if (!ctx.req) {
        throw new Error("No context request");
    }

    const session = getSession(ctx.req);

    if (!session) {
        throw new Error("No session found");
    }

    const disruption = await getDisruptionById(
        ctx.query.disruptionId?.toString() ?? "",
        session.orgId,
        !!ctx.query?.template,
    );

    if (!disruption) {
        return {
            redirect: {
                destination: `${DISRUPTION_NOT_FOUND_ERROR_PAGE}${!!ctx.query?.template ? "?template=true" : ""}`,
                statusCode: 302,
            },
        };
    }

    if (disruption.publishStatus !== PublishStatus.draft) {
        return {
            redirect: {
                destination: `${DISRUPTION_DETAIL_PAGE_PATH}/${disruption.disruptionId}`,
                statusCode: 302,
            },
        };
    }

    const cookies = parseCookies(ctx);
    const errorCookie = cookies[COOKIES_REVIEW_DISRUPTION_ERRORS];

    const referer = (ctx.query.return as string) || cookies[COOKIES_REVIEW_DISRUPTION_REFERER];

    if (ctx.res && ctx.query.return) {
        setCookieOnResponseObject(COOKIES_REVIEW_DISRUPTION_REFERER, referer, ctx.res);
    }

    let socialMediaWithImageLinks: SocialMediaPost[] = [];
    if (disruption?.socialMediaPosts && process.env.IMAGE_BUCKET_NAME) {
        socialMediaWithImageLinks = await Promise.all(
            disruption.socialMediaPosts.map(async (s) => {
                if (s.accountType === "Hootsuite" && s.image) {
                    const url =
                        (await getItem(process.env.IMAGE_BUCKET_NAME || "", s.image?.key, s.image?.originalFilename)) ||
                        "";
                    return {
                        ...s,
                        image: {
                            ...s.image,
                            url,
                        },
                    };
                }
                return s;
            }),
        );
    }

    const disruptionWithURLS = {
        ...disruption,
        ...(socialMediaWithImageLinks.length > 0 ? { socialMediaPosts: socialMediaWithImageLinks } : {}),
    };

    let errors: ErrorInfo[] = [];
    if (errorCookie) {
        errors = (JSON.parse(errorCookie) as PageState<ReviewDisruptionProps>).errors;
    }

    if (ctx.res) destroyCookieOnResponseObject(COOKIES_REVIEW_DISRUPTION_ERRORS, ctx.res);

    return {
        props: {
            disruption: disruptionWithURLS as FullDisruption,
            redirect: referer || "/dashboard",
            errors,
            canPublish: canPublish(session),
            operatorOrgId: session.operatorOrgId || "",
            isOperatorUser: session.isOperatorUser,
        },
    };
};

export default ReviewDisruption;
