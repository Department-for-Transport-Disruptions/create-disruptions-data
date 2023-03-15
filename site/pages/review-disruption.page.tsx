/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { VehicleMode } from "@create-disruptions-data/shared-ts/enums";
import { startCase } from "lodash";
import { NextPageContext } from "next";
import Link from "next/link";
import { parseCookies } from "nookies";
import { ReactElement } from "react";
import Table from "../components/form/Table";
import { BaseLayout } from "../components/layout/Layout";
import { ADD_CONSEQUENCE_PAGE_PATH, COOKIES_DISRUPTION_INFO } from "../constants";
import { Consequence, Disruption, SocialMediaPost } from "../interfaces";
import { createDisruptionSchema } from "../schemas/create-disruption.schema";
import { convertDateTimeToFormat, formatTime, redirectTo, splitCamelCaseToString } from "../utils";

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

const isOperatorOrNetworkUrl = (type: string) =>
    `/create-consequence-${type === "Operator wide" ? "operator" : "network"}`;

const ReviewDisruption = ({
    previousDisruptionInformation,
    previousConsequencesInformation,
    previousSocialMediaPosts,
}: ReviewDisruptionProps): ReactElement => {
    return (
        <BaseLayout title={title} description={description}>
            <form action="/api/review-disruption" method="post">
                <>
                    <div className="govuk-form-group">
                        <h1 className="govuk-heading-xl">Review your answers before submitting the disruption</h1>
                        <Table
                            rows={[
                                {
                                    header: "Type of disruption",
                                    cells: [
                                        previousDisruptionInformation["type-of-disruption"],
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
                                        previousDisruptionInformation["associated-link"],
                                        createChangeLink("associated-link", "/create-disruption"),
                                    ],
                                },
                                {
                                    header: "Reason for disruption",
                                    cells: [
                                        previousDisruptionInformation["disruption-reason"],
                                        createChangeLink("disruption-reason", "/create-disruption"),
                                    ],
                                },
                                {
                                    header: "Start date",
                                    cells: [
                                        previousDisruptionInformation["disruption-start-date"],
                                        createChangeLink("disruption-start-date", "/create-disruption"),
                                    ],
                                },
                                {
                                    header: "Start time",
                                    cells: [
                                        previousDisruptionInformation["disruption-start-time"],
                                        createChangeLink("disruption-start-time", "/create-disruption"),
                                    ],
                                },
                                {
                                    header: "End date",
                                    cells: [
                                        previousDisruptionInformation["disruption-end-date"],
                                        createChangeLink("disruption-end-date", "/create-disruption"),
                                    ],
                                },
                                {
                                    header: "End time",
                                    cells: [
                                        previousDisruptionInformation["disruption-end-time"],
                                        createChangeLink("disruption-end-time", "/create-disruption"),
                                    ],
                                },
                                {
                                    header: "Repeating service",
                                    cells: [
                                        previousDisruptionInformation["disruption-repeats"],
                                        createChangeLink("disruption-repeats", "/create-disruption"),
                                    ],
                                },
                                {
                                    header: "Publish start date",
                                    cells: [
                                        previousDisruptionInformation["publish-start-date"],
                                        createChangeLink("publish-start-date", "/create-disruption"),
                                    ],
                                },
                                {
                                    header: "Publish start time",
                                    cells: [
                                        previousDisruptionInformation["publish-start-time"],
                                        createChangeLink("publish-start-time", "/create-disruption"),
                                    ],
                                },
                                {
                                    header: "Publish end date",
                                    cells: [
                                        previousDisruptionInformation["publish-end-date"],
                                        createChangeLink("publish-end-date", "/create-disruption"),
                                    ],
                                },
                                {
                                    header: "Publish end time",
                                    cells: [
                                        previousDisruptionInformation["publish-end-time"],
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
                                                {`Consequence ${i + 1} - ${consequence["mode-of-transport"]} - ${
                                                    consequence["services-affected"]
                                                        ? `Services - ${consequence["services-affected"]
                                                              .map((service) => service.id)
                                                              .join(", ")}`
                                                        : consequence["consequence-type"] === "Operator wide" &&
                                                          consequence["consequence-operator"]
                                                        ? `${"Operator wide"} - ${consequence["consequence-operator"]}`
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
                                                        consequence["mode-of-transport"],
                                                        createChangeLink(
                                                            "mode-of-transport",
                                                            ADD_CONSEQUENCE_PAGE_PATH,
                                                        ),
                                                    ],
                                                },
                                                {
                                                    header: "Consequence type",
                                                    cells: [
                                                        consequence["consequence-type"],
                                                        createChangeLink("consequence-type", ADD_CONSEQUENCE_PAGE_PATH),
                                                    ],
                                                },
                                                {
                                                    header: "Service(s)",
                                                    cells: [
                                                        consequence["services-affected"]
                                                            ? consequence["services-affected"]
                                                                  .map((service) => `${service.id}: ${service.name}`)
                                                                  .join()
                                                            : "N/A",
                                                        createChangeLink(
                                                            "service",
                                                            isOperatorOrNetworkUrl(consequence["consequence-type"]),
                                                        ),
                                                    ],
                                                },
                                                {
                                                    header: "Stops affected",
                                                    cells: [
                                                        consequence["stops-affected"]
                                                            ? consequence["stops-affected"].join(", ")
                                                            : "N/A",
                                                        createChangeLink(
                                                            "stops-affected",
                                                            isOperatorOrNetworkUrl(consequence["consequence-type"]),
                                                        ),
                                                    ],
                                                },
                                                {
                                                    header: "Advice to display",
                                                    cells: [
                                                        consequence["advice-to-display"],
                                                        createChangeLink(
                                                            "advice-to-display",
                                                            isOperatorOrNetworkUrl(consequence["consequence-type"]),
                                                        ),
                                                    ],
                                                },
                                                {
                                                    header: "Remove from journey planner",
                                                    cells: [
                                                        consequence["remove-from-journey-planners"],
                                                        createChangeLink(
                                                            "remove-from-journey-planners",
                                                            isOperatorOrNetworkUrl(consequence["consequence-type"]),
                                                        ),
                                                    ],
                                                },
                                                {
                                                    header: "Disruption delay",
                                                    cells: [
                                                        consequence["disruption-delay"],
                                                        createChangeLink(
                                                            "disruption-delay",
                                                            isOperatorOrNetworkUrl(consequence["consequence-type"]),
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
                                                        post["message-to-appear"],
                                                        createChangeLink("message-to-appear", "/social-media-posts"),
                                                    ],
                                                },
                                                {
                                                    header: "Publish date",
                                                    cells: [
                                                        post["publish-date"],
                                                        createChangeLink("publish-date", "/social-media-posts"),
                                                    ],
                                                },
                                                {
                                                    header: "Publish time",
                                                    cells: [
                                                        post["publish-time"],
                                                        createChangeLink("publish-time", "/social-media-posts"),
                                                    ],
                                                },
                                                {
                                                    header: "Account to publish",
                                                    cells: [
                                                        post["account-to-publish"],
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

export const getServerSideProps = (ctx: NextPageContext): { props: object } | void => {
    const disruptionInfoCookie = parseCookies(ctx)[COOKIES_DISRUPTION_INFO];

    const previousConsequencesInformation: Consequence[] = [
        {
            "mode-of-transport": splitCamelCaseToString(VehicleMode.bus),
            "consequence-type": "Network wide",
            "services-affected": [{ id: "1", name: "Piccadilly to Manchester central" }],
            "stops-affected": ["Shudehill SW", "Bolton NW", "Risehill SW", "Picadilly NE", "Noma NW"],
            "advice-to-display": "The road is closed for the following reasons: Example, example, example, example",
            "remove-from-journey-planners": "Yes",
            "disruption-delay": "35 minutes",
        },
        {
            "mode-of-transport": splitCamelCaseToString(VehicleMode.bus),
            "consequence-type": "Network wide",
            "advice-to-display": "The road is closed for the following reasons: Example, example, example, example",
            "remove-from-journey-planners": "Yes",
            "disruption-delay": "35 minutes",
        },
        {
            "mode-of-transport": splitCamelCaseToString(VehicleMode.bus),
            "consequence-type": "Operator wide",
            "consequence-operator": "Stagecoach",
            "advice-to-display": "The road is closed for the following reasons: Example, example, example, example",
            "remove-from-journey-planners": "Yes",
            "disruption-delay": "35 minutes",
        },
    ];

    const previousSocialMediaPosts: SocialMediaPost[] = [
        {
            "message-to-appear": "The road is closed for the following reasons: Example, example, example, example",
            "publish-date": "11/05/2020",
            "publish-time": "11:00",
            "account-to-publish": "Example account",
        },
        {
            "message-to-appear": "The road is closed for the following reasons: Example, example, example, example",
            "publish-date": "11/05/2020",
            "publish-time": "11:00",
            "account-to-publish": "Example account 2",
        },
    ];

    if (disruptionInfoCookie) {
        const disruptionInfo = createDisruptionSchema.safeParse(JSON.parse(disruptionInfoCookie));

        if (disruptionInfo.success) {
            const disruptionData = disruptionInfo.data;
            const previousDisruptionInformation = {
                "type-of-disruption": startCase(disruptionData.disruptionType),
                summary: disruptionData.summary,
                description: disruptionData.description,
                "associated-link": disruptionData.associatedLink || "N/A",
                "disruption-reason": splitCamelCaseToString(disruptionData.disruptionReason),
                "disruption-start-date": convertDateTimeToFormat(disruptionData.disruptionStartDate, "DD/MM/YYYY"),
                "disruption-start-time": formatTime(disruptionData.disruptionStartTime),
                "disruption-end-date": disruptionData.disruptionEndDate
                    ? convertDateTimeToFormat(disruptionData.disruptionEndDate, "DD/MM/YYYY")
                    : "N/A",
                "disruption-end-time": disruptionData.disruptionEndTime
                    ? formatTime(disruptionData.disruptionEndTime)
                    : "N/A",
                "disruption-repeats": startCase(disruptionData.disruptionRepeats),
                "publish-start-date": convertDateTimeToFormat(disruptionData.publishStartDate, "DD/MM/YYYY"),
                "publish-start-time": formatTime(disruptionData.publishStartTime),
                "publish-end-date": disruptionData.publishEndDate
                    ? convertDateTimeToFormat(disruptionData.publishEndDate, "DD/MM/YYYY")
                    : "N/A",
                "publish-end-time": disruptionData.publishEndTime ? formatTime(disruptionData.publishEndTime) : "N/A",
            };

            return {
                props: { previousDisruptionInformation, previousConsequencesInformation, previousSocialMediaPosts },
            };
        }
    }

    if (ctx.res) {
        redirectTo(ctx.res, ADD_CONSEQUENCE_PAGE_PATH);
    }

    return;
};

export default ReviewDisruption;
