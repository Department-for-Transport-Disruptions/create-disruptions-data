import { Consequence, Disruption } from "@create-disruptions-data/shared-ts/disruptionTypes";
import { MAX_CONSEQUENCES } from "@create-disruptions-data/shared-ts/disruptionTypes.zod";
import Link from "next/link";
import { ReactElement, ReactNode } from "react";
import Table, { CellProps } from "./form/Table";
import {
    CANCELLATIONS_FEATURE_FLAG,
    CONSEQUENCE_TYPES,
    CREATE_CONSEQUENCE_NETWORK_PATH,
    CREATE_CONSEQUENCE_OPERATOR_PATH,
    CREATE_CONSEQUENCE_SERVICES_PATH,
    CREATE_CONSEQUENCE_STOPS_PATH,
    DISRUPTION_DETAIL_PAGE_PATH,
    REVIEW_DISRUPTION_PAGE_PATH,
    TYPE_OF_CONSEQUENCE_PAGE_PATH,
    VEHICLE_MODES,
} from "../constants";
import { getDisplayByValue, splitCamelCaseToString } from "../utils";

const getConsequenceUrl = (type: Consequence["consequenceType"]) => {
    switch (type) {
        case "networkWide":
            return CREATE_CONSEQUENCE_NETWORK_PATH;
        case "operatorWide":
            return CREATE_CONSEQUENCE_OPERATOR_PATH;
        case "stops":
            return CREATE_CONSEQUENCE_STOPS_PATH;
        case "services":
            return CREATE_CONSEQUENCE_SERVICES_PATH;
    }
};

