
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

enum MiscellaneousReason {
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

enum PersonnelReason {
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

enum EquipmentReason {
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

enum EnvironmentReason {
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


export type Reference = {
    RelatedToRef: string[];
};

export type PtSituationElement = {
    CreationTime: Date;
    ParticipantRef: string;
    SituationNumber: string;
    Version?: Number;
    References?: Reference;
    Source: Source;
    Progress: Progress;
    ValidityPeriod: Period[];
    Repetitions?: DayType[];
    PublicationWindow: Period;
    ReasonType?: MiscellaneousReason | PersonnelReason | EquipmentReason | EnvironmentReason;
    Planned: boolean;
    Summary: string;
    Description: string;
    InfoLinks?: InfoLink[];
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