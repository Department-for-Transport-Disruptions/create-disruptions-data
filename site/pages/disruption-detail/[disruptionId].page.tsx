import startCase from "lodash/startCase";
import { NextPageContext } from "next";
import Link from "next/link";
import { parseCookies } from "nookies";
import { ReactElement, useEffect, useRef, useState } from "react";
import DeleteConfirmationPopup from "../../components/DeleteConfirmationPopup";
import CsrfForm from "../../components/form/CsrfForm";
import Table from "../../components/form/Table";
import { BaseLayout } from "../../components/layout/Layout";
import ReviewConsequenceTable, { createChangeLink } from "../../components/ReviewConsequenceTable";
import {
    COOKIES_DISRUPTION_DETAIL_REFERER,
    COOKIE_DISRUPTION_DETAIL_STATE,
    DASHBOARD_PAGE_PATH,
    DISRUPTION_DETAIL_PAGE_PATH,
    TYPE_OF_CONSEQUENCE_PAGE_PATH,
    VIEW_ALL_DISRUPTIONS_PAGE_PATH,
} from "../../constants";
import { getDisruptionById } from "../../data/dynamo";
import { DisruptionDetailCookie } from "../../interfaces";
import { Validity } from "../../schemas/create-disruption.schema";
import { Disruption } from "../../schemas/disruption.schema";
import { splitCamelCaseToString } from "../../utils";
import { destroyCookieOnResponseObject, setCookieOnResponseObject } from "../../utils/apiUtils";
import { formatTime } from "../../utils/dates";

const description = "Disruption Detail page for the Create Transport Disruptions Service";

interface DisruptionDetailProps {
    disruption: Disruption;
    redirectCookie: DisruptionDetailCookie;
    csrfToken?: string;
}

const DisruptionDetail = ({ disruption, redirectCookie, csrfToken }: DisruptionDetailProps): ReactElement => {
    const displayCancelButton = redirectCookie.state && redirectCookie.state === "cancel";

    const title = displayCancelButton ? "Disruption Overview" : "Review your answers before submitting your changes";

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
                    createChangeLink(
                        `validity-period-${i + 1}`,
                        "/create-disruption",
                        disruption,
                        undefined,
                        true,
                        true,
                    ),
                ],
            };
        });
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
                                        createChangeLink(
                                            "type-of-disruption",
                                            "/create-disruption",
                                            disruption,
                                            undefined,
                                            true,
                                            true,
                                        ),
                                    ],
                                },
                                {
                                    header: "Summary",
                                    cells: [
                                        disruption.summary,
                                        createChangeLink(
                                            "summary",
                                            "/create-disruption",
                                            disruption,
                                            undefined,
                                            true,
                                            true,
                                        ),
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
                                            isDisruptionDetail={true}
                                        />
                                        <Link
                                            role="button"
                                            href={`/disruption-detail/${consequence.disruptionId}/${consequence.consequenceIndex}`}
                                            className="govuk-button govuk-button--warning"
                                        >
                                            Delete consequence
                                        </Link>
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

                        {displayCancelButton ? (
                            <Link
                                role="button"
                                href={`${redirectCookie.referer}`}
                                className="govuk-button mt-8 govuk-button"
                            >
                                Close and Return
                            </Link>
                        ) : (
                            <button className="govuk-button mt-8" data-module="govuk-button">
                                Publish disruption
                            </button>
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
