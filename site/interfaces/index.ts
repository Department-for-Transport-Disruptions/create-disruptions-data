export interface ErrorInfo {
    errorMessage: string;
    id: string;
    userInput?: string;
}

export interface DisruptionInfo {
    validityStartDateDay: string,
    validityStartDateMonth: string,
    validityStartDateYear: string,
    validityEndDateDay: string,
    validityEndDateMonth: string,
    validityEndDateYear: string,
    validityStartTimeHours: string,
    validityStartTimeMinute: string,
    validityEndTimeHours: string,
    validityEndTimeMinute: string,
    publishStartDateDay: string,
    publishStartDateMonth: string,
    publishStartDateYear: string,
    publishEndDateDay: string,
    publishEndDateMonth: string,
    publishEndDateYear: string,
    publishStartTimeHours: string,
    publishStartTimeMinute: string,
    publishEndTimeHours: string,
    publishEndTimeMinute: string,
}
