import { NetworkConsequence } from "@create-disruptions-data/shared-ts/disruptionTypes";
import { networkConsequenceSchema } from "@create-disruptions-data/shared-ts/disruptionTypes.zod";
import { NextPageContext } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { parseCookies } from "nookies";
import { ReactElement, useState } from "react";
import DeleteDisruptionButton from "../../../components/buttons/DeleteDisruptionButton";
import CsrfForm from "../../../components/form/CsrfForm";
import ErrorSummary from "../../../components/form/ErrorSummary";
import Radios from "../../../components/form/Radios";
import Select from "../../../components/form/Select";
import Table from "../../../components/form/Table";
import TextInput from "../../../components/form/TextInput";
import TimeSelector from "../../../components/form/TimeSelector";
import { BaseLayout } from "../../../components/layout/Layout";
import {
    COOKIES_CONSEQUENCE_NETWORK_ERRORS,
    CREATE_CONSEQUENCE_NETWORK_PATH,
    DISRUPTION_DETAIL_PAGE_PATH,
    DISRUPTION_SEVERITIES,
    TYPE_OF_CONSEQUENCE_PAGE_PATH,
    VEHICLE_MODES,
} from "../../../constants";
import { getDisruptionById } from "../../../data/dynamo";
import { CreateConsequenceProps, PageState } from "../../../interfaces";
import { isNetworkConsequence } from "../../../utils";
import { destroyCookieOnResponseObject, getPageState } from "../../../utils/apiUtils";
import { getSession } from "../../../utils/apiUtils/auth";
import { getStateUpdater, returnTemplateOverview, showCancelButton } from "../../../utils/formUtils";
import { createChangeLink } from "../../../components/ReviewConsequenceTable";

const title = "Create Consequence Network";
const description = "Create Consequence Network page for the Create Transport Disruptions Service";

export interface CreateConsequenceNetworkProps extends PageState<Partial<NetworkConsequence>>, CreateConsequenceProps {}

