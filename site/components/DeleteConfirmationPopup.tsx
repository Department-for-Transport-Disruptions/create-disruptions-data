import React, { ReactElement } from "react";
import CsrfForm from "./form/CsrfForm";

interface PopUpProps {
    entityName: string;
    deleteUrl: string;
    cancelActionHandler: React.MouseEventHandler<HTMLButtonElement>;
    hintText?: string;
    csrfToken: string;
    id: string;
}

const DeleteConfirmationPopup = ({
    entityName,
    deleteUrl,
    cancelActionHandler,
    hintText,
    csrfToken,
    id,
}: PopUpProps): ReactElement | null => (
    <div className="bg-black/[.2] fixed justify-center items-center top-0 left-0 flex w-full h-screen z-50 ">
        <div className="relative bg-white w-full max-w-xl p-10">
            <CsrfForm action={deleteUrl} method="post" csrfToken={csrfToken}>
                <h1 className="govuk-heading-l">Are you sure you wish to delete {entityName.trim()}?</h1>

                <span className="govuk-hint" id="delete-hint">
                    {hintText && (
                        <>
                            <span className="govuk-hint" id="delete-hint">
                                {hintText}
                            </span>
                        </>
                    )}
                </span>
                <input type="hidden" name="id" value={id || ""} />
                <button
                    className="govuk-button mr-6 mt-4 mb-0 mt-11"
                    data-module="govuk-button"
                    id="popup-delete-button"
                >
                    Yes, delete
                </button>

                <button
                    className="govuk-button govuk-button--secondary mr-6 mt-4 mb-0 mt-11"
                    onClick={cancelActionHandler}
                    id="popup-cancel-button"
                >
                    No, return
                </button>
            </CsrfForm>
        </div>
    </div>
);

export default DeleteConfirmationPopup;
