import startCase from "lodash/startCase";
import { NextPageContext } from "next";
import Link from "next/link";
import { parseCookies } from "nookies";
import { ReactElement, useEffect, useRef, useState } from "react";
import DeleteConfirmationPopup from "../../components/DeleteConfirmationPopup";
import CsrfForm from "../../components/form/CsrfForm";
import Table from "../../components/form/Table";
import { BaseLayout } from "../../components/layout/Layout";
import {
    CONSEQUENCE_TYPES,
    COOKIES_DISRUPTION_DETAIL_REFERER,
    DISRUPTION_DETAIL_PAGE_PATH,
    TYPE_OF_CONSEQUENCE_PAGE_PATH,
    VEHICLE_MODES,
} from "../../constants";
import { getDisruptionById } from "../../data/dynamo";
import { Consequence } from "../../schemas/consequence.schema";
import { Validity } from "../../schemas/create-disruption.schema";
import { Disruption } from "../../schemas/disruption.schema";
import { getDisplayByValue, splitCamelCaseToString } from "../../utils";
import { setCookieOnResponseObject } from "../../utils/apiUtils";
import { formatTime } from "../../utils/dates";

const description = "Disruption Detail page for the Create Transport Disruptions Service";

interface DisruptionDetailProps {
    disruption: Disruption;
    redirect: string;
    csrfToken?: string;
}

const DisruptionDetail = ({ disruption, redirect, csrfToken }: DisruptionDetailProps): ReactElement => {
    const displayCancelButton = disruption.publishStatus === "EDITING";

    const title =
        disruption.publishStatus === "EDITING"
            ? "Review your answers before submitting your changes"
            : "Disruption Overview";

    const hasInitialised = useRef(false);

    const [popUpState, setPopUpState] = useState<{ name: string; hiddenInputs: { name: string; value: string }[] }>();
    const cancelActionHandler = (): void => {
        setPopUpState(undefined);
    };
    const deleteActionHandler = (name: string, hiddenInputs: { name: string; value: string }[]): void => {
        setPopUpState({ name, hiddenInputs });
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
                query: includePreviousPage ? { return: DISRUPTION_DETAIL_PAGE_PATH } : null,
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
            <CsrfForm action="/api/publish-edit" method="post" csrfToken={csrfToken}>
                <>
                    <div className="govuk-form-group">
                        <h1 className="govuk-heading-xl">{title}</h1>
                        <Link className="govuk-link" href="/view-disruption-history">
                            <h1 className="govuk-heading-s text-govBlue">View disruption history</h1>
                        </Link>
                        <br />
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
                                                                    {
                                                                        name: "inEdit",
                                                                        value: "true",
                                                                    },
                                                                ]);
                                                            }}
                                                        >
                                                            Delete consequence
                                                        </button>,
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
                            href={{
                                pathname: `${TYPE_OF_CONSEQUENCE_PAGE_PATH}/${disruption.disruptionId}/${
                                    disruption.consequences?.length ?? 0
                                }`,
                                query: { return: DISRUPTION_DETAIL_PAGE_PATH },
                            }}
                            className="govuk-button mt-2 govuk-button--secondary"
                        >
                            Add another consequence
                        </Link>

                        <br />

                        <input type="hidden" name="disruptionId" value={disruption.disruptionId} />

                        {!displayCancelButton ? (
                            <Link role="button" href={redirect} className="govuk-button mt-8 govuk-button">
                                Close and Return
                            </Link>
                        ) : (
                            <>
                                <button className="govuk-button mt-8" data-module="govuk-button">
                                    Publish disruption
                                </button>

                                <button
                                    className="govuk-button govuk-button--secondary mt-8 ml-5"
                                    data-module="govuk-button"
                                    formAction="/api/cancel-changes"
                                >
                                    Cancel all changes
                                </button>
                            </>
                        )}
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
                    </div>
                </>
            </CsrfForm>
        </BaseLayout>
    );
};

export const getServerSideProps = async (ctx: NextPageContext): Promise<{ props: DisruptionDetailProps } | void> => {
    const disruption = await getDisruptionById(ctx.query.disruptionId?.toString() ?? "");

    const cookies = parseCookies(ctx);

    const referer = (ctx.query.return as string) || cookies[COOKIES_DISRUPTION_DETAIL_REFERER];

    if (ctx.res && ctx.query.return) {
        setCookieOnResponseObject(COOKIES_DISRUPTION_DETAIL_REFERER, referer, ctx.res);
    }

    if (!disruption) {
        throw new Error("Disruption not found for disruption detail page");
    }

    return {
        props: {
            disruption: disruption,
            redirect: referer,
        },
    };
};

export default DisruptionDetail;
