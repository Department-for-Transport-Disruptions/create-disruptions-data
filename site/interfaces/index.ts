export interface ErrorInfo {
    errorMessage: string;
    id: string;
    userInput?: string;
}

export interface DisruptionInfo {
    validityStartDate: string;
    validityEndDate: string;
    validityStartTimeHour: string;
    validityStartTimeMinute: string;
    validityEndTimeHour: string;
    validityEndTimeMinute: string;
    publishStartDate: string;
    publishEndDate: string;
    publishStartTimeHour: string;
    publishStartTimeMinute: string;
    publishEndTimeHour: string;
    publishEndTimeMinute: string;
}
