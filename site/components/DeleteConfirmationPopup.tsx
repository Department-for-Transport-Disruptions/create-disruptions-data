import React, { ReactElement } from "react";

interface PopUpProps {
    entityName: string;
    deleteUrl: string;
    cancelActionHandler: React.MouseEventHandler<HTMLButtonElement>;
    hintText?: string;
}

const DeleteConfirmationPopup = ({
    entityName,
    deleteUrl,
    cancelActionHandler,
    hintText,
}: PopUpProps): ReactElement | null => (
    <div className="bg-black/[.2] fixed justify-center items-center top-0 left-0 flex w-full h-screen ">
        <div className="relative bg-white w-full max-w-xl p-10">
            <form>
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

                <button
                    className="govuk-button mr-6 mt-4 mb-0 mt-11"
                    data-module="govuk-button"
                    formAction={deleteUrl}
                    formMethod="post"
                    id="popup-delete-button"
                >
                    Yes, delete
                </button>

                <button
                    className="govuk-button govuk-button--secondary mr-6 mt-4 mb-0 mt-11"
                    onClick={cancelActionHandler}
                >
                    No, return
                </button>
            </form>
        </div>
    </div>
);

export default DeleteConfirmationPopup;
