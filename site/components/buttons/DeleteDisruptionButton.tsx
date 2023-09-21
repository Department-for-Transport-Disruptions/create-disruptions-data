import { ReactElement, useState } from "react";
import DeleteConfirmationPopup from "../popup/DeleteConfirmationPopup";

interface DeleteDisruptionButtonProps {
    disruptionId?: string;
    csrfToken?: string;
    buttonClasses?: string;
    isTemplate?: string;
    returnPath?: string;
}

const DeleteDisruptionButton = ({
    disruptionId,
    csrfToken,
    buttonClasses,
    isTemplate,
    returnPath,
}: DeleteDisruptionButtonProps): ReactElement | null => {
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const getQueryParams = () => {
        if (isTemplate && returnPath) {
            return `?template=true&return=${encodeURIComponent(returnPath)}`;
        }
        if (isTemplate && !returnPath) {
            return "?template=true";
        }
        if (returnPath && !isTemplate) {
            return `?return=${encodeURIComponent(returnPath)}`;
        } else return "";
    };

    if (!csrfToken || !disruptionId) {
        return null;
    }

    return (
        <>
            {showDeleteModal && (
                <DeleteConfirmationPopup
                    entityName={isTemplate ? "the template" : "the disruption"}
                    deleteUrl={`/api/delete-disruption${getQueryParams()}`}
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
