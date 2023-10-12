import { ReactElement, useState } from "react";
import DeleteConfirmationPopup from "../popup/DeleteConfirmationPopup";

interface DeleteDisruptionButtonProps {
    disruptionId?: string;
    csrfToken?: string;
    buttonClasses?: string;
    isTemplate?: string;
}

const DeleteDisruptionButton = ({
    disruptionId,
    csrfToken,
    buttonClasses,
    isTemplate,
}: DeleteDisruptionButtonProps): ReactElement | null => {
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    if (!csrfToken || !disruptionId) {
        return null;
    }

    return (
        <>
            {showDeleteModal && (
                <DeleteConfirmationPopup
                    entityName={isTemplate ? "the template" : "the disruption"}
                    deleteUrl={`/api/delete-disruption${isTemplate ? "?template=true" : ""}`}
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
                {isTemplate ? "Delete template" : "Delete disruption"}
            </button>
        </>
    );
};

export default DeleteDisruptionButton;
