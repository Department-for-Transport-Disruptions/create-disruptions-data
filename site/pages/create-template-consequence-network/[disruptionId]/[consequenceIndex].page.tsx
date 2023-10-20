import { NetworkConsequence } from "@create-disruptions-data/shared-ts/disruptionTypes";
import { networkConsequenceSchema } from "@create-disruptions-data/shared-ts/disruptionTypes.zod";
import { PublishStatus } from "@create-disruptions-data/shared-ts/enums";
import { NextPageContext, Redirect } from "next";
import Link from "next/link";
import { parseCookies } from "nookies";
import { ReactElement, useState } from "react";
import DeleteTemplateButton from "../../../components/buttons/DeleteTemplateButton";
import CsrfForm from "../../../components/form/CsrfForm";
import ErrorSummary from "../../../components/form/ErrorSummary";
import Radios from "../../../components/form/Radios";
import Select from "../../../components/form/Select";
import Table from "../../../components/form/Table";
import TextInput from "../../../components/form/TextInput";
import TimeSelector from "../../../components/form/TimeSelector";
import { BaseLayout } from "../../../components/layout/Layout";
import { createChangeLink } from "../../../components/ReviewConsequenceTable";
import {
    COOKIES_TEMPLATE_CONSEQUENCE_NETWORK_ERRORS,
    DISRUPTION_NOT_FOUND_ERROR_PAGE,
    DISRUPTION_SEVERITIES,
    TEMPLATE_OVERVIEW_PAGE_PATH,
    REVIEW_TEMPLATE_PAGE_PATH,
    TYPE_OF_CONSEQUENCE_PAGE_PATH,
    VEHICLE_MODES,
} from "../../../constants";
import { getTemplateById } from "../../../data/dynamo";
import { CreateConsequenceProps, PageState } from "../../../interfaces";
import { isNetworkConsequence } from "../../../utils";
import { destroyCookieOnResponseObject, getPageState } from "../../../utils/apiUtils";
import { getSession } from "../../../utils/apiUtils/auth";
import { getStateUpdater } from "../../../utils/formUtils";

const title = "Create Template Consequence Network";
const description = "Create Template Consequence Network page for the Create Transport Disruptions Service";

export interface CreateConsequenceNetworkProps extends PageState<Partial<NetworkConsequence>>, CreateConsequenceProps {}

const CreateTemplateConsequenceNetwork = (props: CreateConsequenceNetworkProps): ReactElement => {
    const [pageState, setConsequenceNetworkPageState] = useState<PageState<Partial<NetworkConsequence>>>(props);

    const stateUpdater = getStateUpdater(setConsequenceNetworkPageState, pageState);

    const isEditing =
        props.disruptionStatus === PublishStatus.editing ||
        props.disruptionStatus === PublishStatus.editPendingApproval ||
        props.disruptionStatus === PublishStatus.pendingAndEditing;

    const displayCancelButton = isEditing || props.inputs.description;
    const returnPath =
        props.disruptionStatus !== PublishStatus.draft ? TEMPLATE_OVERVIEW_PAGE_PATH : REVIEW_TEMPLATE_PAGE_PATH;

    return (
        <BaseLayout title={title} description={description}>
            <CsrfForm action="/api/create-template-consequence-network" method="post" csrfToken={props.csrfToken}>
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
                                            true,
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
                                    props.disruptionDescription
                                        ? stateUpdater(props.disruptionDescription, "description")
                                        : "";
                                }}
                            >
                                <p className="text-govBlue govuk-body-m">Copy from disruption description</p>
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
                                href={`${returnPath}/${pageState.disruptionId || ""}`}
                                className="govuk-button mt-8 ml-5 govuk-button--secondary"
                            >
                                Cancel Changes
                            </Link>
                        ) : null}

                        <DeleteTemplateButton
                            templateId={props.disruptionId}
                            csrfToken={props.csrfToken}
                            buttonClasses="mt-8"
                        />

                        {(props.consequenceIndex || 0) <= 10 && (
                            <button
                                formAction="/api/create-consequence-network?addAnotherConsequence=true"
                                className="govuk-button mt-8 ml-5 govuk-button--secondary"
                                data-module="govuk-button"
                            >
                                Add another consequence
                            </button>
                        )}
                    </div>
                </>
            </CsrfForm>
        </BaseLayout>
    );
};

export const getServerSideProps = async (
    ctx: NextPageContext,
): Promise<{ props: object } | { redirect: Redirect } | void> => {
    const cookies = parseCookies(ctx);
    const errorCookie = cookies[COOKIES_TEMPLATE_CONSEQUENCE_NETWORK_ERRORS];

    if (!ctx.req) {
        throw new Error("No context request");
    }

    const session = getSession(ctx.req);

    if (!session) {
        throw new Error("No session found");
    }

    const template = await getTemplateById(ctx.query.disruptionId?.toString() ?? "", session.orgId);

    if (!template) {
        return {
            redirect: {
                destination: `${DISRUPTION_NOT_FOUND_ERROR_PAGE}?template=true`,
                statusCode: 302,
            },
        };
    }

    const index = ctx.query.consequenceIndex ? Number(ctx.query.consequenceIndex) : 0;

    const consequence = template?.consequences?.find((c) => c.consequenceIndex === index);

    const pageState = getPageState<NetworkConsequence>(
        errorCookie,
        networkConsequenceSchema,
        template.disruptionId,
        consequence && isNetworkConsequence(consequence) ? consequence : undefined,
    );

    if (ctx.res) destroyCookieOnResponseObject(COOKIES_TEMPLATE_CONSEQUENCE_NETWORK_ERRORS, ctx.res);

    return {
        props: {
            ...pageState,
            consequenceIndex: index,
            disruptionDescription: template.description || "",
            template: template.template?.toString() || "",
            disruptionStatus: template.publishStatus,
        },
    };
};

export default CreateTemplateConsequenceNetwork;
