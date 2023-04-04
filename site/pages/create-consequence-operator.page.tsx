import { NextPageContext } from "next";
import Link from "next/link";
import { parseCookies } from "nookies";
import { ReactElement, useState } from "react";
import ErrorSummary from "../components/ErrorSummary";
import CsrfForm from "../components/form/CsrfForm";
import Radios from "../components/form/Radios";
import Select from "../components/form/Select";
import Table from "../components/form/Table";
import TextInput from "../components/form/TextInput";
import TimeSelector from "../components/form/TimeSelector";
import { BaseLayout } from "../components/layout/Layout";
import {
    CONSEQUENCE_TYPES,
    COOKIES_CONSEQUENCE_OPERATOR_ERRORS,
    COOKIES_CONSEQUENCE_INFO,
    COOKIES_CONSEQUENCE_TYPE_INFO,
    DISRUPTION_SEVERITIES,
    OPERATORS,
    VEHICLE_MODES,
} from "../constants";
import { CreateConsequenceProps, PageState } from "../interfaces";
import { OperatorConsequence, operatorConsequenceSchema } from "../schemas/consequence.schema";
import { typeOfConsequenceSchema } from "../schemas/type-of-consequence.schema";
import { getDisplayByValue, getPageStateFromCookies } from "../utils";
import { getStateUpdater } from "../utils/formUtils";

const title = "Create Consequence Operator";
const description = "Create Consequence Operator page for the Create Transport Disruptions Service";

export interface CreateConsequenceOperatorProps
    extends PageState<Partial<OperatorConsequence>>,
        CreateConsequenceProps {}

const CreateConsequenceOperator = (props: CreateConsequenceOperatorProps): ReactElement => {
    const [pageState, setConsequenceOperatorPageState] = useState<PageState<Partial<OperatorConsequence>>>(props);

    const stateUpdater = getStateUpdater(setConsequenceOperatorPageState, pageState);

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
                                    header: "Mode of transport",
                                    cells: [
                                        getDisplayByValue(
                                            VEHICLE_MODES,
                                            props.previousConsequenceInformation.modeOfTransport,
                                        ),
                                        <Link
                                            key={"mode-of-transport"}
                                            className="govuk-link"
                                            href="/type-of-consequence"
                                        >
                                            Change
                                        </Link>,
                                    ],
                                },
                                {
                                    header: "Consequence type",
                                    cells: [
                                        getDisplayByValue(
                                            CONSEQUENCE_TYPES,
                                            props.previousConsequenceInformation.consequenceType,
                                        ),
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
                            inputName="consequenceOperator"
                            display="Operators impacted"
                            displaySize="l"
                            defaultDisplay="Select operator"
                            selectValues={OPERATORS}
                            stateUpdater={stateUpdater}
                            value={pageState.inputs.consequenceOperator}
                            initialErrors={pageState.errors}
                            schema={operatorConsequenceSchema.shape.consequenceOperator}
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
                        <input
                            type="hidden"
                            name="vehicleMode"
                            value={props.previousConsequenceInformation.modeOfTransport}
                        />

                        <button className="govuk-button mt-8" data-module="govuk-button">
                            Save and continue
                        </button>
                    </div>
                </>
            </CsrfForm>
        </BaseLayout>
    );
};

export const getServerSideProps = (ctx: NextPageContext): { props: object } | void => {
    let previousConsequenceInformationData = {};

    const cookies = parseCookies(ctx);
    const typeCookie = cookies[COOKIES_CONSEQUENCE_TYPE_INFO];
    const dataCookie = cookies[COOKIES_CONSEQUENCE_INFO];
    const errorCookie = cookies[COOKIES_CONSEQUENCE_OPERATOR_ERRORS];

    if (typeCookie) {
        const previousConsequenceInformation = typeOfConsequenceSchema.safeParse(JSON.parse(typeCookie));

        if (previousConsequenceInformation.success) {
            previousConsequenceInformationData = previousConsequenceInformation.data;
        }
    }

    const pageState = getPageStateFromCookies<OperatorConsequence>(dataCookie, errorCookie, operatorConsequenceSchema);

    return { props: { ...pageState, previousConsequenceInformation: previousConsequenceInformationData } };
};

export default CreateConsequenceOperator;
