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
    startTimeHours: string,
    startTimeMinute: string,
    endTimeHours: string,
    endTimeMinute: string,
}
