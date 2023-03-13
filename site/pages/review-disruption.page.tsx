/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import dayjs from "dayjs";
import { NextPageContext } from "next";
import Link from "next/link";
import { parseCookies } from "nookies";
import { ReactElement } from "react";
import { DisruptionPageInputs } from "./create-disruption.page";
import Table from "../components/form/Table";
import { BaseLayout } from "../components/layout/Layout";
import { ConsequenceType, TransportMode } from "../constants/enum";
import { Consequence } from "../interfaces";

const title = "Review Disruption";
const description = "Review Disruption page for the Create Transport Disruptions Service";

interface CreateConsequenceOperatorProps {
    previousDisruptionInformation: DisruptionPageInputs;
    previousConsequencesInformation: Consequence[];
}

const CreateConsequenceOperator = ({
    previousDisruptionInformation,
    previousConsequencesInformation,
}: CreateConsequenceOperatorProps): ReactElement => {
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
                                        <Link
                                            key={"type-of-disruption"}
                                            className="govuk-link"
                                            href="/create-disruption"
                                        >
                                            Change
                                        </Link>,
                                    ],
                                },
                                {
                                    header: "Summary",
                                    cells: [
                                        previousDisruptionInformation.summary,
                                        <Link key={"summary"} className="govuk-link" href="/create-disruption">
                                            Change
                                        </Link>,
                                    ],
                                },
                                {
                                    header: "Description",
                                    cells: [
                                        previousDisruptionInformation.description,
                                        <Link key={"description"} className="govuk-link" href="/create-disruption">
                                            Change
                                        </Link>,
                                    ],
                                },
                                {
                                    header: "Associated link",
                                    cells: [
                                        previousDisruptionInformation["associated-link"],
                                        <Link key={"associated-link"} className="govuk-link" href="/create-disruption">
                                            Change
                                        </Link>,
                                    ],
                                },
                                {
                                    header: "Reason for disruption",
                                    cells: [
                                        previousDisruptionInformation["disruption-reason"],
                                        <Link
                                            key={"disruption-reason"}
                                            className="govuk-link"
                                            href="/create-disruption"
                                        >
                                            Change
                                        </Link>,
                                    ],
                                },
                                {
                                    header: "Start date",
                                    cells: [
                                        previousDisruptionInformation["disruption-start-date"],
                                        <Link
                                            key={"disruption-start-date"}
                                            className="govuk-link"
                                            href="/create-disruption"
                                        >
                                            Change
                                        </Link>,
                                    ],
                                },
                                {
                                    header: "Start time",
                                    cells: [
                                        previousDisruptionInformation["disruption-start-time"],
                                        <Link
                                            key={"disruption-start-time"}
                                            className="govuk-link"
                                            href="/create-disruption"
                                        >
                                            Change
                                        </Link>,
                                    ],
                                },
                                {
                                    header: "End date",
                                    cells: [
                                        previousDisruptionInformation["disruption-end-date"],
                                        <Link
                                            key={"disruption-end-date"}
                                            className="govuk-link"
                                            href="/create-disruption"
                                        >
                                            Change
                                        </Link>,
                                    ],
                                },
                                {
                                    header: "End time",
                                    cells: [
                                        previousDisruptionInformation["disruption-end-time"],
                                        <Link
                                            key={"disruption-end-time"}
                                            className="govuk-link"
                                            href="/create-disruption"
                                        >
                                            Change
                                        </Link>,
                                    ],
                                },
                                {
                                    header: "Repeating service",
                                    cells: [
                                        previousDisruptionInformation["disruption-repeats"],
                                        <Link
                                            key={"disruption-repeats"}
                                            className="govuk-link"
                                            href="/create-disruption"
                                        >
                                            Change
                                        </Link>,
                                    ],
                                },
                                {
                                    header: "Publish start date",
                                    cells: [
                                        previousDisruptionInformation["publish-start-date"],
                                        <Link
                                            key={"publish-start-date"}
                                            className="govuk-link"
                                            href="/create-disruption"
                                        >
                                            Change
                                        </Link>,
                                    ],
                                },
                                {
                                    header: "Publish start time",
                                    cells: [
                                        previousDisruptionInformation["publish-start-time"],
                                        <Link
                                            key={"publish-start-time"}
                                            className="govuk-link"
                                            href="/create-disruption"
                                        >
                                            Change
                                        </Link>,
                                    ],
                                },
                                {
                                    header: "Publish end date",
                                    cells: [
                                        previousDisruptionInformation["publish-end-date"],
                                        <Link key={"publish-end-date"} className="govuk-link" href="/create-disruption">
                                            Change
                                        </Link>,
                                    ],
                                },
                                {
                                    header: "Publish end time",
                                    cells: [
                                        previousDisruptionInformation["publish-end-time"],
                                        <Link key={"publish-end-time"} className="govuk-link" href="/create-disruption">
                                            Change
                                        </Link>,
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
                                                        <Link
                                                            key={"mode-of-transport"}
                                                            className="govuk-link"
                                                            href={`/create-consequence-${
                                                                consequence["consequence-type"] === "Operator wide"
                                                                    ? "operator"
                                                                    : "network"
                                                            }`}
                                                        >
                                                            Change
                                                        </Link>,
                                                    ],
                                                },
                                                {
                                                    header: "Consequence type",
                                                    cells: [
                                                        consequence["consequence-type"],
                                                        <Link
                                                            key={"consequence-type"}
                                                            className="govuk-link"
                                                            href={`/create-consequence-${
                                                                consequence["consequence-type"] === "Operator wide"
                                                                    ? "operator"
                                                                    : "network"
                                                            }`}
                                                        >
                                                            Change
                                                        </Link>,
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
                                                        <Link
                                                            key={"service"}
                                                            className="govuk-link"
                                                            href={`/create-consequence-${
                                                                consequence["consequence-type"] === "Operator wide"
                                                                    ? "operator"
                                                                    : "network"
                                                            }`}
                                                        >
                                                            Change
                                                        </Link>,
                                                    ],
                                                },
                                                {
                                                    header: "Stops affected",
                                                    cells: [
                                                        consequence["stops-affected"]
                                                            ? consequence["stops-affected"].join(", ")
                                                            : "N/A",
                                                        <Link
                                                            key={"stops-affected"}
                                                            className="govuk-link"
                                                            href={`/create-consequence-${
                                                                consequence["consequence-type"] === "Operator wide"
                                                                    ? "operator"
                                                                    : "network"
                                                            }`}
                                                        >
                                                            Change
                                                        </Link>,
                                                    ],
                                                },
                                                {
                                                    header: "Advice to display",
                                                    cells: [
                                                        consequence["advice-to-display"],
                                                        <Link
                                                            key={"advice-to-display"}
                                                            className="govuk-link"
                                                            href={`/create-consequence-${
                                                                consequence["consequence-type"] === "Operator wide"
                                                                    ? "operator"
                                                                    : "network"
                                                            }`}
                                                        >
                                                            Change
                                                        </Link>,
                                                    ],
                                                },
                                                {
                                                    header: "Remove from journey planner",
                                                    cells: [
                                                        consequence["remove-from-journey-planners"],
                                                        <Link
                                                            key={"remove-from-journey-planners"}
                                                            className="govuk-link"
                                                            href={`/create-consequence-${
                                                                consequence["consequence-type"] === "Operator wide"
                                                                    ? "operator"
                                                                    : "network"
                                                            }`}
                                                        >
                                                            Change
                                                        </Link>,
                                                    ],
                                                },
                                                {
                                                    header: "Disruption delay",
                                                    cells: [
                                                        consequence["disruption-delay"],
                                                        <Link
                                                            key={"disruption-delay"}
                                                            className="govuk-link"
                                                            href={`/create-consequence-${
                                                                consequence["consequence-type"] === "Operator wide"
                                                                    ? "operator"
                                                                    : "network"
                                                            }`}
                                                        >
                                                            Change
                                                        </Link>,
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
        "type-of-disruption": disruptionInfo["type-of-disruption"] || "N/A",
        summary: disruptionInfo.summary || "N/A",
        description: disruptionInfo.description || "N/A",
        "associated-link": disruptionInfo["associated-link"] || "N/A",
        "disruption-reason": disruptionInfo["disruption-reason"] || "N/A",
        "disruption-start-date": dayjs(disruptionInfo["disruption-start-date"]).format("DD/MM/YYYY") || "N/A",
        "disruption-start-time": dayjs(disruptionInfo["disruption-start-time"]).format("hh:mm") || "N/A",
        "disruption-end-date": dayjs(disruptionInfo["disruption-end-date"]).format("DD/MM/YYYY") || "N/A",
        "disruption-end-time": dayjs(disruptionInfo["disruption-end-time"]).format("hh:mm") || "N/A",
        "disruption-repeats": disruptionInfo["disruption-repeats"] || "No",
        "publish-start-date": dayjs(disruptionInfo["publish-start-date"]).format("DD/MM/YYYY") || "N/A",
        "publish-start-time": dayjs(disruptionInfo["publish-start-time"]).format("hh:mm") || "N/A",
        "publish-end-date": dayjs(disruptionInfo["publish-end-date"]).format("DD/MM/YYYY") || "N/A",
        "publish-end-time": dayjs(disruptionInfo["publish-end-time"]).format("hh:mm") || "N/A",
    };

    return {
        props: { previousDisruptionInformation, previousConsequencesInformation },
    };
};

export default CreateConsequenceOperator;
