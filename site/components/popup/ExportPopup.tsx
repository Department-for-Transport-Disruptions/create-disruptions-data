import { kebabCase } from "lodash";
import { Dispatch, Fragment, ReactElement, SetStateAction, useEffect, useRef, useState } from "react";
import { ErrorInfo } from "../../interfaces";
import { exportFileSchema } from "../../schemas/disruption.schema";
import FormElementWrapper, { FormGroupWrapper } from "../form/FormElementWrapper";

interface ExportPopUpProps {
    closePopUp: () => void;
    confirmHandler: (fileType: string) => void;
    isOpen: boolean;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
}

const ExportPopUp = ({ confirmHandler, closePopUp, isOpen, setIsOpen }: ExportPopUpProps): ReactElement => {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && modalRef.current) {
            const modalElement = modalRef.current;
            const focusableElements = modalElement.querySelectorAll<HTMLElement>(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
            );
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            const handleTabKeyPress = (event: KeyboardEvent) => {
                if (event.key === "Tab") {
                    if (event.shiftKey && document.activeElement === firstElement) {
                        event.preventDefault();
                        lastElement.focus();
                    } else if (!event.shiftKey && document.activeElement === lastElement) {
                        event.preventDefault();
                        firstElement.focus();
                    }
                }
            };

            const handleEscapeKeyPress = (event: KeyboardEvent) => {
                if (event.key === "Escape") {
                    setIsOpen(false);
                }
            };

            const trapFocus = (event: KeyboardEvent) => {
                if (event.key === "Tab") {
                    if (focusableElements.length > 0) {
                        const firstFocusableElement = focusableElements[0];
                        const lastFocusableElement = focusableElements[focusableElements.length - 1];

                        if (event.shiftKey) {
                            if (document.activeElement === firstFocusableElement) {
                                event.preventDefault();
                                lastFocusableElement.focus();
                            }
                        } else {
                            if (document.activeElement === lastFocusableElement) {
                                event.preventDefault();
                                firstFocusableElement.focus();
                            }
                        }
                    }
                }
            };

            modalElement.addEventListener("keydown", handleTabKeyPress);
            modalElement.addEventListener("keydown", handleEscapeKeyPress);
            modalElement.addEventListener("keydown", trapFocus);

            firstElement.focus();

            return () => {
                modalElement.removeEventListener("keydown", handleTabKeyPress);
                modalElement.removeEventListener("keydown", handleEscapeKeyPress);
                modalElement.removeEventListener("keydown", trapFocus);
            };
        }
        return;
    }, [isOpen, setIsOpen]);

    const [fileType, setFileType] = useState("");
    const [errors, setErrors] = useState<ErrorInfo[]>([]);

    const inputName = "exportType";
    const inputId = kebabCase(inputName);
    const radioDetail = [
        {
            value: "csv",
            display: "CSV",
        },
        {
            value: "excel",
            display: "Excel",
        },
        {
            value: "pdf",
            display: "PDF",
        },
    ];

    const setExportType = (checkedValue: string) => {
        setFileType(checkedValue);
    };

    const onConfirm = () => {
        const parsed = exportFileSchema.shape.exportType.safeParse(fileType);

        if (parsed.success === false) {
            setErrors([
                {
                    id: "exportType",
                    errorMessage: parsed.error.errors[0].message,
                },
            ]);
        } else {
            confirmHandler(fileType);
            closePopUp();
        }
    };

    return (
        <div
            className={`bg-black/[.2] fixed justify-center items-center top-0 left-0 flex w-full h-screen z-50 ${
                isOpen ? "" : "hidden"
            }`}
        >
            <div className="relative bg-white w-full max-w-xl p-10" ref={modalRef}>
                <FormGroupWrapper errorIds={[inputName]} errors={errors}>
                    <fieldset className="govuk-fieldset" id={inputId}>
                        <legend className="govuk-fieldset__legend govuk-!-padding-top">
                            <span className="govuk-heading-s govuk-!-margin-bottom-0">
                                What format would you like to export this as?
                            </span>
                        </legend>
                        <FormElementWrapper errors={errors} errorId={inputName} errorClass="govuk-radios--error">
                            <div className="govuk-radios" data-module="govuk-radios">
                                {radioDetail.map((input, index) => (
                                    <Fragment key={`radio-${input.value}`}>
                                        <div
                                            className={`govuk-radios__item${
                                                index < radioDetail.length - 1 ? " govuk-!-margin-bottom-1" : ""
                                            }`}
                                        >
                                            <input
                                                className="govuk-radios__input"
                                                id={`${inputId}-${input.value}`}
                                                name={inputName}
                                                type="radio"
                                                value={input.value}
                                                onChange={(e) => setExportType(e.currentTarget.value)}
                                                data-aria-controls={`${inputId}-${input.value}-conditional`}
                                            />
                                            <label
                                                className="govuk-label govuk-radios__label"
                                                htmlFor={`${inputId}-${input.value}`}
                                            >
                                                {input.display}
                                            </label>
                                        </div>
                                    </Fragment>
                                ))}
                            </div>
                        </FormElementWrapper>
                    </fieldset>
                </FormGroupWrapper>
                <button className="govuk-button" data-module="govuk-button" onClick={onConfirm}>
                    Export
                </button>
                <button
                    className="govuk-button ml-5 govuk-button--secondary"
                    data-module="govuk-button"
                    onClick={closePopUp}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default ExportPopUp;
