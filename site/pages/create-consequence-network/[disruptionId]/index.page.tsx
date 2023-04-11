import { NextPageContext } from "next";
import Link from "next/link";
import { parseCookies } from "nookies";
import { ReactElement, useState } from "react";
import ErrorSummary from "../../../components/ErrorSummary";
import CsrfForm from "../../../components/form/CsrfForm";
import Radios from "../../../components/form/Radios";
import Select from "../../../components/form/Select";
import Table from "../../../components/form/Table";
import TextInput from "../../../components/form/TextInput";
import TimeSelector from "../../../components/form/TimeSelector";
import { BaseLayout } from "../../../components/layout/Layout";
import {
    CONSEQUENCE_TYPES,
    COOKIES_CONSEQUENCE_NETWORK_ERRORS,
    COOKIES_CONSEQUENCE_TYPE_INFO,
    DISRUPTION_SEVERITIES,
    VEHICLE_MODES,
} from "../../../constants";
import { CreateConsequenceProps, PageState } from "../../../interfaces";
import { NetworkConsequence, networkConsequenceSchema } from "../../../schemas/consequence.schema";
import { typeOfConsequenceSchema } from "../../../schemas/type-of-consequence.schema";
import { getDisplayByValue } from "../../../utils";
import { getPageState } from "../../../utils/apiUtils";
import { getStateUpdater } from "../../../utils/formUtils";

const title = "Create Consequence Network";
const description = "Create Consequence Network page for the Create Transport Disruptions Service";

export interface CreateConsequenceNetworkProps extends PageState<Partial<NetworkConsequence>>, CreateConsequenceProps {}

const CreateConsequenceNetwork = (props: CreateConsequenceNetworkProps): ReactElement => {
    const [pageState, setConsequenceNetworkPageState] = useState<PageState<Partial<NetworkConsequence>>>(props);

    const stateUpdater = getStateUpdater(setConsequenceNetworkPageState, pageState);

    return (
        <BaseLayout title={title} description={description}>
            <CsrfForm action="/api/create-consequence-network" method="post" csrfToken={props.csrfToken}>
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
                                            props.previousConsequenceInformation.vehicleMode,
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

                        <TextInput<NetworkConsequence>
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
                            schema={networkConsequenceSchema.shape.description}
                        />

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
                            schema={networkConsequenceSchema.shape.removeFromJourneyPlanners}
                        />

                        <TimeSelector<NetworkConsequence>
                            display="Delay (minutes)"
                            displaySize="l"
                            value={pageState.inputs.disruptionDelay}
                            disabled={false}
                            inputName="disruptionDelay"
                            stateUpdater={stateUpdater}
                            initialErrors={pageState.errors}
                            schema={networkConsequenceSchema.shape.disruptionDelay}
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
                            schema={networkConsequenceSchema.shape.disruptionSeverity}
                        />

                        <input type="hidden" name="consequenceType" value="networkWide" />
                        <input
                            type="hidden"
                            name="vehicleMode"
                            value={props.previousConsequenceInformation.vehicleMode}
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
    const errorCookie = cookies[COOKIES_CONSEQUENCE_NETWORK_ERRORS];

    if (typeCookie) {
        const previousConsequenceInformation = typeOfConsequenceSchema.safeParse(JSON.parse(typeCookie));

        if (previousConsequenceInformation.success) {
            previousConsequenceInformationData = previousConsequenceInformation.data;
        }
    }

    const pageState = getPageState<NetworkConsequence>(errorCookie, networkConsequenceSchema);

    return { props: { ...pageState, previousConsequenceInformation: previousConsequenceInformationData } };
};

export default CreateConsequenceNetwork;
