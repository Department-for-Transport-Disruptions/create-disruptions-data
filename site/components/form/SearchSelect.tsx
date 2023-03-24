import { Fragment, ReactElement, useState } from "react";
import { SingleValue } from "react-select";
import AsyncSelect from "react-select/async";
import FormElementWrapper, { FormGroupWrapper } from "./FormElementWrapper";
import Table from "./Table";
import { ErrorInfo } from "../../interfaces";

interface SearchSelectProps<T> {
    placeholder?: string;
    inputName: string;
    initialErrors?: ErrorInfo[];
    getOptionLabel?: (value: T) => string;
    loadOptions: (inputValue: string, _callback: (options: T[]) => void) => Promise<T[]>;
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
}: SearchSelectProps<T>): ReactElement => {
    const [searchInput, setSearchInput] = useState("");

    const handleInputChange = (value: string) => {
        setSearchInput(value);
    };

    return (
        <FormGroupWrapper errorIds={[inputName]} errors={initialErrors}>
            <div className="govuk-form-group">
                <label className={`govuk-label govuk-label--${displaySize}`} htmlFor={`${inputId}-input`}>
                    {display}
                </label>
                {hint ? (
                    <div id={`${inputId}-hint`} className="govuk-hint">
                        {hint}
                    </div>
                ) : null}
                <FormElementWrapper errors={initialErrors} errorId={inputName} errorClass="govuk-input--error">
                    <AsyncSelect
                        isSearchable
                        styles={{
                            control: (baseStyles, state) => ({
                                ...baseStyles,
                                fontFamily: "GDS Transport, arial, sans-serif",
                                border: "black solid 3px",
                                outline: state.isFocused ? "#ffdd00 solid 3px" : "none",
                                color: state.isFocused ? "white" : "black",
                                marginBottom: "20px",
                                "&:hover": { borderColor: "black" },
                                width: "75%",
                            }),
                            option: (provided, state) => ({
                                ...provided,
                                color: state.isFocused ? "white" : "black",
                                backgroundColor: state.isFocused ? "#3399ff" : "white",
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
                        inputValue={searchInput}
                        onChange={handleChange}
                        id={inputName}
                        instanceId={`dropdown-${inputName}`}
                        inputId={`dropdown-${inputName}-value`}
                        menuPlacement="auto"
                        menuPosition="fixed"
                    />
                </FormElementWrapper>

                <Table rows={tableData ? getRows() : []} />
                {(tableData || []).map((stop, index) => (
                    <Fragment key={`stop-${index}`}>
                        <input type="hidden" name={`stop${index + 1}`} value={JSON.stringify(stop)} />
                    </Fragment>
                ))}
            </div>
        </FormGroupWrapper>
    );
};

export default SearchSelect;
