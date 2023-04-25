import kebabCase from "lodash/kebabCase";
import { ReactElement, useEffect, useState } from "react";
import Select, { ControlProps, GroupBase, OptionProps } from "react-select";
import FormElementWrapper, { FormGroupWrapper } from "./form/FormElementWrapper";
import { ErrorInfo } from "../interfaces";
import { Operator } from "../schemas/consequence.schema";

interface OperatorSearchProps<T> {
    operators: Operator[];
    stateUpdater: (change: string[], field: keyof T) => void;
    selectedOperatorNocs: string[];
    reset?: boolean;
    display: string;
    displaySize?: "s" | "m" | "l" | "xl";
    inputName: Extract<keyof T, string>;
    initialErrors?: ErrorInfo[];
}

export const sortOperatorByName = (operators: Operator[]): Operator[] => {
    return operators.sort((a, b) => (a.operatorPublicName > b.operatorPublicName ? 1 : -1));
};

const handleChange = <T,>(
    input: string[],
    inputName: keyof T,
    stateUpdater: (change: string[], field: keyof T) => void,
) => {
    stateUpdater(input, inputName);
};

const OperatorSearch = <T extends object>({
    display,
    displaySize = "m",
    operators,
    stateUpdater,
    selectedOperatorNocs,
    reset = false,
    initialErrors = [],
    inputName,
}: OperatorSearchProps<T>): ReactElement => {
    const [searchText, setSearchText] = useState("");

    useEffect(() => {
        if (reset) {
            handleChange<T>([], inputName, stateUpdater);
        }
    }, [reset, stateUpdater, inputName]);

    const controlStyles = (state: ControlProps<Operator, false, GroupBase<Operator>>) => ({
        fontFamily: "GDS Transport, arial, sans-serif",
        border: "black solid 3px",
        outline: state.isFocused ? "#ffdd00 solid 3px" : "none",
        color: state.isFocused ? "white" : "black",
        marginBottom: "20px",
        "&:hover": { borderColor: "black" },
        width: "75%",
    });

    const optionStyles = (state: OptionProps<Operator, false, GroupBase<Operator>>) => ({
        color: state.isFocused ? "white" : "black",
        backgroundColor: state.isFocused ? "#3399ff" : "white",
    });

    return (
        <FormGroupWrapper errorIds={[inputName]} errors={initialErrors}>
            <div className="govuk-form-group" id={kebabCase(inputName)}>
                <label className={`govuk-label govuk-label--${displaySize}`} htmlFor="operator-search-dropdown-value">
                    {display}
                </label>
                <FormElementWrapper errors={initialErrors} errorId={inputName} errorClass="govuk-input--error">
                    <Select
                        isSearchable
                        styles={{
                            control: (baseStyles, state) => ({
                                ...baseStyles,
                                ...controlStyles(state),
                            }),
                            option: (provided, state) => ({
                                ...provided,
                                ...optionStyles(state),
                            }),
                        }}
                        placeholder="Select operators"
                        getOptionLabel={(operator: Operator) => operator.operatorPublicName}
                        getOptionValue={(operator: Operator) => operator.nocCode}
                        options={sortOperatorByName(operators)}
                        onInputChange={(text) => {
                            setSearchText(text);
                        }}
                        inputValue={searchText}
                        onChange={(operator) => {
                            if (!!operator && !selectedOperatorNocs.find((noc) => noc === operator.nocCode)) {
                                handleChange([...selectedOperatorNocs, operator.nocCode], inputName, stateUpdater);
                            }
                        }}
                        id="operator-search"
                        instanceId="operator-dropdown"
                        inputId="operator-search-dropdown-value"
                        menuPlacement="auto"
                        menuPosition="fixed"
                    />
                </FormElementWrapper>
            </div>
        </FormGroupWrapper>
    );
};

export default OperatorSearch;
