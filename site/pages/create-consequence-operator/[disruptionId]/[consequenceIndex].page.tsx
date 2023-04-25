import { NextPageContext } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { parseCookies } from "nookies";
import { ReactElement, useState } from "react";
import { z } from "zod";
import ErrorSummary from "../../../components/ErrorSummary";
import CsrfForm from "../../../components/form/CsrfForm";
import Radios from "../../../components/form/Radios";
import Select from "../../../components/form/Select";
import Table from "../../../components/form/Table";
import TextInput from "../../../components/form/TextInput";
import TimeSelector from "../../../components/form/TimeSelector";
import { BaseLayout } from "../../../components/layout/Layout";
import OperatorSearch from "../../../components/OperatorSearch";
import {
    ADMIN_AREA_CODE,
    API_BASE_URL,
    COOKIES_CONSEQUENCE_OPERATOR_ERRORS,
    DISRUPTION_SEVERITIES,
    REVIEW_DISRUPTION_PAGE_PATH,
    VEHICLE_MODES,
} from "../../../constants";
import { getDisruptionById } from "../../../data/dynamo";
import { CreateConsequenceProps, PageState } from "../../../interfaces";
import {
    Operator,
    OperatorConsequence,
    operatorConsequenceSchema,
    operatorSchema,
} from "../../../schemas/consequence.schema";
import { isOperatorConsequence } from "../../../utils";
import { destroyCookieOnResponseObject, getPageState } from "../../../utils/apiUtils";
import { getStateUpdater } from "../../../utils/formUtils";

const title = "Create Consequence Operator";
const description = "Create Consequence Operator page for the Create Transport Disruptions Service";

export interface CreateConsequenceOperatorProps
    extends PageState<Partial<OperatorConsequence>>,
        CreateConsequenceProps {
    operators: Operator[];
}

