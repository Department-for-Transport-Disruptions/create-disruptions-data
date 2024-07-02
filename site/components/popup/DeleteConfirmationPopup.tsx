import React, { Dispatch, ReactElement, SetStateAction } from "react";
import Popup from "./Popup";

interface PopUpProps<T> {
    entityName: string;
    deleteUrl: string;
    cancelActionHandler: React.MouseEventHandler<HTMLButtonElement>;
    hintText?: string;
    csrfToken: string;
    hiddenInputs: { name: string; value: string | undefined }[];
    isWarning?: boolean;
    isOpen: boolean;
    setIsOpen: Dispatch<SetStateAction<T | undefined>>;
}

const DeleteConfirmationPopup = <T extends object | string | boolean>({
    entityName,
    deleteUrl,
    cancelActionHandler,
    hintText,
    csrfToken,
    hiddenInputs,
    isWarning,
    isOpen,
    setIsOpen,
}: PopUpProps<T>): ReactElement | null => {
    return (
        <Popup
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            action={deleteUrl}
            cancelActionHandler={cancelActionHandler}
            hintText={hintText}
            csrfToken={csrfToken}
            hiddenInputs={hiddenInputs}
            continueText="Yes, delete"
            cancelText="No, return"
            questionText={`Are you sure you wish to delete ${entityName.trim()}?`}
            isWarning={isWarning}
        />
    );
};

export default DeleteConfirmationPopup;