const CreateConsequenceNetwork = (props: CreateConsequenceNetworkProps): ReactElement => {
    const [pageState, setConsequenceNetworkPageState] = useState<PageState<Partial<NetworkConsequence>>>(props);

    const stateUpdater = getStateUpdater(setConsequenceNetworkPageState, pageState);

    const queryParams = useRouter().query;
    const displayCancelButton = showCancelButton(queryParams);

    const returnToTemplateOverview = returnTemplateOverview(queryParams);

    const isTemplate = (queryParams["template"] as string) || "";

    return (
        <BaseLayout title={title} description={description}>
            <CsrfForm
                action={`/api/create-consequence-network${isTemplate ? "?template=true" : ""}`}
                method="post"
                csrfToken={props.csrfToken}
            >
                <>
                    <ErrorSummary errors={props.errors} />
                    <div className="govuk-form-group">
                        <h1 className="govuk-heading-xl">Add a consequence</h1>
                        <Table
                            rows={[
                                {
                                    header: "Consequence type",
                                    cells: [
                                        "Network wide",
                                        createChangeLink(
                                            "consequence-type",
                                            TYPE_OF_CONSEQUENCE_PAGE_PATH,
                                            pageState.disruptionId || "",
                                            pageState.consequenceIndex ?? 0,
                                            returnToTemplateOverview || !!queryParams["return"],
                                            returnToTemplateOverview ||
                                                queryParams["return"]?.includes(DISRUPTION_DETAIL_PAGE_PATH),
                                            !!isTemplate,
                                        ),
                                    ],
                                },
                            ]}
                        />

                        <Select<NetworkConsequence>
                            inputName="vehicleMode"
                            display="Mode of transport"
                            defaultDisplay="Select mode of transport"
                            selectValues={VEHICLE_MODES}
                            stateUpdater={stateUpdater}
                            value={pageState.inputs.vehicleMode}
                            initialErrors={pageState.errors}
                            displaySize="l"
                        />

                        <TextInput<NetworkConsequence>
                            display="Consequence description"
                            displaySize="l"
                            hint="What advice would you like to display?"
                            inputName="description"
                            widthClass="w-3/4"
                            textArea
                            rows={3}
                            maxLength={1000}
                            stateUpdater={stateUpdater}
                            value={pageState.inputs.description}
                            initialErrors={pageState.errors}
                        />

                        {!pageState.inputs.description ||
                        (pageState.inputs && pageState.inputs.description.length === 0) ? (
                            <button
                                className="mt-3 govuk-link"
                                data-module="govuk-button"
                                onClick={() => {
                                    props.disruptionSummary ? stateUpdater(props.disruptionSummary, "description") : "";
                                }}
                            >
                                <p className="text-govBlue govuk-body-m">Copy from disruption summary</p>
                            </button>
                        ) : null}

                        <Radios<NetworkConsequence>
                            display="Remove from journey planners"
                            displaySize="l"
                            radioDetail={[
                                {
                                    value: "yes",
                                    display: "Yes",
                                },
                                {
                                    value: "no",
                                    display: "No",
                                },
                            ]}
                            inputName="removeFromJourneyPlanners"
                            stateUpdater={stateUpdater}
                            value={pageState.inputs.removeFromJourneyPlanners}
                            initialErrors={pageState.errors}
                        />

                        <TimeSelector<NetworkConsequence>
                            display="Delay (optional)"
                            hint="Enter time in minutes"
                            displaySize="l"
                            value={pageState.inputs.disruptionDelay}
                            disabled={false}
                            inputName="disruptionDelay"
                            stateUpdater={stateUpdater}
                            initialErrors={pageState.errors}
                            placeholderValue=""
                        />

                        <Select<NetworkConsequence>
                            inputName="disruptionSeverity"
                            display="Disruption severity"
                            displaySize="l"
                            defaultDisplay="Select severity"
                            selectValues={DISRUPTION_SEVERITIES}
                            stateUpdater={stateUpdater}
                            value={pageState.inputs.disruptionSeverity}
                            initialErrors={pageState.errors}
                        />

                        <input type="hidden" name="consequenceType" value="networkWide" />
                        <input type="hidden" name="disruptionId" value={props.disruptionId} />
                        <input type="hidden" name="consequenceIndex" value={props.consequenceIndex} />

                        <button className="govuk-button mt-8" data-module="govuk-button">
                            Save and continue
                        </button>

                        {displayCancelButton && pageState.disruptionId ? (
                            <Link
                                role="button"
                                href={
                                    returnToTemplateOverview
                                        ? (queryParams["return"] as string)
                                        : `${queryParams["return"] as string}/${pageState.disruptionId}${
                                              isTemplate ? "?template=true" : ""
                                          }`
                                }
                                className="govuk-button mt-8 ml-5 govuk-button--secondary"
                            >
                                Cancel Changes
                            </Link>
                        ) : null}
                        {!isTemplate && (
                            <button
                                className="govuk-button mt-8 ml-5 govuk-button--secondary"
                                data-module="govuk-button"
                                formAction={`/api${CREATE_CONSEQUENCE_NETWORK_PATH}?draft=true`}
                            >
                                Save as draft
                            </button>
                        )}
                        <DeleteDisruptionButton
                            disruptionId={props.disruptionId}
                            csrfToken={props.csrfToken}
                            buttonClasses="mt-8"
                            isTemplate={isTemplate}
                        />
                    </div>
                </>
            </CsrfForm>
        </BaseLayout>
    );
};

export const getServerSideProps = async (ctx: NextPageContext): Promise<{ props: object } | void> => {
    const cookies = parseCookies(ctx);
    const errorCookie = cookies[COOKIES_CONSEQUENCE_NETWORK_ERRORS];

    if (!ctx.req) {
        throw new Error("No context request");
    }

    const session = getSession(ctx.req);

    if (!session) {
        throw new Error("No session found");
    }

    const disruption = await getDisruptionById(
        ctx.query.disruptionId?.toString() ?? "",
        session.orgId,
        !!ctx.query.template,
    );

    if (!disruption) {
        throw new Error("No disruption found for network consequence page");
    }

    const index = ctx.query.consequenceIndex ? Number(ctx.query.consequenceIndex) : 0;

    const consequence = disruption?.consequences?.find((c) => c.consequenceIndex === index);

    const pageState = getPageState<NetworkConsequence>(
        errorCookie,
        networkConsequenceSchema,
        disruption.disruptionId,
        consequence && isNetworkConsequence(consequence) ? consequence : undefined,
    );

    if (ctx.res) destroyCookieOnResponseObject(COOKIES_CONSEQUENCE_NETWORK_ERRORS, ctx.res);

    return {
        props: {
            ...pageState,
            consequenceIndex: index,
            disruptionSummary: disruption.description || "",
            template: disruption.template?.toString() || "",
        },
    };
};

export default CreateConsequenceNetwork;