const CreateConsequenceOperator = (props: CreateConsequenceOperatorProps): ReactElement => {
    const [pageState, setConsequenceOperatorPageState] = useState<PageState<Partial<OperatorConsequence>>>(props);

    const stateUpdater = getStateUpdater(setConsequenceOperatorPageState, pageState);

    const queryParams = useRouter().query;

    return (
        <BaseLayout title={title} description={description}>
            <CsrfForm action="/api/create-consequence-operator" method="post" csrfToken={props.csrfToken}>
                <>
                    <ErrorSummary errors={props.errors} />
                    <div className="govuk-form-group">
                        <h1 className="govuk-heading-xl">Add a consequence</h1>
                        <Table
                            rows={[
                                {
                                    header: "Consequence type",
                                    cells: [
                                        "Operator wide",
                                        <Link
                                            key={"consequence-type"}
                                            className="govuk-link"
                                            href="/type-of-consequence"
                                        >
                                            Change
                                        </Link>,
                                    ],
                                },
                            ]}
                        />

                        <Select<OperatorConsequence>
                            inputName="vehicleMode"
                            display="Mode of transport"
                            defaultDisplay="Select mode of transport"
                            selectValues={VEHICLE_MODES}
                            stateUpdater={stateUpdater}
                            value={pageState.inputs.vehicleMode}
                            initialErrors={pageState.errors}
                            schema={operatorConsequenceSchema.shape.vehicleMode}
                            displaySize="l"
                        />

                        <OperatorSearch
                            display="Operators impacted"
                            displaySize="l"
                            operators={props.operators.filter(
                                (op) =>
                                    !(pageState.inputs.consequenceOperators || []).find(
                                        (selOp) => selOp === op.nocCode,
                                    ),
                            )}
                            selectedOperatorNocs={pageState.inputs.consequenceOperators || []}
                            stateUpdater={stateUpdater}
                            initialErrors={pageState.inputs.consequenceOperators?.length === 0 ? pageState.errors : []}
                            inputName="consequenceOperators"
                        />

                        {pageState.inputs.consequenceOperators && pageState.inputs.consequenceOperators.length > 0 ? (
                            <Table
                                rows={pageState.inputs.consequenceOperators.map((selOpNoc) => {
                                    return {
                                        cells: [
                                            props.operators.find((op) => op.nocCode === selOpNoc)?.operatorPublicName,
                                            selOpNoc,
                                            <button
                                                key={selOpNoc}
                                                className="govuk-link"
                                                onClick={() => {
                                                    const selectedOperatorsWithRemoved =
                                                        pageState.inputs.consequenceOperators?.filter(
                                                            (opNoc) => opNoc !== selOpNoc,
                                                        ) || [];
                                                    stateUpdater(selectedOperatorsWithRemoved, "consequenceOperators");
                                                }}
                                            >
                                                Remove
                                            </button>,
                                        ],
                                    };
                                })}
                            />
                        ) : null}

                        <input
                            type="hidden"
                            name="consequenceOperators"
                            value={pageState.inputs.consequenceOperators}
                        />

                        <TextInput<OperatorConsequence>
                            display="Consequence description"
                            displaySize="l"
                            hint="What advice would you like to display?"
                            inputName="description"
                            widthClass="w-3/4"
                            textArea
                            rows={3}
                            maxLength={500}
                            stateUpdater={stateUpdater}
                            value={pageState.inputs.description}
                            initialErrors={pageState.errors}
                            schema={operatorConsequenceSchema.shape.description}
                        />

                        <Radios<OperatorConsequence>
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
                            schema={operatorConsequenceSchema.shape.removeFromJourneyPlanners}
                        />

                        <TimeSelector<OperatorConsequence>
                            display="Delay (minutes)"
                            displaySize="l"
                            value={pageState.inputs.disruptionDelay}
                            disabled={false}
                            inputName="disruptionDelay"
                            stateUpdater={stateUpdater}
                            initialErrors={pageState.errors}
                            schema={operatorConsequenceSchema.shape.disruptionDelay}
                            placeholderValue=""
                        />

                        <Select<OperatorConsequence>
                            inputName="disruptionSeverity"
                            display="Disruption severity"
                            displaySize="l"
                            defaultDisplay="Select severity"
                            selectValues={DISRUPTION_SEVERITIES}
                            stateUpdater={stateUpdater}
                            value={pageState.inputs.disruptionSeverity}
                            initialErrors={pageState.errors}
                            schema={operatorConsequenceSchema.shape.disruptionSeverity}
                        />

                        <input type="hidden" name="consequenceType" value="operatorWide" />
                        <input type="hidden" name="disruptionId" value={props.disruptionId} />
                        <input type="hidden" name="consequenceIndex" value={props.consequenceIndex} />

                        <button className="govuk-button mt-8" data-module="govuk-button">
                            Save and continue
                        </button>

                        {queryParams["return"]?.includes(REVIEW_DISRUPTION_PAGE_PATH) && pageState.disruptionId ? (
                            <Link
                                role="button"
                                href={`${queryParams["return"] as string}/${pageState.disruptionId}`}
                                className="govuk-button mt-8 ml-5 govuk-button--secondary"
                            >
                                Cancel Changes
                            </Link>
                        ) : null}
                    </div>
                </>
            </CsrfForm>
        </BaseLayout>
    );
};

export const getServerSideProps = async (
    ctx: NextPageContext,
): Promise<{ props: CreateConsequenceOperatorProps } | void> => {
    const cookies = parseCookies(ctx);
    const errorCookie = cookies[COOKIES_CONSEQUENCE_OPERATOR_ERRORS];

    const disruption = await getDisruptionById(ctx.query.disruptionId?.toString() ?? "");

    if (!disruption) {
        throw new Error("No disruption found for operator consequence page");
    }

    const index = ctx.query.consequenceIndex ? Number(ctx.query.consequenceIndex) : 0;

    const consequence = disruption?.consequences?.[index];

    const pageState = getPageState<OperatorConsequence>(
        errorCookie,
        operatorConsequenceSchema,
        disruption.disruptionId,
        consequence && isOperatorConsequence(consequence) ? consequence : undefined,
    );

    if (ctx.res) destroyCookieOnResponseObject(COOKIES_CONSEQUENCE_OPERATOR_ERRORS, ctx.res);

    let operators: Operator[] = [];
    const searchApiUrl = `${API_BASE_URL}operators?adminAreaCodes=${ADMIN_AREA_CODE}`;
    const res = await fetch(searchApiUrl, { method: "GET" });
    const parse = z.array(operatorSchema).safeParse(await res.json());

    if (parse.success) {
        operators = parse.data;
    }

    return { props: { ...pageState, consequenceIndex: index, operators } };
};

export default CreateConsequenceOperator;
