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
    validityStartTimeHour: string,
    validityStartTimeMinute: string,
    validityEndTimeHour: string,
    validityEndTimeMinute: string,
    publishStartDateDay: string,
    publishStartDateMonth: string,
    publishStartDateYear: string,
    publishEndDateDay: string,
    publishEndDateMonth: string,
    publishEndDateYear: string,
    publishStartTimeHour: string,
    publishStartTimeMinute: string,
    publishEndTimeHour: string,
    publishEndTimeMinute: string,
}
