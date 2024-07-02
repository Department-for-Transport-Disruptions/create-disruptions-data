import React, { Dispatch, ReactElement, SetStateAction, useEffect, useRef } from "react";
import CsrfForm from "../form/CsrfForm";

interface PopUpProps<T> {
    action: string;
    cancelActionHandler: React.MouseEventHandler<HTMLButtonElement>;
    hintText?: string;
    csrfToken: string;
    hiddenInputs: { name: string; value: string | undefined }[];
    continueText: string;
    cancelText: string;
    questionText: string;
    isWarning?: boolean;
    isOpen: boolean;
    setIsOpen: Dispatch<SetStateAction<T | undefined>>;
}

const Popup = <T extends object | string | boolean>({
    action,
    cancelActionHandler,
    hintText,
    csrfToken,
    hiddenInputs,
    continueText,
    cancelText,
    questionText,
    isWarning,
    isOpen,
    setIsOpen,
}: PopUpProps<T>): ReactElement | null => {
    const modalRef = useRef<HTMLDivElement>(null);
    const previouslyFocusedElement = useRef<HTMLElement | null>(null);

    useEffect(() => {
        const handleTabKeyPress = (event: KeyboardEvent) => {
            if (!modalRef.current) return;

            const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
            );

            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (event.key === "Tab") {
                if (event.shiftKey) {
                    if (document.activeElement === firstElement) {
                        event.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        event.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        };

        const handleEscapeKeyPress = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsOpen(undefined);
            }
        };

        const disablePageElements = () => {
            const pageElements = document.querySelectorAll<HTMLElement>("body > *:not(.modal-overlay)");
            pageElements.forEach((element) => {
                element.setAttribute("aria-hidden", "true");
                element.setAttribute("tabindex", "-1");
            });
        };

        const enablePageElements = () => {
            const pageElements = document.querySelectorAll<HTMLElement>("body > *:not(.modal-overlay)");
            pageElements.forEach((element) => {
                element.removeAttribute("aria-hidden");
                element.removeAttribute("tabindex");
            });
        };

        if (isOpen) {
            previouslyFocusedElement.current = document.activeElement as HTMLElement;
            disablePageElements();
            if (modalRef.current) {
                modalRef.current.focus();
                modalRef.current.addEventListener("keydown", handleTabKeyPress);
                modalRef.current.addEventListener("keydown", handleEscapeKeyPress);
            }
        } else {
            enablePageElements();
            if (previouslyFocusedElement.current) {
                previouslyFocusedElement.current.focus();
            }
        }

        return () => {
            if (modalRef.current) {
                modalRef.current.removeEventListener("keydown", handleTabKeyPress);
                modalRef.current.removeEventListener("keydown", handleEscapeKeyPress);
            }
        };
    }, [isOpen, setIsOpen]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay bg-black/[.2] fixed justify-center items-center top-0 left-0 flex w-full h-screen z-50">
            <div className="relative bg-white w-full max-w-xl p-10" ref={modalRef} tabIndex={-1}>
                <CsrfForm action={action} method="post" csrfToken={csrfToken}>
                    <h1 className="govuk-heading-l">{questionText}</h1>

                    {hintText && (
                        <span className="govuk-hint" id="popup-hint">
                            {hintText}
                        </span>
                    )}

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
};

export default Popup;
