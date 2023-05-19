import { NextPageContext } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { parseCookies } from "nookies";
import { Fragment, ReactElement, useState } from "react";
import ErrorSummary from "../../components/ErrorSummary";
import CsrfForm from "../../components/form/CsrfForm";
import Radios from "../../components/form/Radios";
import { BaseLayout, TwoThirdsLayout } from "../../components/layout/Layout";
import {
    COOKIES_CONSEQUENCE_TYPE_ERRORS,
    CONSEQUENCE_TYPES,
    REVIEW_DISRUPTION_PAGE_PATH,
    DISRUPTION_DETAIL_PAGE_PATH,
} from "../../constants/index";
import { getDisruptionById } from "../../data/dynamo";
import { PageState } from "../../interfaces/index";
import { ConsequenceType, typeOfConsequenceSchema } from "../../schemas/type-of-consequence.schema";
import { destroyCookieOnResponseObject, getPageState } from "../../utils/apiUtils";
import { getSession } from "../../utils/apiUtils/auth";
import { getStateUpdater } from "../../utils/formUtils";
import { History } from "../../schemas/disruption.schema";
import Table from "../../components/form/Table";
import { getDate, getDaysInPast } from "../../utils/dates";

const title = "Disruption history";
const description = "Disruption history page for the Create Transport Disruptions Service";

export interface DisruptionHistoryPageProps {
    history: History[];
    disruptionId: string;
}

const DisruptionHistory = ({ history, disruptionId }: DisruptionHistoryPageProps): ReactElement => {
    return (
        <BaseLayout title={title} description={description}>
            <h1 className="govuk-heading-xl">{title}</h1>
            <Table
                rows={history.map((item) => {
                    const daysInPast = getDaysInPast(item.datetime);

                    return {
                        cells: [
                            <Fragment key={item.datetime}>
                                <h2 className="govuk-heading-s mb-3">
                                    {item.user}, {daysInPast} day{daysInPast === 1 ? "" : "s"} ago
                                </h2>
                                {item.historyItems.map((historyItem, index2) => (
                                    <p className="govuk-body mb-0" key={`${historyItem}-${index2}`}>
                                        {historyItem}
                                    </p>
                                ))}
                            </Fragment>,
                            <p className="text-right" key={`${item.datetime}-1`}>
                                {getDate(item.datetime).format("DD/MM/YYYY HH:mm")}
                            </p>,
                        ],
                    };
                })}
            />
            <Link
                role="button"
                href={`${DISRUPTION_DETAIL_PAGE_PATH}/${disruptionId}`}
                className="govuk-button mt-8 govuk-button govuk-button--secondary"
            >
                Back to details
            </Link>
        </BaseLayout>
    );
};

export const getServerSideProps = async (
    ctx: NextPageContext,
): Promise<{ props: DisruptionHistoryPageProps } | void> => {
    if (!ctx.req) {
        throw new Error("No context request");
    }

    const session = getSession(ctx.req);

    if (!session) {
        throw new Error("No session found");
    }

    const disruption = await getDisruptionById(ctx.query.disruptionId?.toString() ?? "", session.orgId);

    if (!disruption) {
        throw new Error("Disruption not found for disruption history page");
    }

    return {
        props: {
            history: disruption.history ? disruption.history.sort((a, b) => -a.datetime.localeCompare(b.datetime)) : [],
            disruptionId: disruption.disruptionId,
        },
    };
};

export default DisruptionHistory;
