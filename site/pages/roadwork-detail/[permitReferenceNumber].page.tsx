import { PublishStatus } from "@create-disruptions-data/shared-ts/enums";
import { Roadwork } from "@create-disruptions-data/shared-ts/roadwork.zod";
import { NextPageContext } from "next";
import Link from "next/link";
import { randomUUID } from "crypto";
import Table from "../../components/form/Table";
import { BaseLayout } from "../../components/layout/Layout";
import { getDisruptionInfoByPermitReferenceNumber } from "../../data/dynamo";
import { fetchRoadworkById } from "../../data/refDataApi";
import { toTitleCase } from "../../utils";
import { getSession } from "../../utils/apiUtils/auth";
import { convertDateTimeToFormat } from "../../utils/dates";

const title = "View Roadwork Detail";
const description = "Roadwork detail page for the Create Transport Disruptions Service";

interface RoadworkDetailProps {
    roadwork: Roadwork;
    newDisruptionId: string;
    disruptionId?: string;
    disruptionPublishStatus?: PublishStatus;
    isOperatorUser: boolean;
}

const getRows = (roadwork: Roadwork) => {
    return [
        { header: "Street name", cells: [toTitleCase(roadwork.streetName ?? "")] },
        { header: "Area name", cells: [toTitleCase(roadwork.areaName ?? "Not provided")] },
        { header: "Highway authority", cells: [toTitleCase(roadwork.highwayAuthority ?? "Not Provided")] },
        { header: "Work category", cells: [roadwork.workCategory ?? "Not provided"] },
        { header: "Activity type", cells: [roadwork.activityType ?? "Not provided"] },
        { header: "Traffic management type", cells: [roadwork.trafficManagementType] },
        { header: "Start date", cells: [`${convertDateTimeToFormat(roadwork.actualStartDateTime ?? "")}`] },
        { header: "Start time", cells: [`${convertDateTimeToFormat(roadwork.actualStartDateTime ?? "", "HH:mm")}`] },
        { header: "Proposed end date", cells: [`${convertDateTimeToFormat(roadwork.proposedEndDateTime ?? "")}`] },
        {
            header: "Proposed end time",
            cells: [`${convertDateTimeToFormat(roadwork.proposedEndDateTime ?? "", "HH:mm")}`],
        },
        { header: "Permit reference number", cells: [roadwork.permitReferenceNumber] },
        {
            header: "Roadwork last updated",
            cells: [`${convertDateTimeToFormat(roadwork.lastUpdatedDateTime ?? "", "DD/MM/YY HH:mm")}`],
        },
    ];
};

const getRoadworkQueryParam = (roadwork: Roadwork) => {
    const roadworkSummary = `${toTitleCase(roadwork.streetName ?? "")} - ${roadwork.activityType}`;
    return `?permitReferenceNumber=${encodeURIComponent(
        roadwork.permitReferenceNumber,
    )}&roadworkStartDateTime=${encodeURIComponent(
        roadwork.actualStartDateTime ?? "",
    )}&roadworkEndDateTime=${encodeURIComponent(
        roadwork.proposedEndDateTime ?? "",
    )}&roadworkSummary=${encodeURIComponent(roadworkSummary)}`;
};

const RoadworkDetail = ({
    roadwork,
    newDisruptionId,
    disruptionId,
    disruptionPublishStatus,
    isOperatorUser,
}: RoadworkDetailProps) => {
    return (
        <BaseLayout title={title} description={description}>
            <h1 className="govuk-heading-xl">Roadworks in your area</h1>
            <h2 className="govuk-heading-m">
                {roadwork?.streetName} - {roadwork?.activityType}
            </h2>
            <Table rows={getRows(roadwork)} />
            {!disruptionId && !isOperatorUser && (
                <Link
                    href={`/create-disruption/${newDisruptionId}${getRoadworkQueryParam(roadwork)}`}
                    role="button"
                    draggable="false"
                    className="govuk-button mt-8 mr-5"
                    data-module="govuk-button"
                    id="create-new-button"
                >
                    Create disruption
                </Link>
            )}

            {disruptionId && disruptionPublishStatus === PublishStatus.published && (
                <Link
                    href={`/disruption-detail/${disruptionId}`}
                    role="button"
                    draggable="false"
                    className="govuk-button mt-8 mr-5"
                    data-module="govuk-button"
                    id="view-disruption-button"
                >
                    View disruption
                </Link>
            )}

            {disruptionId && !isOperatorUser && disruptionPublishStatus === PublishStatus.draft && (
                <Link
                    href={`/review-disruption/${disruptionId}`}
                    role="button"
                    draggable="false"
                    className="govuk-button mt-8 mr-5"
                    data-module="govuk-button"
                    id="view-draft-disruption-button"
                >
                    View draft disruption
                </Link>
            )}

            <Link
                href={`/view-all-roadworks`}
                role="button"
                draggable="false"
                className="govuk-button mt-8 govuk-button--secondary"
                data-module="govuk-button"
                id="return-roadworks-overview-button"
            >
                Return to roadworks
            </Link>
        </BaseLayout>
    );
};

export const getServerSideProps = async (
    ctx: NextPageContext,
): Promise<{ props: RoadworkDetailProps } | { notFound: boolean }> => {
    const newDisruptionId = randomUUID();

    if (!ctx.req) {
        throw new Error("No context request");
    }

    const session = getSession(ctx.req);

    if (!session) {
        throw new Error("No session found");
    }

    const permitReferenceNumber = decodeURIComponent(ctx.query.permitReferenceNumber?.toString() ?? "");

    const roadwork = await fetchRoadworkById({ permitReferenceNumber });

    if (!roadwork) {
        return {
            notFound: true,
        };
    }

    const disruptionInfoForRoadwork = await getDisruptionInfoByPermitReferenceNumber(
        permitReferenceNumber,
        session.orgId,
    );

    if (!disruptionInfoForRoadwork) {
        return {
            props: {
                roadwork: roadwork,
                newDisruptionId,
                isOperatorUser: session.isOperatorUser,
            },
        };
    }
    return {
        props: {
            roadwork: roadwork,
            newDisruptionId,
            disruptionId: disruptionInfoForRoadwork.disruptionId,
            disruptionPublishStatus: disruptionInfoForRoadwork.publishStatus,
            isOperatorUser: session.isOperatorUser,
        },
    };
};

export default RoadworkDetail;
