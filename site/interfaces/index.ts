export interface ErrorInfo {
    errorMessage: string;
    id: string;
    userInput?: string;
}

export interface DisruptionValidity {
    startDate: string;
    endDate: string;
    startTimeHour: string;
    startTimeMinute: string;
    endTimeHour: string;
    endTimeMinute: string;
}
