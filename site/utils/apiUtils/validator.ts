export const removeExcessWhiteSpace = (input: undefined | string): string => {
    // this will remove all whitespace on the front and end of a string, and reduce internal whitespaces to one whitespace
    if (!input) {
        return "";
    }
    return input.trim().replace(/\s+/g, " ");
};
