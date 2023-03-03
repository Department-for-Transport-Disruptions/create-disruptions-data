export interface ErrorInfo {
    errorMessage: string;
    id: string;
    userInput?: string;
}

export interface DisruptionInfo {
    validityStartDate: string;
    validityEndDate: string;
    validityStartTime: string;
    validityEndTime: string;
    publishStartDate: string;
    publishEndDate: string;
    publishStartTime: string;
    publishEndTime: string;
}
