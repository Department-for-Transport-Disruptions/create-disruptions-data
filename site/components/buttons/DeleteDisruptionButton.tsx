import { ReactElement, useState } from "react";
import DeleteConfirmationPopup from "../popup/DeleteConfirmationPopup";

interface DeleteDisruptionButtonProps {
    disruptionId?: string;
    csrfToken?: string;
    buttonClasses?: string;
}

const DeleteDisruptionButton = ({
    disruptionId,
    csrfToken,
    buttonClasses,
}: DeleteDisruptionButtonProps): ReactElement | null => {
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    if (!csrfToken || !disruptionId) {
        return null;
    }

    return (
        <>
            {showDeleteModal && (
                <DeleteConfirmationPopup
                    entityName={`the disruption`}
                    deleteUrl={"/api/delete-disruption"}
                    cancelActionHandler={() => {
                        setShowDeleteModal(false);
                    }}
                    hintText="This action is permanent and cannot be undone"
                    csrfToken={csrfToken}
                    hiddenInputs={[
                        {
                            name: "id",
                            value: disruptionId.toString(),
                        },
                    ]}
                    isWarning
                />
            )}

            <button
                className={`govuk-button govuk-button--warning ml-5 ${buttonClasses || ""}`}
                data-module="govuk-button"
                onClick={(e) => {
                    e.preventDefault();
                    setShowDeleteModal(true);
                }}
            >
                Delete disruption
            </button>
        </>
    );
};

export default DeleteDisruptionButton;