export const createChangeLink = (
    key: string,
    href: string,
    disruptionId: string,
    index?: number,
    includePreviousPage?: boolean,
    isDisruptionDetail?: boolean,
    isTemplate?: boolean,
) => {
    return (
        <Link
            key={key}
            className="govuk-link"
            href={{
                pathname: `${href}/${disruptionId}${index !== undefined ? `/${index}` : ""}`,
                query: includePreviousPage
                    ? {
                          return: isDisruptionDetail ? DISRUPTION_DETAIL_PAGE_PATH : REVIEW_DISRUPTION_PAGE_PATH,
                          ...(isTemplate ? { template: isTemplate.toString() } : {}),
                      }
                    : isTemplate
                    ? { template: isTemplate.toString() }
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
    isEditingAllowed: boolean,
    isDisruptionDetail?: boolean,
    isTemplate?: boolean,
) => {
    const rows: { header?: string | ReactNode; cells: CellProps[] }[] = [
        {
            header: "Consequence type",
            cells: [
                {
                    value: getDisplayByValue(
                        CONSEQUENCE_TYPES(CANCELLATIONS_FEATURE_FLAG),
                        consequence.consequenceType,
                    ),
                    styles: {
                        width: "w-1/2",
                    },
                },
                {
                    value:
                        isEditingAllowed &&
                        createChangeLink(
                            "consequence-type",
                            TYPE_OF_CONSEQUENCE_PAGE_PATH,
                            disruption.disruptionId,
                            consequence.consequenceIndex,
                            true,
                            isDisruptionDetail,
                            isTemplate,
                        ),
                    styles: {
                        width: "w-1/10",
                    },
                },
            ],
        },
        {
            header: "Mode of transport",
            cells: [
                { value: getDisplayByValue(VEHICLE_MODES, consequence.vehicleMode) },
                {
                    value:
                        isEditingAllowed &&
                        createChangeLink(
                            "vehicle-mode",
                            getConsequenceUrl(consequence.consequenceType) || "",
                            disruption.disruptionId,
                            consequence.consequenceIndex,
                            true,
                            isDisruptionDetail,
                            isTemplate,
                        ),
                },
            ],
        },
    ];

    if (consequence.consequenceType === "services") {
        rows.push({
            header: "Service(s)",
            cells: [
                {
                    value: consequence.services
                        .map(
                            (service) =>
                                `${service.lineName} - ${service.origin} - ${service.destination} (${service.operatorShortName})`,
                        )
                        .join(", "),
                },
                {
                    value:
                        isEditingAllowed &&
                        createChangeLink(
                            "service",
                            getConsequenceUrl(consequence.consequenceType),
                            disruption.disruptionId,
                            consequence.consequenceIndex,
                            true,
                            isDisruptionDetail,
                            isTemplate,
                        ),
                },
            ],
        });
    }

    if (consequence.consequenceType === "services" || consequence.consequenceType === "stops") {
        rows.push({
            header: "Stops affected",
            cells: [
                {
                    value: consequence.stops
                        ? consequence.stops
                              .map((stop) =>
                                  stop.commonName && stop.indicator && stop.atcoCode
                                      ? `${stop.commonName} ${stop.indicator} ${stop.atcoCode}`
                                      : `${stop.commonName} ${stop.atcoCode}`,
                              )
                              .join(", ")
                        : "N/A",
                },
                {
                    value:
                        isEditingAllowed &&
                        createChangeLink(
                            "stops-affected",
                            getConsequenceUrl(consequence.consequenceType),
                            disruption.disruptionId,
                            consequence.consequenceIndex,
                            true,
                            isDisruptionDetail,
                            isTemplate,
                        ),
                },
            ],
        });
    }

    if (consequence.consequenceType === "operatorWide") {
        rows.push({
            header: "Operators affected",
            cells: [
                {
                    value: consequence.consequenceOperators
                        ? consequence.consequenceOperators.map((op) => op.operatorNoc).join(", ")
                        : "N/A",
                },
                {
                    value:
                        isEditingAllowed &&
                        createChangeLink(
                            "operators-affected",
                            getConsequenceUrl(consequence.consequenceType),
                            disruption.disruptionId,
                            consequence.consequenceIndex,
                            true,
                            isDisruptionDetail,
                            isTemplate,
                        ),
                },
            ],
        });
    }
    if (consequence.consequenceType === "networkWide") {
        rows.push({
            header: "Disruption Area",
            cells: [
                {
                    value: consequence.disruptionArea ? [...consequence.disruptionArea].join(", ") : "N/A",
                },
                {
                    value:
                        isEditingAllowed &&
                        createChangeLink(
                            "disruption-area",
                            getConsequenceUrl(consequence.consequenceType),
                            disruption.disruptionId,
                            consequence.consequenceIndex,
                            true,
                            isDisruptionDetail,
                            isTemplate,
                        ),
                },
            ],
        });
    }

    rows.push(
        {
            header: "Advice to display",
            cells: [
                {
                    value: consequence.description,
                },
                {
                    value:
                        isEditingAllowed &&
                        createChangeLink(
                            "advice-to-display",
                            getConsequenceUrl(consequence.consequenceType),
                            disruption.disruptionId,
                            consequence.consequenceIndex,
                            true,
                            isDisruptionDetail,
                            isTemplate,
                        ),
                },
            ],
        },
        {
            header: "Remove from journey planner",
            cells: [
                {
                    value: splitCamelCaseToString(consequence.removeFromJourneyPlanners),
                },
                {
                    value:
                        isEditingAllowed &&
                        createChangeLink(
                            "remove-from-journey-planners",
                            getConsequenceUrl(consequence.consequenceType),
                            disruption.disruptionId,
                            consequence.consequenceIndex,
                            true,
                            isDisruptionDetail,
                            isTemplate,
                        ),
                },
            ],
        },
        {
            header: "Disruption delay",
            cells: [
                {
                    value: consequence.disruptionDelay ? `${consequence.disruptionDelay} minutes` : "N/A",
                },
                {
                    value:
                        isEditingAllowed &&
                        createChangeLink(
                            "disruption-delay",
                            getConsequenceUrl(consequence.consequenceType),
                            disruption.disruptionId,
                            consequence.consequenceIndex,
                            true,
                            isDisruptionDetail,
                            isTemplate,
                        ),
                },
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
    isTemplate?: boolean;
    isEditingAllowed: boolean;
}

const ReviewConsequenceTable = ({
    consequence,
    disruption,
    deleteActionHandler,
    isDisruptionDetail,
    isTemplate,
    isEditingAllowed,
}: ReviewConsequenceTableProps): ReactElement => {
    const hiddenInputs = [
        {
            name: "id",
            value: consequence.consequenceIndex.toString(),
        },
        {
            name: "disruptionId",
            value: disruption.disruptionId,
        },
    ];

    if (isDisruptionDetail) {
        hiddenInputs.push({
            name: "inEdit",
            value: "true",
        });
    }
    return (
        <>
            <Table rows={getRows(consequence, disruption, isEditingAllowed, isDisruptionDetail, isTemplate)} />
            {isEditingAllowed && (
                <>
                    <button
                        key={consequence.consequenceIndex}
                        className="govuk-button govuk-button--warning mt-4"
                        data-module="govuk-button"
                        onClick={(e) => {
                            e.preventDefault();
                            deleteActionHandler("consequence", hiddenInputs);
                        }}
                    >
                        Delete consequence
                    </button>
                    <button
                        key={`duplicate-${consequence.consequenceIndex}`}
                        className={`govuk-button govuk-button--secondary mt-4 ml-4${
                            disruption.consequences && disruption.consequences.length >= MAX_CONSEQUENCES
                                ? " pointer-events-none govuk-button--disabled"
                                : ""
                        }`}
                        data-module="govuk-button"
                        formAction={`/api/duplicate-consequence?consequenceId=${consequence.consequenceIndex}&return=${
                            isDisruptionDetail ? DISRUPTION_DETAIL_PAGE_PATH : REVIEW_DISRUPTION_PAGE_PATH
                        }${isTemplate ? "&template=true" : ""}`}
                    >
                        Duplicate consequence
                    </button>
                </>
            )}
        </>
    );
};

export default ReviewConsequenceTable;
