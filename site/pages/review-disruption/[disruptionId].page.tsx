import startCase from "lodash/startCase";
import { NextPageContext } from "next";
import Link from "next/link";
import { parseCookies } from "nookies";
import { ReactElement, useEffect, useRef, useState } from "react";
import DeleteConfirmationPopup from "../../components/DeleteConfirmationPopup";
import ErrorSummary from "../../components/ErrorSummary";
import CsrfForm from "../../components/form/CsrfForm";
import Table from "../../components/form/Table";
import { BaseLayout } from "../../components/layout/Layout";
import ReviewConsequenceTable, { createChangeLink } from "../../components/ReviewConsequenceTable";
import {
    TYPE_OF_CONSEQUENCE_PAGE_PATH,
    COOKIES_REVIEW_DISRUPTION_ERRORS,
    REVIEW_DISRUPTION_PAGE_PATH,
    CREATE_SOCIAL_MEDIA_POST_PAGE_PATH,
    DASHBOARD_PAGE_PATH,
} from "../../constants";
import { getDisruptionById } from "../../data/dynamo";
import { getItem } from "../../data/s3";
import { ErrorInfo } from "../../interfaces";
import { Validity } from "../../schemas/create-disruption.schema";
import { Disruption } from "../../schemas/disruption.schema";
import { getLargestConsequenceIndex, splitCamelCaseToString } from "../../utils";
import { destroyCookieOnResponseObject } from "../../utils/apiUtils";
import { canPublish, getSession } from "../../utils/apiUtils/auth";
import { formatTime, getEndingOnDateText } from "../../utils/dates";

const title = "Review Disruption";
const description = "Review Disruption page for the Create Transport Disruptions Service";

interface ReviewDisruptionProps {
    disruption: Disruption;
    csrfToken?: string;
    errors: ErrorInfo[];
    canPublish: boolean;
}

