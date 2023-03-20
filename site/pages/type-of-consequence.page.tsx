import { NextPageContext } from "next";
import { parseCookies } from "nookies";
import { ReactElement, useState } from "react";
import ErrorSummary from "../components/ErrorSummary";
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
import { getStateUpdater } from "../utils/formUtils";

const title = "Create Consequences";
const description = "Create Consequences page for the Create Transport Disruptions Service";

export interface ConsequenceTypePageInputs extends Partial<ConsequenceType> {}

const TypeOfConsequence = (initialState: PageState<Partial<ConsequenceTypePageInputs>>): ReactElement => {
    const [pageState, setPageState] = useState<PageState<Partial<ConsequenceTypePageInputs>>>(initialState);

    const stateUpdater = getStateUpdater(setPageState, pageState);

    return (
        <TwoThirdsLayout title={title} description={description} errors={initialState.errors}>
            <form action="/api/type-of-consequence" method="post">
                <>
                    <ErrorSummary errors={initialState.errors} />
                    <div className="govuk-form-group">
                        <h1 className="govuk-heading-xl">Add a Consequence</h1>

                        <Radios<ConsequenceTypePageInputs>
                            display="Select mode of transport"
                            radioDetail={VEHICLE_MODES}
                            inputName="modeOfTransport"
                            stateUpdater={stateUpdater}
                            value={pageState.inputs.modeOfTransport}
                            initialErrors={initialState.errors}
                        />
                        <Radios<ConsequenceTypePageInputs>
                            display="Select consequence type"
                            radioDetail={CONSEQUENCE_TYPES}
                            inputName="consequenceType"
                            stateUpdater={stateUpdater}
                            value={pageState.inputs.consequenceType}
                            initialErrors={initialState.errors}
                            paddingTop={3}
                        />

                        <div className="govuk-button-group">
                            <button className="govuk-button" data-module="govuk-button">
                                Save and continue
                            </button>
                        </div>
                    </div>
                </>
            </form>
        </TwoThirdsLayout>
    );
};

export const getServerSideProps = (ctx: NextPageContext): { props: PageState<Partial<ConsequenceTypePageInputs>> } => {
    let pageState: PageState<Partial<ConsequenceTypePageInputs>> = {
        errors: [],
        inputs: {},
    };

    const cookies = parseCookies(ctx);

    const dataCookie = cookies[COOKIES_CONSEQUENCE_TYPE_INFO];
    const errorCookie = cookies[COOKIES_CONSEQUENCE_TYPE_ERRORS];

    if (dataCookie) {
        const parsedData = typeOfConsequenceSchema.safeParse(JSON.parse(dataCookie));

        if (parsedData.success) {
            return {
                props: {
                    inputs: parsedData.data,
                    errors: [],
                },
            };
        }
    } else if (errorCookie) {
        pageState = JSON.parse(errorCookie) as PageState<Partial<ConsequenceTypePageInputs>>;
    }

    return {
        props: pageState,
    };
};

export default TypeOfConsequence;
