import kebabCase from "lodash/kebabCase";
import { Dispatch, ReactElement, SetStateAction, useEffect, useState } from "react";
import Select, { ControlProps, GroupBase, OptionProps } from "react-select";
import FormElementWrapper, { FormGroupWrapper } from "./form/FormElementWrapper";
import { ErrorInfo } from "../interfaces";
import { Operator } from "../schemas/consequence.schema";

interface OperatorSearchProps {
    display: string;
    displaySize?: "l" | "m" | "s";
    operators: Operator[];
    setSelectedOperators: Dispatch<SetStateAction<Operator[]>>;
    selectedOperators: Operator[];
    reset?: boolean;
    errors?: ErrorInfo[];
    inputId?: string;
}

export const sortOperatorByName = (operators: Operator[]): Operator[] => {
    return operators.sort((a, b) => (a.operatorPublicName > b.operatorPublicName ? 1 : -1));
};

const OperatorSearch = ({
    display,
    displaySize = "m",
    operators,
    setSelectedOperators,
    selectedOperators,
    reset = false,
    errors = [],
    inputId = "operator-search-dropdown",
}: OperatorSearchProps): ReactElement => {
    const [searchText, setSearchText] = useState("");

    useEffect(() => {
        if (reset) {
            setSelectedOperators([]);
        }
    }, [reset, setSelectedOperators]);

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
        <FormGroupWrapper errorIds={[inputId]} errors={errors}>
            <div className="govuk-form-group" id={kebabCase(inputId)}>
                <label className={`govuk-label govuk-label--${displaySize}`} htmlFor="operator-search-dropdown-value">
                    {display}
                </label>
                <FormElementWrapper errors={errors} errorId={inputId} errorClass="govuk-input--error">
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
                            if (
                                !selectedOperators.find(
                                    (selOperator) => selOperator.nocCode === (operator as Operator).nocCode,
                                )
                            ) {
                                setSelectedOperators([...selectedOperators, operator as Operator]);
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
