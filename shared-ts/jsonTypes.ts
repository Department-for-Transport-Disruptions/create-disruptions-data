
export enum SourceType {
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

export enum Progress {
    draft, 
    pendingApproval, 
    approvedDraft, 
    open, 
    closing, 
    closed, 
    rejected
}

export enum MiscellaneousReason {
    accident,
    securityAlert,
    congestion,
    roadWorks,
    roadClosed,
    bombExplosion,
    incident,
    routeDiversion,
    staffAbsence,
    signalProblem,
    maintenanceWork,
    constructionWork,
    fog,
    ice,
    heavyRain,
    waterLogged,
    unknown,
    nearMiss,
    safetyViolation,
    signalPassedAtDanger,
    stationOverrun,
    trainDoor,
    emergencyServicesCall,
    policeRequest,
    fireBrigadeSafetyChecks,
    unattendedBag,
    telephonedThreat,
    suspectVehicle,
    civilEmergency,
    airRaid,
    sabotage,
    bombAlert,
    attach,
    evacuation,
    terroristIncident,
    gunfireOnRoadway,
    explosion,
    explosionHazard,
    securityIncident,
    fire,
    linesideFire,
    vandalism,
    passengerAction,
    staffAssault,
    railwayCrime,
    fatality,
    personUnderTrain,
    personHitByTrain,
    personIllOnVehicle,
    emergencyServices,
    collision,
    overcrowded,
    insufficientDemand,
    lightingFailure,
    leaderBoardFailure,
    serviceIndicatorFailure,
    serviceFailure,
    operatorCeasedTrading,
    operatorSuspended,
    routeBlockage,
    personOnTheLine,
    vehicleOnTheLine,
    levelCrossingIncident,
    objectOnTheLine,
    fallenTreeOnTheLine,
    vegetation,
    trainStruckAnimal,
    trainStruckObject,
    animalOnTheLine,
    roadworks,
    specialEvent,
    march,
    procession,
    demonstration,
    publicDisturbance,
    filterBlockade,
    sightseersObstructingAccess,
    bridgeStrike,
    overheadObstruction,
    undefinedProblem,
    problemsAtBorderPost,
    problemsAtCustomsPost,
    problemsOnLocalRoad
}

export enum PersonnelReason {
    unknown,
    staffSickness,
    staffInjury,
    contractorStaffInjury,
    staffAbsence,
    staffInWrongPlace,
    staffShortage,
    industrialAction,
    unofficialIndustrialAction,
    workToRule,
    undefinedPersonnelProblem
}

export enum EquipmentReason {
    unknown,
    pointsProblem,
    pointsFailure,
    signalProblem,
    trainWarningSystemProblem,
    trackCircuitProblem,
    signalFailure,
    derailment,
    engineFailure,
    tractionFailure,
    breakDown,
    technicalProblem,
    brokenRail,
    poorRailConditions,
    wheelImpactLoad,
    lackOfOperationalStock,
    defectiveFireAlarmEquipment,
    defectivePlatformEdgeDoors,
    defectiveCctv,
    defectivePublicAnnouncementSystem,
    ticketingSystemNotAvailable,
    repairWork,
    constructionWork,
    maintenanceWork,
    emergencyEngineeringWork,
    lateFinishToEngineeringWork,
    powerProblem,
    fuelProblem,
    swingBridgeFailure,
    escalatorFailure,
    liftFailure,
    gangwayProblem,
    closedForMaintenance,
    fuelShortage,
    deicingWork,
    wheelProblem,
    luggageCarouselProblem,
    undefinedEquipmentProblem
}

export enum EnvironmentReason {
    unknown,
    fog,
    roughSea,
    heavySnowFall,
    driftingSnow,
    blizzardConditions,
    heavyRain,
    strongWinds,
    stormConditions,
    stormDamage,
    tidalRestrictions,
    highTide,
    lowTide,
    ice,
    frozen,
    hail,
    sleet,
    highTemperatures,
    flooding,
    waterlogged,
    lowWaterLevel,
    highWaterLevel,
    fallenLeaves,
    fallenTree,
    landslide,
    undefinedEnvironmentalProblem,
    lightningStrike,
    sewerOverflow,
    grassFire
}

export enum DayType {
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
    StartTime: string;
    EndTime?: string;
};

export type InfoLink = {
    Uri: string;
}


export type Reference = {
    RelatedToRef: string[];
};

export type Repetitions = {
    DayType: DayType[];
}

export type InfoLinks = {
    InfoLink: InfoLink[];
  }

export type BasePtSituationElement = {
    CreationTime: string;
    ParticipantRef: string;
    SituationNumber: string;
    Version?: Number;
    References?: Reference;
    Source: Source;
    Progress: Progress;
    ValidityPeriod: Period[];
    Repetitions?: Repetitions;
    PublicationWindow: Period;
    Planned: boolean;
    Summary: string;
    Description: string;
    InfoLinks?: InfoLinks;
};

export type MiscReasonPtSituationElement = BasePtSituationElement & {
  MiscellaneousReason: MiscellaneousReason;
};

export type PersonnelReasonPtSituationElement = BasePtSituationElement & {
  PersonnelReason: PersonnelReason;
};

export type EquipmentReasonPtSituationElement = BasePtSituationElement & {
  EquipmentReason: EquipmentReason;
};

export type EnvironmentReasonPtSituationElement = BasePtSituationElement & {
  EnvironmentReason: EnvironmentReason;
};

export type PtSituationElement = MiscReasonPtSituationElement | PersonnelReasonPtSituationElement | EquipmentReasonPtSituationElement | EnvironmentReasonPtSituationElement;

export type SituationExchangeDelivery = {
    ResponseTimestamp: string;
    Status?: boolean;
    ShortestPossibleCycle?: string;
    Situations: PtSituationElement[];
}

export type ServiceDelivery = {
    ResponseTimestamp: string;
    ProducerRef: string;
    ResponseMessageIdentifier: string;
    SituationExchangeDelivery: SituationExchangeDelivery;
}