const ReviewDisruption = ({ disruption, csrfToken, errors, canPublish }: ReviewDisruptionProps): ReactElement => {
    const hasInitialised = useRef(false);
    const [popUpState, setPopUpState] = useState<{ name: string; hiddenInputs: { name: string; value: string }[] }>();

    const deleteActionHandler = (name: string, hiddenInputs: { name: string; value: string }[]): void => {
        setPopUpState({ name, hiddenInputs });
    };

    const cancelActionHandler = (): void => {
        setPopUpState(undefined);
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
                    createChangeLink(`validity-period-${i + 1}`, "/create-disruption", disruption, undefined, true),
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

    return (
        <BaseLayout title={title} description={description}>
            {popUpState && csrfToken ? (
                <DeleteConfirmationPopup
                    entityName={`the ${popUpState.name}`}
                    deleteUrl={`/api/delete-${popUpState.name}`}
                    cancelActionHandler={cancelActionHandler}
                    hintText="This action is permanent and cannot be undone"
                    csrfToken={csrfToken}
                    hiddenInputs={popUpState.hiddenInputs}
                />
            ) : null}
            <CsrfForm action="/api/publish" method="post" csrfToken={csrfToken}>
                <>
                    <ErrorSummary errors={errors} />
                    <div className="govuk-form-group">
                        <h1 className="govuk-heading-xl">Review your answers before submitting the disruption</h1>
                        <Table
                            rows={[
                                {
                                    header: "Type of disruption",
                                    cells: [
                                        startCase(disruption.disruptionType),
                                        createChangeLink(
                                            "type-of-disruption",
                                            "/create-disruption",
                                            disruption,
                                            undefined,
                                            true,
                                        ),
                                    ],
                                },
                                {
                                    header: "Summary",
                                    cells: [
                                        disruption.summary,
                                        createChangeLink("summary", "/create-disruption", disruption, undefined, true),
                                    ],
                                },
                                {
                                    header: "Description",
                                    cells: [
                                        disruption.description,
                                        createChangeLink(
                                            "description",
                                            "/create-disruption",
                                            disruption,
                                            undefined,
                                            true,
                                        ),
                                    ],
                                },
                                {
                                    header: "Associated link",
                                    cells: [
                                        disruption.associatedLink || "N/A",
                                        createChangeLink(
                                            "associated-link",
                                            "/create-disruption",
                                            disruption,
                                            undefined,
                                            true,
                                        ),
                                    ],
                                },
                                {
                                    header: "Reason for disruption",
                                    cells: [
                                        splitCamelCaseToString(disruption.disruptionReason),
                                        createChangeLink(
                                            "disruption-reason",
                                            "/create-disruption",
                                            disruption,
                                            undefined,
                                            true,
                                        ),
                                    ],
                                },
                                ...getValidityRows(),
                                {
                                    header: "Publish start date",
                                    cells: [
                                        disruption.publishStartDate,
                                        createChangeLink(
                                            "publish-start-date",
                                            "/create-disruption",
                                            disruption,
                                            undefined,
                                            true,
                                        ),
                                    ],
                                },
                                {
                                    header: "Publish start time",
                                    cells: [
                                        formatTime(disruption.publishStartTime),
                                        createChangeLink(
                                            "publish-start-time",
                                            "/create-disruption",
                                            disruption,
                                            undefined,
                                            true,
                                        ),
                                    ],
                                },
                                {
                                    header: "Publish end date",
                                    cells: [
                                        disruption.publishEndDate || "N/A",
                                        createChangeLink(
                                            "publish-end-date",
                                            "/create-disruption",
                                            disruption,
                                            undefined,
                                            true,
                                        ),
                                    ],
                                },
                                {
                                    header: "Publish end time",
                                    cells: [
                                        disruption.publishEndTime ? formatTime(disruption.publishEndTime) : "N/A",
                                        ,
                                        createChangeLink(
                                            "publish-end-time",
                                            "/create-disruption",
                                            disruption,
                                            undefined,
                                            true,
                                        ),
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
                                                        ? `Operator wide - ${consequence.consequenceOperators.join(
                                                              ", ",
                                                          )}`
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
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Link
                            role="button"
                            href={{
                                pathname: `${TYPE_OF_CONSEQUENCE_PAGE_PATH}/${disruption.disruptionId}/${nextIndex}`,
                                query: { return: REVIEW_DISRUPTION_PAGE_PATH },
                            }}
                            className="govuk-button mt-2 govuk-button--secondary"
                        >
                            Add another consequence
                        </Link>

                        <br />
                        <h2 className="govuk-heading-l">Social media posts</h2>

                        <div className="govuk-accordion" data-module="govuk-accordion" id="accordion-default">
                            {disruption?.socialMediaPosts?.map((post, i) => (
                                <div key={`consequence-${i + 1}`} className="govuk-accordion__section">
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
                                        <Table
                                            rows={[
                                                {
                                                    header: "Message to appear",
                                                    cells: [
                                                        post.messageContent,
                                                        createChangeLink(
                                                            "message-to-appear",
                                                            CREATE_SOCIAL_MEDIA_POST_PAGE_PATH,
                                                            disruption,
                                                            nextIndexSocialMedia,
                                                        ),
                                                    ],
                                                },
                                                {
                                                    header: "Image",
                                                    cells: [
                                                        post.image ? (
                                                            <Link
                                                                className="govuk-link text-govBlue"
                                                                key={post.image.key}
                                                                href={post.image?.url ?? ""}
                                                            >
                                                                {post.image.key}
                                                            </Link>
                                                        ) : (
                                                            "No image uploaded"
                                                        ),
                                                        createChangeLink(
                                                            "hootsuite-profile",
                                                            CREATE_SOCIAL_MEDIA_POST_PAGE_PATH,
                                                            disruption,
                                                            nextIndexSocialMedia,
                                                        ),
                                                    ],
                                                },
                                                {
                                                    header: "Publish date",
                                                    cells: [
                                                        post.publishDate,
                                                        createChangeLink(
                                                            "publish-date",
                                                            CREATE_SOCIAL_MEDIA_POST_PAGE_PATH,
                                                            disruption,
                                                            nextIndexSocialMedia,
                                                        ),
                                                    ],
                                                },
                                                {
                                                    header: "Publish time",
                                                    cells: [
                                                        post.publishTime,
                                                        createChangeLink(
                                                            "publish-time",
                                                            CREATE_SOCIAL_MEDIA_POST_PAGE_PATH,
                                                            disruption,
                                                            nextIndexSocialMedia,
                                                        ),
                                                    ],
                                                },
                                                {
                                                    header: "Account name",
                                                    cells: [
                                                        post.socialAccount,
                                                        createChangeLink(
                                                            "account-to-publish",
                                                            CREATE_SOCIAL_MEDIA_POST_PAGE_PATH,
                                                            disruption,
                                                            nextIndexSocialMedia,
                                                        ),
                                                    ],
                                                },
                                                {
                                                    header: "HootSuite profile",
                                                    cells: [
                                                        post.hootsuiteProfile,
                                                        createChangeLink(
                                                            "hootsuite-profile",
                                                            CREATE_SOCIAL_MEDIA_POST_PAGE_PATH,
                                                            disruption,
                                                            nextIndexSocialMedia,
                                                        ),
                                                    ],
                                                },
                                                {
                                                    header: "Status",
                                                    cells: [post.status, ""],
                                                },
                                            ]}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Link
                            role="button"
                            href={`${CREATE_SOCIAL_MEDIA_POST_PAGE_PATH}/${disruption.disruptionId}/${nextIndexSocialMedia}`}
                            className="govuk-button mt-2 govuk-button--secondary"
                            aria-disabled={disruption.socialMediaPosts && disruption.socialMediaPosts.length === 5}
                        >
                            {disruption.socialMediaPosts && disruption.socialMediaPosts.length > 0
                                ? "Add another social media post"
                                : "Add a social media post"}
                        </Link>
                        <br />

                        <input type="hidden" name="disruptionId" value={disruption.disruptionId} />

                        <button className="govuk-button mt-8" data-module="govuk-button">
                            {canPublish ? "Publish disruption" : "Send to review"}
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
                            Delete disruption
                        </button>
                        <Link
                            className="govuk-button mt-8 ml-5 govuk-button--secondary"
                            data-module="govuk-button"
                            href={DASHBOARD_PAGE_PATH}
                        >
                            Save as draft
                        </Link>
                    </div>
                </>
            </CsrfForm>
        </BaseLayout>
    );
};

export const getServerSideProps = async (ctx: NextPageContext): Promise<{ props: ReviewDisruptionProps } | void> => {
    if (!ctx.req) {
        throw new Error("No context request");
    }

    const session = getSession(ctx.req);

    if (!session) {
        throw new Error("No session found");
    }

    const disruption = await getDisruptionById(ctx.query.disruptionId?.toString() ?? "", session.orgId);
    const cookies = parseCookies(ctx);
    const errorCookie = cookies[COOKIES_REVIEW_DISRUPTION_ERRORS];

    let socialMediaWithImageLinks = [];
    if (disruption?.socialMediaPosts && process.env.IMAGE_BUCKET_NAME) {
        socialMediaWithImageLinks = await Promise.all(
            disruption.socialMediaPosts.map(async (s) => {
                if (s.image) {
                    const url = (await getItem(process.env.IMAGE_BUCKET_NAME || "", s.image?.key)) || "";
                    // console.log("urlll", url);
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
        errors = JSON.parse(errorCookie) as ErrorInfo[];
    }

    if (!disruption) {
        throw new Error("Disruption not found for review page");
    }

    if (ctx.res) destroyCookieOnResponseObject(COOKIES_REVIEW_DISRUPTION_ERRORS, ctx.res);

    return {
        props: {
            disruption: disruptionWithURLS,
            errors,
            canPublish: canPublish(session),
        },
    };
};

export default ReviewDisruption;
