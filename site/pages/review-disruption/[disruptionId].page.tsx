import startCase from "lodash/startCase";
import { NextPageContext } from "next";
import Link from "next/link";
import { ReactElement, useEffect, useRef, useState } from "react";
import DeleteConfirmationPopup from "../../components/DeleteConfirmationPopup";
import CsrfForm from "../../components/form/CsrfForm";
import Table from "../../components/form/Table";
import { BaseLayout } from "../../components/layout/Layout";
import {
    TYPE_OF_CONSEQUENCE_PAGE_PATH,
    CONSEQUENCE_TYPES,
    VEHICLE_MODES,
    REVIEW_DISRUPTION_PAGE_PATH,
} from "../../constants";
import { getDisruptionById } from "../../data/dynamo";
import { SocialMediaPost } from "../../interfaces";
import { Consequence } from "../../schemas/consequence.schema";
import { Validity } from "../../schemas/create-disruption.schema";
import { Disruption } from "../../schemas/disruption.schema";
import { getDisplayByValue, splitCamelCaseToString } from "../../utils";
import { formatTime } from "../../utils/dates";

const title = "Review Disruption";
const description = "Review Disruption page for the Create Transport Disruptions Service";

interface ReviewDisruptionProps {
    disruption: Disruption;
    previousSocialMediaPosts: SocialMediaPost[];
    csrfToken?: string;
}

const getConsequenceUrl = (type: Consequence["consequenceType"]) => {
    switch (type) {
        case "networkWide":
            return "/create-consequence-network";
        case "operatorWide":
            return "/create-consequence-operator";
        case "stops":
            return "/create-consequence-stops";
        case "services":
            return "/create-consequence-services";
    }
};

