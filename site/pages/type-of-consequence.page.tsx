import { NextPageContext } from "next";
import { parseCookies } from "nookies";
import { ReactElement, useState } from "react";
import ErrorSummary from "../components/ErrorSummary";
import CsrfForm from "../components/form/CsrfForm";
import Radios from "../components/form/Radios";
import { TwoThirdsLayout } from "../components/layout/Layout";
import {
    COOKIES_CONSEQUENCE_TYPE_INFO,
    COOKIES_CONSEQUENCE_TYPE_ERRORS,
    VEHICLE_MODES,
    CONSEQUENCE_TYPES,
} from "../constants/index";
import { PageState } from "../interfaces/index";
import { ConsequenceType, typeOfConsequenceSchema } from "../schemas/type-of-consequence.schema";
import { getPageStateFromCookies } from "../utils";
import { getStateUpdater } from "../utils/formUtils";

const title = "Create Consequences";
const description = "Create Consequences page for the Create Transport Disruptions Service";

export interface ConsequenceTypePageProps extends PageState<Partial<ConsequenceType>> {}

const TypeOfConsequence = (props: ConsequenceTypePageProps): ReactElement => {
    const [pageState, setPageState] = useState(props);

    const stateUpdater = getStateUpdater(setPageState, pageState);

    return (
        <TwoThirdsLayout title={title} description={description} errors={props.errors}>
            <CsrfForm action="/api/type-of-consequence" method="post" csrfToken={props.csrfToken}>
                <>
                    <ErrorSummary errors={props.errors} />
                    <div className="govuk-form-group">
                        <h1 className="govuk-heading-xl">Add a Consequence</h1>

                        <Radios<ConsequenceType>
                            display="Select mode of transport"
                            radioDetail={VEHICLE_MODES}
                            inputName="modeOfTransport"
                            stateUpdater={stateUpdater}
                            value={pageState.inputs.modeOfTransport}
                            initialErrors={props.errors}
                        />
                        <Radios<ConsequenceType>
                            display="Select consequence type"
                            radioDetail={CONSEQUENCE_TYPES}
                            inputName="consequenceType"
                            stateUpdater={stateUpdater}
                            value={pageState.inputs.consequenceType}
                            initialErrors={props.errors}
                            paddingTop={3}
                        />

                        <div className="govuk-button-group">
                            <button className="govuk-button" data-module="govuk-button">
                                Save and continue
                            </button>
                        </div>
                    </div>
                </>
            </CsrfForm>
        </TwoThirdsLayout>
    );
};

export const getServerSideProps = (ctx: NextPageContext): { props: ConsequenceTypePageProps } => {
    const cookies = parseCookies(ctx);

    const dataCookie = cookies[COOKIES_CONSEQUENCE_TYPE_INFO];
    const errorCookie = cookies[COOKIES_CONSEQUENCE_TYPE_ERRORS];

    return {
        props: { ...getPageStateFromCookies(dataCookie, errorCookie, typeOfConsequenceSchema) },
    };
};

export default TypeOfConsequence;
