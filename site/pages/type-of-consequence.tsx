import { NextPageContext } from "next";
import { destroyCookie, parseCookies } from "nookies";
import { ReactElement, useState } from "react";
import { inspect } from "util";
import Radios from "../components/form/Radios";
import { TwoThirdsLayout } from "../components/layout/Layout";
import { ConsequenceType, TransportMode } from "../constants/enum";
import { COOKIES_ADD_CONSEQUENCE_ERRORS, COOKIES_ADD_CONSEQUENCE_INFO } from "../constants/index";
import { AddConsequenceProps, AddConsequenceWithErrors, DisplayValuePair, ErrorInfo } from "../interfaces/index";
import logger from "../utils/logger";

const title = "Create Consequences";
const description = "Create Consequences page for the Create Transport Disruptions Service";

const modeOfTransportRadio: DisplayValuePair[] = [];

Object.values(TransportMode).forEach((enumValue) => {
    modeOfTransportRadio.push({
        value: enumValue,
        display: enumValue,
    });
});

const consequenceType: DisplayValuePair[] = [];

Object.values(ConsequenceType).forEach((enumValue) => {
    consequenceType.push({
        value: enumValue,
        display: enumValue,
    });
});

const AddConsequence = ({ inputs, errors = [] }: AddConsequenceWithErrors): ReactElement => {
    const [pageState, setPageState] = useState<AddConsequenceProps>(inputs);
    const [errorState, setErrorState] = useState<ErrorInfo[]>(errors);

    const updatePageStateForInput = (inputName: keyof AddConsequenceProps, input: string, error?: ErrorInfo): void => {
        setPageState({
            ...pageState,
            [inputName]: input,
        });
        setErrorState([...(error ? [...errorState, error] : [...errors.filter((error) => error.id !== inputName)])]);
    };

    const stateUpdater = (change: string, field: keyof AddConsequenceProps) => {
        updatePageStateForInput(field, change);
    };

    return (
        <TwoThirdsLayout title={title} description={description}>
            <form action="/api/type-of-consequence" method="post">
                <>
                    <div className="govuk-form-group">
                        <h1 className="govuk-heading-xl">Add a Consequence</h1>

                        <Radios<AddConsequenceProps>
                            display="Select mode of Transport"
                            inputId="modeOfTransport"
                            radioDetail={modeOfTransportRadio}
                            inputName="modeOfTransport"
                            stateUpdater={stateUpdater}
                            value={pageState.modeOfTransport}
                            initialErrors={errorState}
                        />
                        <Radios<AddConsequenceProps>
                            display="Select consequence type"
                            inputId="consequenceType"
                            radioDetail={consequenceType}
                            inputName="consequenceType"
                            stateUpdater={stateUpdater}
                            value={pageState.consequenceType}
                            initialErrors={errorState}
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

export const getServerSideProps = (ctx: NextPageContext): { props: AddConsequenceWithErrors } => {
    let errors: ErrorInfo[] = [];
    const inputs: AddConsequenceProps = {};

    const cookies = parseCookies(ctx);

    const disruptionInfo = cookies[COOKIES_ADD_CONSEQUENCE_INFO];

    if (disruptionInfo) {
        logger.info(inspect(JSON.parse(disruptionInfo), false, null, true));
        destroyCookie(ctx, COOKIES_ADD_CONSEQUENCE_INFO);
    }

    const errorInfo = cookies[COOKIES_ADD_CONSEQUENCE_ERRORS];

    if (errorInfo) {
        logger.info(inspect(JSON.parse(errorInfo), false, null, true));
        errors = JSON.parse(cookies[COOKIES_ADD_CONSEQUENCE_ERRORS]) as ErrorInfo[];
        destroyCookie(ctx, COOKIES_ADD_CONSEQUENCE_ERRORS);
    }

    return { props: { inputs, errors } };
};

export default AddConsequence;
