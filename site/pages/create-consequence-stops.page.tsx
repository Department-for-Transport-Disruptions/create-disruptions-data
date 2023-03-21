import { NextPageContext } from "next";
import Link from "next/link";
import { parseCookies } from "nookies";
import { ReactElement, useState } from "react";
import { z } from "zod";
import ErrorSummary from "../components/ErrorSummary";
import Radios from "../components/form/Radios";
//import Select from "../components/form/Select";
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
    VEHICLE_MODES,
} from "../constants";
import { CreateConsequenceProps, PageState } from "../interfaces";
import { createConsequenceStopsSchema } from "../schemas/create-consequence-stops.schema";
import { typeOfConsequenceSchema } from "../schemas/type-of-consequence.schema";
import { getDisplayByValue, getPageStateFromCookies } from "../utils";
import { getStateUpdater } from "../utils/formUtils";
import SelectSearch from "react-select-search";
import Select, { components, ContainerProps, ControlProps, Props, StylesConfig } from "react-select";
import { buildFeedbackContent } from "../utils/apiUtils/feedbackEmailer";

const title = "Create Consequence Stops";
const description = "Create Consequence Stops page for the Create Transport Disruptions Service";

export interface ConsequenceStopsPageInputs extends Partial<z.infer<typeof createConsequenceStopsSchema>> {}

const CreateConsequenceStops = ({
    inputs,
    previousConsequenceInformation,
}: CreateConsequenceProps<ConsequenceStopsPageInputs>): ReactElement => {
    const [pageState, setPageState] = useState<PageState<Partial<ConsequenceStopsPageInputs>>>(inputs);
    const stateUpdater = getStateUpdater(setPageState, pageState);

    interface ColourOption {
        readonly value: string;
        readonly label: string;
        readonly color: string;
        readonly isFixed?: boolean;
        readonly isDisabled?: boolean;
    }

    const colourOptions: readonly ColourOption[] = [
        { value: "ocean", label: "Ocean", color: "#00B8D9", isFixed: true },
        { value: "blue", label: "Blue", color: "#0052CC", isDisabled: true },
        { value: "purple", label: "Purple", color: "#5243AA" },
        { value: "red", label: "Red", color: "#FF5630", isFixed: true },
        { value: "orange", label: "Orange", color: "#FF8B00" },
        { value: "yellow", label: "Yellow", color: "#FFC400" },
        { value: "green", label: "Green", color: "#36B37E" },
        { value: "forest", label: "Forest", color: "#00875A" },
        { value: "slate", label: "Slate", color: "#253858" },
        { value: "silver", label: "Silver", color: "#666666" },
    ];

    const Control = ({ children, ...props }: ControlProps<ColourOption, false>) => {
        return <components.Control {...props}>{children}</components.Control>;
    };

    const styles: StylesConfig<ColourOption, false> = {
        control: (css) => ({ ...css, paddingLeft: "1rem", border: "2px solid black" }),
    };

    return (
        <BaseLayout title={title} description={description}>
            <form action="/api/create-consequence-network" method="post">
                <>
                    <ErrorSummary errors={inputs.errors} />
                    <div className="govuk-form-group">
                        <h1 className="govuk-heading-xl">Add a consequence</h1>
                        <Table
                            rows={[
                                {
                                    header: "Mode of transport",
                                    cells: [
                                        getDisplayByValue(
                                            VEHICLE_MODES,
                                            previousConsequenceInformation.modeOfTransport,
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
                                            previousConsequenceInformation.consequenceType,
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

                        <label className={`govuk-label govuk-label--l`} htmlFor="my-autocomplete">
                            Stops Impacted
                        </label>
                        <Select
                            components={{ Control }}
                            isSearchable
                            name="emoji"
                            options={colourOptions}
                            styles={{
                                control: (baseStyles, state) => ({
                                    ...baseStyles,
                                    fontFamily: "Arial",
                                    border: state.isFocused ? "yellow solid 3px" : "black solid 3px",
                                    marginBottom: "20px",
                                    "&:hover": { borderColor: "black" },
                                }),
                                option: (provided, state) => ({
                                    ...provided,
                                    color: "black",
                                    backgroundColor: state.isFocused ? "#3399ff" : "white",
                                }),
                            }}
                        />

                        <TextInput<ConsequenceStopsPageInputs>
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
                            schema={createConsequenceStopsSchema.shape.description}
                        />

                        <Radios<ConsequenceStopsPageInputs>
                            display="Would you like to remove this from journey planners?"
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
                            value={pageState.inputs["removeFromJourneyPlanners"]}
                            initialErrors={pageState.errors}
                            schema={createConsequenceStopsSchema.shape.removeFromJourneyPlanners}
                        />

                        <TimeSelector<ConsequenceStopsPageInputs>
                            display="Delay (minutes)"
                            displaySize="l"
                            hint="Enter the time in minutes"
                            value={pageState.inputs.disruptionDelay}
                            disabled={false}
                            inputName="disruptionDelay"
                            stateUpdater={stateUpdater}
                            initialErrors={pageState.errors}
                            schema={createConsequenceStopsSchema.shape.disruptionDelay}
                            placeholderValue=""
                        />

                        <Select<ConsequenceStopsPageInputs>
                            inputName="disruptionSeverity"
                            display="What is the severity of the disruption?"
                            displaySize="l"
                            defaultDisplay="Select severity"
                            selectValues={DISRUPTION_SEVERITIES}
                            stateUpdater={stateUpdater}
                            value={pageState.inputs.disruptionSeverity}
                            initialErrors={pageState.errors}
                            schema={createConsequenceStopsSchema.shape.disruptionSeverity}
                        />

                        <button className="govuk-button mt-8" data-module="govuk-button">
                            Save and continue
                        </button>
                    </div>
                </>
            </form>
        </BaseLayout>
    );
};

export const getServerSideProps = (ctx: NextPageContext): { props: object } | void => {
    let inputs: PageState<Partial<ConsequenceStopsPageInputs>> = {
        errors: [],
        inputs: {},
    };

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

    inputs = getPageStateFromCookies<ConsequenceStopsPageInputs>(dataCookie, errorCookie, createConsequenceStopsSchema);

    return { props: { inputs: inputs, previousConsequenceInformation: previousConsequenceInformationData } };
};

export default CreateConsequenceStops;
