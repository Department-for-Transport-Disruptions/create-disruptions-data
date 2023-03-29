import startCase from "lodash/startCase";
import { NextPageContext } from "next";
import Link from "next/link";
import { parseCookies } from "nookies";
import { ReactElement, useEffect, useRef } from "react";
import Table from "../components/form/Table";
import { BaseLayout } from "../components/layout/Layout";
import {
    ADD_CONSEQUENCE_PAGE_PATH,
    CONSEQUENCE_TYPES,
    COOKIES_CONSEQUENCE_INFO,
    COOKIES_CONSEQUENCE_TYPE_INFO,
    COOKIES_DISRUPTION_INFO,
    CREATE_DISRUPTION_PAGE_PATH,
} from "../constants";
import { SocialMediaPost } from "../interfaces";
import { Consequence, consequenceSchema } from "../schemas/consequence.schema";
import { createDisruptionSchema, Disruption } from "../schemas/create-disruption.schema";
import { typeOfConsequenceSchema } from "../schemas/type-of-consequence.schema";
import { getDisplayByValue, redirectTo, splitCamelCaseToString } from "../utils";
import { formatTime } from "../utils/dates";

const title = "Review Disruption";
const description = "Review Disruption page for the Create Transport Disruptions Service";

interface ReviewDisruptionProps {
    previousDisruptionInformation: Disruption;
    previousConsequencesInformation: Consequence[];
    previousSocialMediaPosts: SocialMediaPost[];
}

const createChangeLink = (key: string, href: string) => (
    <Link key={key} className="govuk-link" href={href}>
        Change
    </Link>
);

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

