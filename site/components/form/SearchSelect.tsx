import { Dispatch, Fragment, ReactElement, SetStateAction, useEffect } from "react";
import Select, { ControlProps, GroupBase, OptionProps, SingleValue } from "react-select";
import AsyncSelect from "react-select/async";
import FormElementWrapper, { FormGroupWrapper } from "./FormElementWrapper";
import Table from "./Table";
import { ErrorInfo } from "../../interfaces";

interface SearchSelectProps<T> {
    placeholder?: string;
    inputName: string;
    initialErrors?: ErrorInfo[];
    getOptionLabel?: (value: T) => string;
    loadOptions?: (inputValue: string) => Promise<T[]>;
    handleChange: (value: SingleValue<T>) => void;
    tableData: T[] | undefined;
    getRows: () => {
        header?: string;
        cells: (string | JSX.Element)[];
    }[];
    selected: SingleValue<T>;
    getOptionValue?: (value: T) => string;
    display: string;
    displaySize?: string;
    inputId: string;
    hint?: string;
    isClearable?: boolean;
    isAsync?: boolean;
    options?: T[] | undefined;
    inputValue?: string;
    setSearchInput?: Dispatch<SetStateAction<string>>;
}
const SearchSelect = <T extends object>({
    selected,
    inputName,
    initialErrors = [],
    placeholder = "Select...",
    getOptionLabel,
    loadOptions,
    handleChange,
    tableData,
    getRows,
    getOptionValue,
    hint,
    inputId,
    display,
    displaySize = "s",
    isClearable = false,
    isAsync = true,
    options = [],
    inputValue = "",
    setSearchInput = (value) => value,
}: SearchSelectProps<T>): ReactElement => {
    const handleInputChange = (value: string, { action }) => {
        if (action !== "input-blur" && action !== "menu-close") {
            setSearchInput(value);
            if (value.trim() === "") {
                setSearchInput("");
            } else {
                setSearchInput(value);
            }
        }
    };

    const controlStyles = (state: ControlProps<T, false, GroupBase<T>>) => ({
        fontFamily: "GDS Transport, arial, sans-serif",
        border: "black solid 3px",
        outline: state.isFocused ? "#ffdd00 solid 3px" : "none",
        color: state.isFocused ? "white" : "black",
        marginBottom: "20px",
        "&:hover": { borderColor: "black" },
        width: "75%",
    });

    const optionStyles = (state: OptionProps<T, false, GroupBase<T>>) => ({
        color: state.isFocused ? "white" : "black",
        backgroundColor: state.isFocused ? "#3399ff" : "white",
    });
    return (
        <FormGroupWrapper errorIds={[inputId]} errors={initialErrors}>
            <div className="govuk-form-group">
                <label className={`govuk-label govuk-label--${displaySize}`} htmlFor={`${inputId}-input`}>
                    {display}
                </label>
                {hint ? (
                    <div id={`${inputId}-hint`} className="govuk-hint">
                        {hint}
                    </div>
                ) : null}
                <FormElementWrapper errors={initialErrors} errorId={inputId} errorClass="govuk-input--error">
                    {isAsync ? (
                        <AsyncSelect
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
                            cacheOptions
                            defaultOptions
                            value={selected}
                            placeholder={placeholder}
                            getOptionLabel={getOptionLabel}
                            getOptionValue={getOptionValue}
                            loadOptions={loadOptions}
                            onInputChange={handleInputChange}
                            inputValue={inputValue}
                            onChange={handleChange}
                            id={inputId}
                            instanceId={`dropdown-${inputName}`}
                            inputId={`dropdown-${inputName}-value`}
                            menuPlacement="auto"
                            menuPosition="fixed"
                            isClearable={isClearable}
                        />
                    ) : (
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
                            value={selected}
                            placeholder={placeholder}
                            getOptionLabel={getOptionLabel}
                            getOptionValue={getOptionValue}
                            options={options}
                            onInputChange={handleInputChange}
                            inputValue={inputValue}
                            onChange={handleChange}
                            id={inputId}
                            instanceId={`dropdown-${inputName}`}
                            inputId={`dropdown-${inputName}-value`}
                            menuPlacement="auto"
                            menuPosition="fixed"
                            isClearable={isClearable}
                        />
                    )}
                </FormElementWrapper>

                <Table rows={tableData ? getRows() : []} />
                {(tableData || []).map((element, index) => (
                    <Fragment key={`${inputName}-${index}`}>
                        <input type="hidden" name={`${inputName}${index + 1}`} value={JSON.stringify(element)} />
                    </Fragment>
                ))}
            </div>
        </FormGroupWrapper>
    );
};

export default SearchSelect;
