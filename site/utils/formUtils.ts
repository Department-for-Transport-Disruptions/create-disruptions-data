import { Dispatch, SetStateAction } from "react";
import { z } from "zod";
import { ErrorInfo } from "../interfaces";

export const handleBlur = <T>(
    input: string,
    inputName: string,
    stateUpdater: (change: string, field: string) => void,
    setErrors: Dispatch<SetStateAction<ErrorInfo[]>>,
    schema?: z.ZodTypeAny,
    disabled?: boolean,
) => {
    stateUpdater(input, inputName);

    if (schema && !disabled) {
        const parsed = schema.safeParse(input);

        if (parsed.success === false) {
            setErrors([
                {
                    id: inputName,
                    errorMessage: parsed.error.errors[0].message,
                },
            ]);
        } else {
            setErrors([]);
        }
    }
};
