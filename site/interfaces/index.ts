export interface ErrorInfo {
    errorMessage: string;
    id: string;
    userInput?: string;
}

export interface DisruptionValidity {
    startDateDay: string,
    startDateMonth: string,
    startDateYear: string,
    endDateDay: string,
    endDateMonth: string,
    endDateYear: string,
    startTimeHour: string,
    startTimeMinute: string,
    endTimeHour: string,
    endTimeMinute: string,
}
