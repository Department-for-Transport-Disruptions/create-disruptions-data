
enum SourceType {
    directReport,
    email,
    phone,
    ax,
    post,
    feed,
    radio,
    tv,
    web,
    pager,
    text,
    other,
}

enum Progress {
    draft, 
    pendingApproval, 
    approvedDraft, 
    open, 
    closing, 
    closed, 
    rejected
}

enum Reason {
    Accident,
    SecurityAlert,
    Congestion,
    RoadWorks,
    RoadClosed,
    BombExplosion,
    Incident,
    RouteDiversion,
    StaffAbsence,
    SignalProblem,
    MaintenanceWork,
    ConstructionWork,
    Fog,
    Ice,
    HeavyRain,
    WaterLogged,
    Unknown
}

enum DayType {
    monday,
    tuesday,
    wednesday,
    thursday,
    friday,
    saturday,
    sunday
}

export type Source = {
    SourceType: SourceType;
    TimeOfCommunication: string;
};

export type Period = {
    StartTime: Date;
    EndTime?: Date;
};

export type InfoLink = {
    Uri: string;
}

export type Consequences = {
    Condition: string;
}

export type Repetitions = {
    DayType: DayType;
}

export type Reference = {
    RelatedToRef: string[];
};

export type PtSituationElement = {
    CreationTime: Date;
    ParticipantRef: string;
    SituationNumber: string;
    Version?: Number;
    Source: Source;
    Progress: Progress;
    ValidityPeriod: Period[];
    PublicationWindow: Period;
    MiscellaneousReason?: Reason;
    Planned: boolean;
    Summary: string;
    InfoLink?: InfoLink[];
    Consequences: Consequences[];
    Repetitions?: Repetitions[];
    References?: Reference;
};

export type SituationExchangeDelivery = {
    ResponseTimestamp: Date;
    Status?: boolean;
    ShortestPossibleCycle?: string;
    Situations: PtSituationElement[];
}

export type ServiceDelivery = {
    ResponseTimestamp: Date;
    ProducerRef: string;
    ResponseMessageIdentifier: string;
    SituationExchangeDelivery: SituationExchangeDelivery;
}