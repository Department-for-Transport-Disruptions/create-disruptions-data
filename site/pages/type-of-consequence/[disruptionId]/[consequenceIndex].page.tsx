import { NextPageContext } from "next";
import { parseCookies } from "nookies";
import { ReactElement, useState } from "react";
import ErrorSummary from "../../../components/ErrorSummary";
import CsrfForm from "../../../components/form/CsrfForm";
import Radios from "../../../components/form/Radios";
import { TwoThirdsLayout } from "../../../components/layout/Layout";
import { COOKIES_CONSEQUENCE_TYPE_ERRORS, VEHICLE_MODES, CONSEQUENCE_TYPES } from "../../../constants/index";
import { getDisruptionById } from "../../../data/dynamo";
import { PageState } from "../../../interfaces/index";
import { ConsequenceType, typeOfConsequenceSchema } from "../../../schemas/type-of-consequence.schema";
import { getPageState } from "../../../utils/apiUtils";
import { getStateUpdater } from "../../../utils/formUtils";

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
                            inputName="vehicleMode"
                            stateUpdater={stateUpdater}
                            value={pageState.inputs.vehicleMode}
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

                        <input type="hidden" name="disruptionId" value={props.disruptionId} />
                        <input type="hidden" name="consequenceIndex" value={props.consequenceIndex} />

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

export const getServerSideProps = async (ctx: NextPageContext): Promise<{ props: ConsequenceTypePageProps }> => {
    const cookies = parseCookies(ctx);
    const errorCookie = cookies[COOKIES_CONSEQUENCE_TYPE_ERRORS];

    const disruption = await getDisruptionById(ctx.query.disruptionId?.toString() ?? "");
    const index = ctx.query.consequenceIndex ? Number(ctx.query.consequenceIndex) : 0;

    if (!disruption || !disruption.consequences?.[index]) {
        return {
            props: {
                ...getPageState(errorCookie, typeOfConsequenceSchema, ctx.query.disruptionId?.toString()),
                consequenceIndex: Number(ctx.query.consequenceIndex?.toString()),
            },
        };
    }

    return {
        props: {
            ...getPageState(errorCookie, typeOfConsequenceSchema, ctx.query.disruptionId?.toString(), {
                consequenceType: disruption.consequences[index].consequenceType,
                disruptionId: disruption.consequences[index].disruptionId,
                vehicleMode: disruption.consequences[index].vehicleMode,
                consequenceIndex: disruption.consequences[index].consequenceIndex,
            }),
            consequenceIndex: disruption.consequences[index].consequenceIndex,
        },
    };
};

export default TypeOfConsequence;
