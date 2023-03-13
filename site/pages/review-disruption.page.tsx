/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { NextPageContext } from "next";
import Link from "next/link";
import { parseCookies } from "nookies";
import { ReactElement } from "react";
import { DisruptionPageInputs } from "./create-disruption.page";
import Table from "../components/form/Table";
import { BaseLayout } from "../components/layout/Layout";
import { ConsequenceType, TransportMode } from "../constants/enum";
import { Consequence, SocialMediaPost } from "../interfaces";
import { convertDateTimeToFormat } from "../utils";

const title = "Review Disruption";
const description = "Review Disruption page for the Create Transport Disruptions Service";

interface ReviewDisruptionProps {
    previousDisruptionInformation: DisruptionPageInputs;
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
            <form action="/api/createConsequenceOperator" method="post">
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
                                                    consequence.service
                                                        ? `Services - ${consequence["service"]
                                                              .map((service) => service.id)
                                                              .join(", ")}`
                                                        : consequence["consequence-type"] === "Operator wide" &&
                                                          consequence["consequence-operator"]
                                                        ? `Operator wide - ${consequence["consequence-operator"]}`
                                                        : "Network wide"
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
                                                        createChangeLink("mode-of-transport", "/type-of-consequence"),
                                                    ],
                                                },
                                                {
                                                    header: "Consequence type",
                                                    cells: [
                                                        consequence["consequence-type"],
                                                        createChangeLink("consequence-type", "/type-of-consequence"),
                                                    ],
                                                },
                                                {
                                                    header: "Service",
                                                    cells: [
                                                        consequence.service
                                                            ? consequence.service
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
                            href="/type-of-consequence"
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

export const getServerSideProps = (ctx: NextPageContext): { props: object } => {
    const cookies = parseCookies(ctx);
    const disruptionInfo: DisruptionPageInputs = cookies["disruption-info"]
        ? JSON.parse(cookies["disruption-info"])
        : "";

    const previousSocialMediaPosts: SocialMediaPost[] = [
        {
            "message-to-appear": "The road is closed for the following reasons: Example, example, example, example",
            "publish-date": convertDateTimeToFormat(disruptionInfo["publish-start-date"], "DD/MM/YYYY"),
            "publish-time": convertDateTimeToFormat(disruptionInfo["publish-start-time"], "hh:mm"),
            "account-to-publish": "Example account",
        },
        {
            "message-to-appear": "The road is closed for the following reasons: Example, example, example, example",
            "publish-date": convertDateTimeToFormat(disruptionInfo["publish-start-date"], "DD/MM/YYYY"),
            "publish-time": convertDateTimeToFormat(disruptionInfo["publish-start-time"], "hh:mm"),
            "account-to-publish": "Example account 2",
        },
    ];

    const previousConsequencesInformation: Consequence[] = [
        {
            "mode-of-transport": TransportMode.bus,
            "consequence-type": ConsequenceType.networkWide,
            service: [{ id: "1", name: "Piccadilly to Manchester central" }],
            "stops-affected": ["Shudehill SW", "Bolton NW", "Risehill SW", "Picadilly NE", "Noma NW"],
            "advice-to-display": "The road is closed for the following reasons: Example, example, example, example",
            "remove-from-journey-planners": "Yes",
            "disruption-delay": "35 minutes",
        },
        {
            "mode-of-transport": TransportMode.bus,
            "consequence-type": ConsequenceType.networkWide,
            "advice-to-display": "The road is closed for the following reasons: Example, example, example, example",
            "remove-from-journey-planners": "Yes",
            "disruption-delay": "35 minutes",
        },
        {
            "mode-of-transport": TransportMode.bus,
            "consequence-type": ConsequenceType.operatorWide,
            "consequence-operator": "Stagecoach",
            "advice-to-display": "The road is closed for the following reasons: Example, example, example, example",
            "remove-from-journey-planners": "Yes",
            "disruption-delay": "35 minutes",
        },
    ];

    const previousDisruptionInformation = {
        "type-of-disruption": disruptionInfo["type-of-disruption"],
        summary: disruptionInfo.summary,
        description: disruptionInfo.description,
        "associated-link": disruptionInfo["associated-link"] || "N/A",
        "disruption-reason": disruptionInfo["disruption-reason"],
        "disruption-start-date": convertDateTimeToFormat(disruptionInfo["disruption-start-date"], "DD/MM/YYYY"),
        "disruption-start-time": convertDateTimeToFormat(disruptionInfo["disruption-start-time"], "hh:mm"),
        "disruption-end-date": convertDateTimeToFormat(disruptionInfo["disruption-end-date"], "DD/MM/YYYY") || "N/A",
        "disruption-end-time": convertDateTimeToFormat(disruptionInfo["disruption-end-time"], "hh:mm") || "N/A",
        "disruption-repeats": disruptionInfo["disruption-repeats"] || "No",
        "publish-start-date": convertDateTimeToFormat(disruptionInfo["publish-start-date"], "DD/MM/YYYY"),
        "publish-start-time": convertDateTimeToFormat(disruptionInfo["publish-start-time"], "hh:mm"),
        "publish-end-date": convertDateTimeToFormat(disruptionInfo["publish-end-date"], "DD/MM/YYYY") || "N/A",
        "publish-end-time": convertDateTimeToFormat(disruptionInfo["publish-end-time"], "hh:mm") || "N/A",
    };

    return {
        props: { previousDisruptionInformation, previousConsequencesInformation, previousSocialMediaPosts },
    };
};

export default ReviewDisruption;
