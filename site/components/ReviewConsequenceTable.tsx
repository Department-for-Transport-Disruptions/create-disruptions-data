import Link from "next/link";
import { ReactElement, ReactNode } from "react";
import Table from "./form/Table";
import {
    CONSEQUENCE_TYPES,
    DISRUPTION_DETAIL_PAGE_PATH,
    REVIEW_DISRUPTION_PAGE_PATH,
    TYPE_OF_CONSEQUENCE_PAGE_PATH,
    VEHICLE_MODES,
} from "../constants";
import { Consequence } from "../schemas/consequence.schema";
import { Disruption } from "../schemas/disruption.schema";
import { getDisplayByValue, splitCamelCaseToString } from "../utils";

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

export const createChangeLink = (
    key: string,
    href: string,
    disruption: Disruption,
    index?: number,
    includePreviousPage?: boolean,
    isDisruptionDetail?: boolean,
) => {
    return (
        <Link
            key={key}
            className="govuk-link"
            href={{
                pathname: `${href}/${disruption.disruptionId}${index !== undefined ? `/${index}` : ""}`,
                query: includePreviousPage
                    ? { return: isDisruptionDetail ? DISRUPTION_DETAIL_PAGE_PATH : REVIEW_DISRUPTION_PAGE_PATH }
                    : null,
            }}
        >
            Change
        </Link>
    );
};

const getRows = (
    consequence: Consequence,
    disruption: Disruption,
    deleteActionHandler: (
        name: string,
        hiddenInputs: {
            name: string;
            value: string;
        }[],
    ) => void,
    isDisruptionDetail?: boolean,
) => {
    const rows: { header?: string | ReactNode; cells: string[] | ReactNode[] }[] = [
        {
            header: "Consequence type",
            cells: [
                getDisplayByValue(CONSEQUENCE_TYPES, consequence.consequenceType),
                createChangeLink(
                    "consequence-type",
                    TYPE_OF_CONSEQUENCE_PAGE_PATH,
                    disruption,
                    consequence.consequenceIndex,
                    true,
                    isDisruptionDetail,
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
                    disruption,
                    consequence.consequenceIndex,
                    true,
                    isDisruptionDetail,
                ),
            ],
        },
    ];

    if (consequence.consequenceType === "services") {
        rows.push({
            header: "Service(s)",
            cells: [
                consequence.services
                    .map(
                        (service) =>
                            `${service.lineName} - ${service.origin} - ${service.destination} (${service.operatorShortName})`,
                    )
                    .join(", "),
                createChangeLink(
                    "service",
                    getConsequenceUrl(consequence.consequenceType),
                    disruption,
                    consequence.consequenceIndex,
                    true,
                    isDisruptionDetail,
                ),
            ],
        });
    }

    if (consequence.consequenceType === "services" || consequence.consequenceType === "stops") {
        rows.push({
            header: "Stops affected",
            cells: [
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
                    disruption,
                    consequence.consequenceIndex,
                    true,
                    isDisruptionDetail,
                ),
            ],
        });
    }

    if (consequence.consequenceType === "operatorWide") {
        rows.push({
            header: "Operators affected",
            cells: [
                consequence.consequenceOperators ? consequence.consequenceOperators.join(", ") : "N/A",
                createChangeLink(
                    "operators-affected",
                    getConsequenceUrl(consequence.consequenceType),
                    disruption,
                    consequence.consequenceIndex,
                    true,
                    isDisruptionDetail,
                ),
            ],
        });
    }

    rows.push(
        {
            header: "Advice to display",
            cells: [
                consequence.description,
                createChangeLink(
                    "advice-to-display",
                    getConsequenceUrl(consequence.consequenceType),
                    disruption,
                    consequence.consequenceIndex,
                    true,
                    isDisruptionDetail,
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
                    disruption,
                    consequence.consequenceIndex,
                    true,
                    isDisruptionDetail,
                ),
            ],
        },
        {
            header: "Disruption delay",
            cells: [
                consequence.disruptionDelay ? `${consequence.disruptionDelay} minutes` : "N/A",
                createChangeLink(
                    "disruption-delay",
                    getConsequenceUrl(consequence.consequenceType),
                    disruption,
                    consequence.consequenceIndex,
                    true,
                    isDisruptionDetail,
                ),
            ],
        },
        {
            cells: [
                <button
                    key={consequence.consequenceIndex}
                    className="govuk-button govuk-button--warning ml-5 mt-8"
                    data-module="govuk-button"
                    onClick={(e) => {
                        e.preventDefault();
                        deleteActionHandler("consequence", [
                            {
                                name: "id",
                                value: consequence.consequenceIndex.toString(),
                            },
                            {
                                name: "disruptionId",
                                value: disruption.disruptionId,
                            },
                        ]);
                    }}
                >
                    Delete consequence
                </button>,
            ],
        },
    );
    return rows;
};

interface ReviewConsequenceTableProps {
    consequence: Consequence;
    disruption: Disruption;
    deleteActionHandler: (
        name: string,
        hiddenInputs: {
            name: string;
            value: string;
        }[],
    ) => void;
    isDisruptionDetail?: boolean;
}

const ReviewConsequenceTable = ({
    consequence,
    disruption,
    deleteActionHandler,
    isDisruptionDetail,
}: ReviewConsequenceTableProps): ReactElement => {
    return <Table rows={getRows(consequence, disruption, deleteActionHandler, isDisruptionDetail)} />;
};

export default ReviewConsequenceTable;
