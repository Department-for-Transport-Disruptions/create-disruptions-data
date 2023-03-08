import { Dispatch, ReactElement, SetStateAction } from "react";
import { InputInfo } from "../../interfaces";

interface CheckboxProps {
    inputInfo: InputInfo;
    noDisruptionEndRequired: boolean;
    updateNoDisruptionRequired: Dispatch<SetStateAction<boolean>>;
}

const Checkbox = ({ inputInfo, noDisruptionEndRequired, updateNoDisruptionRequired }: CheckboxProps): ReactElement => {
    return (
        <fieldset className="govuk-fieldset" role="group">
            <div className="govuk-checkboxes flex govuk-checkboxes--small" data-module="govuk-checkboxes">
                <div className="govuk-checkboxes__item">
                    <input
                        className="govuk-checkboxes__input"
                        id={inputInfo.id}
                        name={inputInfo.name}
                        type="checkbox"
                        value={inputInfo.value}
                        onClick={() => {
                            updateNoDisruptionRequired(!noDisruptionEndRequired);
                        }}
                        defaultChecked={noDisruptionEndRequired}
                    />
                    <label className="govuk-label govuk-checkboxes__label" htmlFor={inputInfo.id}>
                        {inputInfo.display}
                    </label>
                </div>
            </div>
        </fieldset>
    );
};

export default Checkbox;