const ReviewDisruption = ({
    previousDisruptionInformation,
    previousConsequencesInformation,
    previousSocialMediaPosts,
}: ReviewDisruptionProps): ReactElement => {
    const hasInitialised = useRef(false);

    useEffect(() => {
        if (window.GOVUKFrontend && !hasInitialised.current) {
            window.GOVUKFrontend.initAll();
        }

        hasInitialised.current = true;
    });

    const getValidityRows = () => {
        return previousDisruptionInformation.validity.map((validity, i) => ({
            header: `Validity period ${i + 1}`,
            cells: [
                validity.disruptionEndDate && validity.disruptionEndTime && !validity.disruptionNoEndDateTime
                    ? `${validity.disruptionStartDate} ${validity.disruptionStartTime} - ${validity.disruptionEndDate} ${validity.disruptionEndTime}`
                    : `${validity.disruptionStartDate} ${validity.disruptionStartTime} - No end date/time`,
                createChangeLink(`validity-period-${i + 1}`, "/create-disruption"),
            ],
        }));
    };

    return (
        <BaseLayout title={title} description={description}>
            <form action="/api/publish" method="post">
                <>
                    <div className="govuk-form-group">
                        <h1 className="govuk-heading-xl">Review your answers before submitting the disruption</h1>
                        <Table
                            rows={[
                                {
                                    header: "Type of disruption",
                                    cells: [
                                        startCase(previousDisruptionInformation.disruptionType),
                                        createChangeLink("type-of-disruption", "/create-disruption"),
                                    ],
                                },
                                {
                                    header: "Summary",
                                    cells: [
                                        previousDisruptionInformation.summary,
                                        createChangeLink("summary", "/create-disruption"),
                                    ],
                                },
                                {
                                    header: "Description",
                                    cells: [
                                        previousDisruptionInformation.description,
                                        createChangeLink("description", "/create-disruption"),
                                    ],
                                },
                                {
                                    header: "Associated link",
                                    cells: [
                                        previousDisruptionInformation.associatedLink || "N/A",
                                        createChangeLink("associated-link", "/create-disruption"),
                                    ],
                                },
                                {
                                    header: "Reason for disruption",
                                    cells: [
                                        splitCamelCaseToString(previousDisruptionInformation.disruptionReason),
                                        createChangeLink("disruption-reason", "/create-disruption"),
                                    ],
                                },
                                ...getValidityRows(),
                                {
                                    header: "Publish start date",
                                    cells: [
                                        previousDisruptionInformation.publishStartDate,
                                        createChangeLink("publish-start-date", "/create-disruption"),
                                    ],
                                },
                                {
                                    header: "Publish start time",
                                    cells: [
                                        formatTime(previousDisruptionInformation.publishStartTime),
                                        createChangeLink("publish-start-time", "/create-disruption"),
                                    ],
                                },
                                {
                                    header: "Publish end date",
                                    cells: [
                                        previousDisruptionInformation.publishEndDate || "N/A",
                                        createChangeLink("publish-end-date", "/create-disruption"),
                                    ],
                                },
                                {
                                    header: "Publish end time",
                                    cells: [
                                        previousDisruptionInformation.publishEndTime
                                            ? formatTime(previousDisruptionInformation.publishEndTime)
                                            : "N/A",
                                        ,
                                        createChangeLink("publish-end-time", "/create-disruption"),
                                    ],
                                },
                            ]}
                        />
                        <h2 className="govuk-heading-l">Consequences</h2>

                        <div className="govuk-accordion" data-module="govuk-accordion" id="accordion-default">
                            {previousConsequencesInformation.map((consequence, i) => (
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
                                                    header: "Mode of transport",
                                                    cells: [
                                                        splitCamelCaseToString(consequence.vehicleMode),
                                                        createChangeLink(
                                                            "mode-of-transport",
                                                            ADD_CONSEQUENCE_PAGE_PATH,
                                                        ),
                                                    ],
                                                },
                                                {
                                                    header: "Consequence type",
                                                    cells: [
                                                        getDisplayByValue(
                                                            CONSEQUENCE_TYPES,
                                                            consequence.consequenceType,
                                                        ),
                                                        createChangeLink("consequence-type", ADD_CONSEQUENCE_PAGE_PATH),
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
                                                                  .join()
                                                            : "N/A",
                                                        createChangeLink(
                                                            "service",
                                                            getConsequenceUrl(consequence.consequenceType),
                                                        ),
                                                    ],
                                                },
                                                {
                                                    header: "Stops affected",
                                                    cells: [
                                                        consequence.consequenceType === "stops"
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
                            href={ADD_CONSEQUENCE_PAGE_PATH}
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
                        <button className="govuk-button mt-8" data-module="govuk-button">
                            Publish disruption
                        </button>
                    </div>
                </>
            </form>
        </BaseLayout>
    );
};

export const getServerSideProps = (ctx: NextPageContext): { props: ReviewDisruptionProps } | void => {
    const {
        [COOKIES_DISRUPTION_INFO]: disruptionInfo,
        [COOKIES_CONSEQUENCE_TYPE_INFO]: consequenceType,
        [COOKIES_CONSEQUENCE_INFO]: consequenceInfo,
    } = parseCookies(ctx);

    if (!disruptionInfo || !consequenceInfo || !consequenceType) {
        if (ctx.res) {
            redirectTo(ctx.res, CREATE_DISRUPTION_PAGE_PATH);
        }

        return;
    }

    const parsedDisruptionInfo = createDisruptionSchema.safeParse(JSON.parse(disruptionInfo));
    const parsedConsequenceType = typeOfConsequenceSchema.safeParse(JSON.parse(consequenceType));
    const parsedConsequenceInfo = consequenceSchema.safeParse(JSON.parse(consequenceInfo));

    if (!parsedDisruptionInfo.success || !parsedConsequenceInfo.success || !parsedConsequenceType.success) {
        if (ctx.res) {
            redirectTo(ctx.res, CREATE_DISRUPTION_PAGE_PATH);
        }

        return;
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
            previousDisruptionInformation: parsedDisruptionInfo.data,
            previousConsequencesInformation: [parsedConsequenceInfo.data],
            previousSocialMediaPosts,
        },
    };
};

export default ReviewDisruption;
