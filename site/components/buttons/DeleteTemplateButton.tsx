import { ReactElement, useState } from "react";
import DeleteConfirmationPopup from "../popup/DeleteConfirmationPopup";

interface DeleteTemplateButtonProps {
    templateId?: string;
    csrfToken?: string;
    buttonClasses?: string;
}

const DeleteTemplateButton = ({
    templateId,
    csrfToken,
    buttonClasses,
}: DeleteTemplateButtonProps): ReactElement | null => {
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    if (!csrfToken || !templateId) {
        return null;
    }

    return (
        <>
            {showDeleteModal && (
                <DeleteConfirmationPopup
                    entityName="the template"
                    deleteUrl="/api/delete-template"
                    cancelActionHandler={() => {
                        setShowDeleteModal(false);
                    }}
                    hintText="This action is permanent and cannot be undone"
                    csrfToken={csrfToken}
                    hiddenInputs={[
                        {
                            name: "id",
                            value: templateId.toString(),
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
                Delete template
            </button>
        </>
    );
};

export default DeleteTemplateButton;
