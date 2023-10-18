export const notEmpty = <T>(value: T | null | undefined): value is T => {
    return value !== null && value !== undefined;
};

export type Logger = {
    info: (message: string) => void;
    error: (message: string | Error) => void;
    warn: (message: string) => void;
    debug: (message: string) => void;
};
