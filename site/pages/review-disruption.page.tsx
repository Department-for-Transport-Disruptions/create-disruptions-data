/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import dayjs from "dayjs";
import { NextPageContext } from "next";
import Link from "next/link";
import { parseCookies } from "nookies";
import { ReactElement } from "react";
import { DisruptionPageInputs } from "./create-disruption.page";
import Table from "../components/form/Table";
import { BaseLayout } from "../components/layout/Layout";

const title = "Review Disruption";
const description = "Review Disruption page for the Create Transport Disruptions Service";

interface CreateConsequenceOperatorProps {
    previousDisruptionInformation: DisruptionPageInputs;
}

const CreateConsequenceOperator = ({ previousDisruptionInformation }: CreateConsequenceOperatorProps): ReactElement => {
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
        props: { previousDisruptionInformation },
    };
};

export default CreateConsequenceOperator;
