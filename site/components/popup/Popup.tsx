import React, { ReactElement } from "react";
import CsrfForm from "../form/CsrfForm";

interface PopUpProps {
    action: string;
    cancelActionHandler: React.MouseEventHandler<HTMLButtonElement>;
    hintText?: string;
    csrfToken: string;
    hiddenInputs: { name: string; value: string | undefined }[];
    continueText: string;
    cancelText: string;
    questionText: string;
    isWarning?: boolean;
}

const Popup = ({
    action,
    cancelActionHandler,
    hintText,
    csrfToken,
    hiddenInputs,
    continueText,
    cancelText,
    questionText,
    isWarning,
}: PopUpProps): ReactElement | null => (
    <div className="bg-black/[.2] fixed justify-center items-center top-0 left-0 flex w-full h-screen z-50">
        <div className="relative bg-white w-full max-w-xl p-10">
            <CsrfForm action={action} method="post" csrfToken={csrfToken}>
                <h1 className="govuk-heading-l">{questionText}</h1>

                <span className="govuk-hint" id="popup-hint">
                    {hintText && (
                        <>
                            <span className="govuk-hint" id="popup-hint">
                                {hintText}
                            </span>
                        </>
                    )}
                </span>

                {hiddenInputs.map((hiddenInput) => (
                    <input
                        key={hiddenInput.name}
                        type="hidden"
                        name={hiddenInput.name}
                        value={hiddenInput.value || ""}
                    />
                ))}

                <button
                    className={`govuk-button mr-6 mt-4 mb-0 ${isWarning ? "govuk-button--warning" : ""}`}
                    data-module="govuk-button"
                    id="popup-continue-button"
                >
                    {continueText}
                </button>

                <button
                    className="govuk-button govuk-button--secondary mr-6 mt-4 mb-0"
                    onClick={cancelActionHandler}
                    id="popup-cancel-button"
                >
                    {cancelText}
                </button>
            </CsrfForm>
        </div>
    </div>
);

export default Popup;
