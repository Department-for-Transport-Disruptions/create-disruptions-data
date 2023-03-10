import { Dispatch, SetStateAction } from "react";
import { ErrorInfo } from "../interfaces";

export const handleBlur = <T>(
    input: string,
    inputId: Extract<keyof T, string>,
    errorMessage: string,
    stateUpdater: (change: string, field: keyof T) => void,
    setErrors: Dispatch<SetStateAction<ErrorInfo[]>>,
    optional = false,
    validityChecker?: (input: string) => boolean,
) => {
    console.log("Handle blue----");
    stateUpdater(input, inputId);

    if ((!optional && !input) || (!optional && !!validityChecker && !validityChecker(input))) {
        setErrors([
            {
                id: inputId,
                errorMessage,
            },
        ]);
    } else {
        setErrors([]);
    }
};
