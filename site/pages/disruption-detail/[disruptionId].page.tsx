import startCase from "lodash/startCase";
import { NextPageContext } from "next";
import Link from "next/link";
import { parseCookies } from "nookies";
import { ReactElement, useEffect, useRef } from "react";
import CsrfForm from "../../components/form/CsrfForm";
import Table from "../../components/form/Table";
import { BaseLayout } from "../../components/layout/Layout";
import {
    CONSEQUENCE_TYPES,
    COOKIES_DISRUPTION_DETAIL_REFERER,
    COOKIE_DISRUPTION_DETAIL_STATE,
    DASHBOARD_PAGE_PATH,
    DISRUPTION_DETAIL_PAGE_PATH,
    TYPE_OF_CONSEQUENCE_PAGE_PATH,
    VEHICLE_MODES,
    VIEW_ALL_DISRUPTIONS_PAGE_PATH,
} from "../../constants";
import { getDisruptionById } from "../../data/dynamo";
import { DisruptionDetailCookie } from "../../interfaces";
import { Consequence } from "../../schemas/consequence.schema";
import { Validity } from "../../schemas/create-disruption.schema";
import { Disruption } from "../../schemas/disruption.schema";
import { getDisplayByValue, splitCamelCaseToString } from "../../utils";
import { destroyCookieOnResponseObject, setCookieOnResponseObject } from "../../utils/apiUtils";
import { formatTime } from "../../utils/dates";

const description = "Disruption Detail page for the Create Transport Disruptions Service";

interface DisruptionDetailProps {
    disruption: Disruption;
    redirectCookie: DisruptionDetailCookie;
    csrfToken?: string;
}

const DisruptionDetail = ({ disruption, redirectCookie, csrfToken }: DisruptionDetailProps): ReactElement => {
    const displayCancelButton = redirectCookie.state && redirectCookie.state === "cancel" ? true : false;

    const title = displayCancelButton ? "Disruption Overview" : "Review your answers before submitting your changes";

    const hasInitialised = useRef(false);

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
            <CsrfForm action="/api/publish" method="post" csrfToken={csrfToken}>
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
                                            ]}
                                        />
                                        <Link role="button" href={""} className="govuk-button govuk-button--warning">
                                            Delete Consequence
                                        </Link>
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

                        <input type="hidden" name="disruptionId" value={disruption.disruptionId} />

                        {displayCancelButton ? (
                            <Link
                                role="button"
                                href={`${redirectCookie.referer}`}
                                className="govuk-button mt-8 govuk-button"
                            >
                                Cancel Changes
                            </Link>
                        ) : (
                            <button className="govuk-button mt-8" data-module="govuk-button">
                                Publish disruption
                            </button>
                        )}
                    </div>
                </>
            </CsrfForm>
        </BaseLayout>
    );
};

export const getServerSideProps = async (ctx: NextPageContext): Promise<{ props: DisruptionDetailProps } | void> => {
    const disruption = await getDisruptionById(ctx.query.disruptionId?.toString() ?? "");

    const referer = ctx.req?.headers.referer;

    const cookies = parseCookies(ctx);
    const ddCookieReferer = cookies[COOKIES_DISRUPTION_DETAIL_REFERER];
    const ddCookieState = cookies[COOKIE_DISRUPTION_DETAIL_STATE];

    const ddCookie: DisruptionDetailCookie = {
        referer: DASHBOARD_PAGE_PATH,
        state: ddCookieState ? ddCookieState : "cancel",
    };

    if (referer?.includes(VIEW_ALL_DISRUPTIONS_PAGE_PATH) || referer?.includes(DASHBOARD_PAGE_PATH)) {
        if (ctx.res) {
            destroyCookieOnResponseObject(COOKIES_DISRUPTION_DETAIL_REFERER, ctx.res);

            setCookieOnResponseObject(COOKIES_DISRUPTION_DETAIL_REFERER, referer, ctx.res);
        }
    } else {
        if (ddCookieReferer) ddCookie.referer = ddCookieReferer;
    }

    if (!disruption) {
        throw new Error("Disruption not found for review page");
    }

    return {
        props: {
            disruption: disruption,
            redirectCookie: ddCookie,
        },
    };
};

export default DisruptionDetail;
