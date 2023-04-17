import { Dispatch, ReactElement, SetStateAction, useEffect, useState } from "react";
import Select, { ControlProps, GroupBase, OptionProps } from "react-select";
import { Service } from "../schemas/consequence.schema";
import { getServiceLabel } from "../utils";

interface ServiceSearchProps {
    services: Service[];
    setSelectedServices: Dispatch<SetStateAction<Service[]>>;
    selectedServices: Service[];
    reset?: boolean;
}

const ServiceSearch = ({
    services,
    setSelectedServices,
    selectedServices,
    reset = false,
}: ServiceSearchProps): ReactElement => {
    const [searchText, setSearchText] = useState("");

    useEffect(() => {
        if (reset) {
            setSelectedServices([]);
        }
    }, [reset]);

    const controlStyles = (state: ControlProps<Service, false, GroupBase<Service>>) => ({
        fontFamily: "GDS Transport, arial, sans-serif",
        border: "black solid 3px",
        outline: state.isFocused ? "#ffdd00 solid 3px" : "none",
        color: state.isFocused ? "white" : "black",
        marginBottom: "20px",
        "&:hover": { borderColor: "black" },
        width: "75%",
    });

    const optionStyles = (state: OptionProps<Service, false, GroupBase<Service>>) => ({
        color: state.isFocused ? "white" : "black",
        backgroundColor: state.isFocused ? "#3399ff" : "white",
    });

    return (
        <div className="govuk-form-group">
            <label className="govuk-label govuk-label--s" htmlFor="service-filter-dropdown-value">
                Services
            </label>
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
                placeholder="Select services"
                getOptionLabel={getServiceLabel}
                getOptionValue={(service: Service) => service.id.toString()}
                options={services}
                onInputChange={(text) => {
                    setSearchText(text);
                }}
                inputValue={searchText}
                onChange={(service) => {
                    if (!selectedServices.find((selService) => selService.id === (service as Service).id)) {
                        setSelectedServices([...selectedServices, service as Service]);
                    }
                }}
                id="service-filter"
                instanceId="service-filter-dropdown"
                inputId="service-filter-dropdown-value"
                menuPlacement="auto"
                menuPosition="fixed"
            />
        </div>
    );
};

export default ServiceSearch;