const ReviewDisruption = ({ disruption, previousSocialMediaPosts, csrfToken }: ReviewDisruptionProps): ReactElement => {
    const hasInitialised = useRef(false);
    const [popUpState, setPopUpState] = useState<{ disruptionName: string; disruptionId: string }>();

    const deleteActionHandler = (id: string, name: string): void => {
        setPopUpState({ disruptionId: id, disruptionName: name });
    };

    const cancelActionHandler = (): void => {
        setPopUpState(undefined);
    };

    const buildDeleteUrl = (idToDelete: string, csrfToken: string): string => {
        return `/api/delete-disruption?id=${idToDelete}&_csrf=${csrfToken}`;
    };

    useEffect(() => {
        if (window.GOVUKFrontend && !hasInitialised.current) {
            window.GOVUKFrontend.initAll();
        }

        hasInitialised.current = true;
    });

    const createChangeLink = (key: string, href: string, index?: number, includePreviousPage?: boolean) => (
        <Link
            key={key}
            className="govuk-link"
            href={{
                pathname: `${href}/${disruption.disruptionId}${index !== undefined ? `/${index}` : ""}`,
                query: includePreviousPage ? { return: REVIEW_DISRUPTION_PAGE_PATH } : null,
            }}
        >
            Change
        </Link>
    );

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
                        Repeats {validity.disruptionRepeats} until {validity.disruptionRepeatsEndDate}
                    </>
                ) : validity.disruptionRepeats === "weekly" ? (
                    <>
                        <br />
                        Repeats every week until {validity.disruptionRepeatsEndDate}
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
                    createChangeLink(`validity-period-${i + 1}`, "/create-disruption", undefined, true),
                ],
            };
        });
    };

    return (
        <BaseLayout title={title} description={description}>
            <CsrfForm action="/api/publish" method="post" csrfToken={csrfToken}>
                <>
                    <div className="govuk-form-group">
                        <h1 className="govuk-heading-xl">Review your answers before submitting the disruption</h1>
                        <Table
                            rows={[
                                {
                                    header: "Type of disruption",
                                    cells: [
                                        startCase(disruption.disruptionType),
                                        createChangeLink("type-of-disruption", "/create-disruption", undefined, true),
                                    ],
                                },
                                {
                                    header: "Summary",
                                    cells: [
                                        disruption.summary,
                                        createChangeLink("summary", "/create-disruption", undefined, true),
                                    ],
                                },
                                {
                                    header: "Description",
                                    cells: [
                                        disruption.description,
                                        createChangeLink("description", "/create-disruption", undefined, true),
                                    ],
                                },
                                {
                                    header: "Associated link",
                                    cells: [
                                        disruption.associatedLink || "N/A",
                                        createChangeLink("associated-link", "/create-disruption", undefined, true),
                                    ],
                                },
                                {
                                    header: "Reason for disruption",
                                    cells: [
                                        splitCamelCaseToString(disruption.disruptionReason),
                                        createChangeLink("disruption-reason", "/create-disruption", undefined, true),
                                    ],
                                },
                                ...getValidityRows(),
                                {
                                    header: "Publish start date",
                                    cells: [
                                        disruption.publishStartDate,
                                        createChangeLink("publish-start-date", "/create-disruption", undefined, true),
                                    ],
                                },
                                {
                                    header: "Publish start time",
                                    cells: [
                                        formatTime(disruption.publishStartTime),
                                        createChangeLink("publish-start-time", "/create-disruption", undefined, true),
                                    ],
                                },
                                {
                                    header: "Publish end date",
                                    cells: [
                                        disruption.publishEndDate || "N/A",
                                        createChangeLink("publish-end-date", "/create-disruption", undefined, true),
                                    ],
                                },
                                {
                                    header: "Publish end time",
                                    cells: [
                                        disruption.publishEndTime ? formatTime(disruption.publishEndTime) : "N/A",
                                        ,
                                        createChangeLink("publish-end-time", "/create-disruption", undefined, true),
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
                                                        : consequence.consequenceType === "operatorWide" &&
                                                          consequence.consequenceOperator
                                                        ? `Operator wide - ${consequence.consequenceOperator}`
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
                                        <Table
                                            rows={[
                                                {
                                                    header: "Consequence type",
                                                    cells: [
                                                        getDisplayByValue(
                                                            CONSEQUENCE_TYPES,
                                                            consequence.consequenceType,
                                                        ),
                                                        createChangeLink(
                                                            "consequence-type",
                                                            TYPE_OF_CONSEQUENCE_PAGE_PATH,
                                                            i,
                                                            true,
                                                        ),
                                                    ],
                                                },
                                                {
                                                    header: "Mode of transport",
                                                    cells: [
                                                        getDisplayByValue(VEHICLE_MODES, consequence.vehicleMode),
                                                        createChangeLink(
                                                            "vehicle-mode",
                                                            getConsequenceUrl(consequence.consequenceType),
                                                            i,
                                                            true,
                                                        ),
                                                    ],
                                                },
                                                {
                                                    header: "Service(s)",
                                                    cells: [
                                                        consequence.consequenceType === "services"
                                                            ? consequence.services
                                                                  .map(
                                                                      (service) =>
                                                                          `${service.lineName} - ${service.origin} - ${service.destination} (${service.operatorShortName})`,
                                                                  )
                                                                  .join(", ")
                                                            : "N/A",
                                                        createChangeLink(
                                                            "service",
                                                            getConsequenceUrl(consequence.consequenceType),
                                                            i,
                                                            true,
                                                        ),
                                                    ],
                                                },
                                                {
                                                    header: "Stops affected",
                                                    cells: [
                                                        (consequence.consequenceType === "stops" ||
                                                            consequence.consequenceType === "services") &&
                                                        consequence.stops
                                                            ? consequence.stops
                                                                  .map((stop) =>
                                                                      stop.commonName && stop.indicator && stop.atcoCode
                                                                          ? `${stop.commonName} ${stop.indicator} ${stop.atcoCode}`
                                                                          : `${stop.commonName} ${stop.atcoCode}`,
                                                                  )
                                                                  .join(", ")
                                                            : "N/A",
                                                        createChangeLink(
                                                            "stops-affected",
                                                            getConsequenceUrl(consequence.consequenceType),
                                                            i,
                                                            true,
                                                        ),
                                                    ],
                                                },
                                                {
                                                    header: "Advice to display",
                                                    cells: [
                                                        consequence.description,
                                                        createChangeLink(
                                                            "advice-to-display",
                                                            getConsequenceUrl(consequence.consequenceType),
                                                            i,
                                                            true,
                                                        ),
                                                    ],
                                                },
                                                {
                                                    header: "Remove from journey planner",
                                                    cells: [
                                                        splitCamelCaseToString(consequence.removeFromJourneyPlanners),
                                                        createChangeLink(
                                                            "remove-from-journey-planners",
                                                            getConsequenceUrl(consequence.consequenceType),
                                                            i,
                                                            true,
                                                        ),
                                                    ],
                                                },
                                                {
                                                    header: "Disruption delay",
                                                    cells: [
                                                        consequence.disruptionDelay
                                                            ? `${consequence.disruptionDelay} minutes`
                                                            : "N/A",
                                                        createChangeLink(
                                                            "disruption-delay",
                                                            getConsequenceUrl(consequence.consequenceType),
                                                            i,
                                                            true,
                                                        ),
                                                    ],
                                                },
                                            ]}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Link
                            role="button"
                            href={`${TYPE_OF_CONSEQUENCE_PAGE_PATH}/${disruption.disruptionId}/${
                                disruption.consequences?.length ?? 0
                            }`}
                            className="govuk-button mt-2 govuk-button--secondary"
                        >
                            Add another consequence
                        </Link>

                        <br />
                        <h2 className="govuk-heading-l">Social media posts</h2>

                        <div className="govuk-accordion" data-module="govuk-accordion" id="accordion-default">
                            {previousSocialMediaPosts.map((post, i) => (
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
                                                        post.messageToAppear,
                                                        createChangeLink("message-to-appear", "/social-media-posts"),
                                                    ],
                                                },
                                                {
                                                    header: "Publish date",
                                                    cells: [
                                                        post.publishDate,
                                                        createChangeLink("publish-date", "/social-media-posts"),
                                                    ],
                                                },
                                                {
                                                    header: "Publish time",
                                                    cells: [
                                                        post.publishTime,
                                                        createChangeLink("publish-time", "/social-media-posts"),
                                                    ],
                                                },
                                                {
                                                    header: "Account to publish",
                                                    cells: [
                                                        post.accountToPublish,
                                                        createChangeLink("account-to-publish", "/social-media-posts"),
                                                    ],
                                                },
                                            ]}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Link
                            role="button"
                            href="/social-media-posts"
                            className="govuk-button mt-2 govuk-button--secondary"
                        >
                            Add another social media post
                        </Link>
                        <br />

                        <input type="hidden" name="disruptionId" value={disruption.disruptionId} />

                        <button className="govuk-button mt-8" data-module="govuk-button">
                            Publish disruption
                        </button>
                        <button
                            className="govuk-button govuk-button--warning ml-5 mt-8"
                            data-module="govuk-button"
                            onClick={(e) => {
                                e.preventDefault();
                                deleteActionHandler(disruption.disruptionId, disruption.summary);
                            }}
                        >
                            Delete disruption
                        </button>
                        {popUpState && csrfToken ? (
                            <DeleteConfirmationPopup
                                entityName={"disruption"}
                                deleteUrl={buildDeleteUrl(popUpState.disruptionId, csrfToken)}
                                cancelActionHandler={cancelActionHandler}
                                hintText="This action is permanent and cannot be undone"
                            />
                        ) : null}
                    </div>
                </>
            </CsrfForm>
        </BaseLayout>
    );
};

export const getServerSideProps = async (ctx: NextPageContext): Promise<{ props: ReviewDisruptionProps } | void> => {
    const disruption = await getDisruptionById(ctx.query.disruptionId?.toString() ?? "");

    if (!disruption) {
        throw new Error("Disruption not found for review page");
    }

    const previousSocialMediaPosts: SocialMediaPost[] = [
        {
            messageToAppear: "The road is closed for the following reasons: Example, example, example, example",
            publishDate: "11/05/2020",
            publishTime: "11:00",
            accountToPublish: "Example account",
        },
        {
            messageToAppear: "The road is closed for the following reasons: Example, example, example, example",
            publishDate: "11/05/2020",
            publishTime: "11:00",
            accountToPublish: "Example account 2",
        },
    ];

    return {
        props: {
            disruption,
            previousSocialMediaPosts,
        },
    };
};

export default ReviewDisruption;
