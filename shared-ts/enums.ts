export enum SourceType {
    directReport = "directReport",
    email = "email",
    phone = "phone",
    fax = "fax",
    post = "post",
    feed = "feed",
    radio = "radio",
    tv = "tv",
    web = "web",
    pager = "pager",
    text = "text",
    other = "other",
}

export enum Progress {
    draft = "draft",
    open = "open",
    published = "published",
    closing = "closing",
    closed = "closed",
    pendingApproval = "pendingApproval",
    editPendingApproval = "editPendingApproval",
    draftPendingApproval = "draftPendingApproval",
    rejected = "rejected",
}

export enum MiscellaneousReason {
    accident = "accident",
    securityAlert = "securityAlert",
    congestion = "congestion",
    roadClosed = "roadClosed",
    incident = "incident",
    routeDiversion = "routeDiversion",
    unknown = "unknown",
    vandalism = "vandalism",
    overcrowded = "overcrowded",
    operatorCeasedTrading = "operatorCeasedTrading",
    vegetation = "vegetation",
    roadworks = "roadworks",
    specialEvent = "specialEvent",
    insufficientDemand = "insufficientDemand",
}

export enum PersonnelReason {
    unknown = "unknown",
    staffSickness = "staffSickness",
    staffInjury = "staffInjury",
    contractorStaffInjury = "contractorStaffInjury",
    staffAbsence = "staffAbsence",
    staffInWrongPlace = "staffInWrongPlace",
    staffShortage = "staffShortage",
    industrialAction = "industrialAction",
    unofficialIndustrialAction = "unofficialIndustrialAction",
    workToRule = "workToRule",
    undefinedPersonnelProblem = "undefinedPersonnelProblem",
}

export enum EquipmentReason {
    unknown = "unknown",
    pointsFailure = "pointsFailure",
    signalProblem = "signalProblem",
    trainWarningSystemProblem = "trainWarningSystemProblem",
    trackCircuitProblem = "trackCircuitProblem",
    signalFailure = "signalFailure",
    derailment = "derailment",
    engineFailure = "engineFailure",
    tractionFailure = "tractionFailure",
    breakDown = "breakDown",
    technicalProblem = "technicalProblem",
    brokenRail = "brokenRail",
    poorRailConditions = "poorRailConditions",
    wheelImpactLoad = "wheelImpactLoad",
    lackOfOperationalStock = "lackOfOperationalStock",
    defectiveFireAlarmEquipment = "defectiveFireAlarmEquipment",
    defectivePlatformEdgeDoors = "defectivePlatformEdgeDoors",
    defectiveCctv = "defectiveCctv",
    defectivePublicAnnouncementSystem = "defectivePublicAnnouncementSystem",
    ticketingSystemNotAvailable = "ticketingSystemNotAvailable",
    repairWork = "repairWork",
    constructionWork = "constructionWork",
    maintenanceWork = "maintenanceWork",
    emergencyEngineeringWork = "emergencyEngineeringWork",
    lateFinishToEngineeringWork = "lateFinishToEngineeringWork",
    powerProblem = "powerProblem",
    fuelProblem = "fuelProblem",
    swingBridgeFailure = "swingBridgeFailure",
    escalatorFailure = "escalatorFailure",
    liftFailure = "liftFailure",
    gangwayProblem = "gangwayProblem",
    closedForMaintenance = "closedForMaintenance",
    fuelShortage = "fuelShortage",
    deicingWork = "deicingWork",
    wheelProblem = "wheelProblem",
    luggageCarouselProblem = "luggageCarouselProblem",
    undefinedEquipmentProblem = "undefinedEquipmentProblem",
}

export enum EnvironmentReason {
    unknown = "unknown",
    fog = "fog",
    roughSea = "roughSea",
    heavySnowFall = "heavySnowFall",
    driftingSnow = "driftingSnow",
    blizzardConditions = "blizzardConditions",
    heavyRain = "heavyRain",
    strongWinds = "strongWinds",
    stormConditions = "stormConditions",
    stormDamage = "stormDamage",
    tidalRestrictions = "tidalRestrictions",
    highTide = "highTide",
    lowTide = "lowTide",
    ice = "ice",
    frozen = "frozen",
    hail = "hail",
    sleet = "sleet",
    highTemperatures = "highTemperatures",
    flooding = "flooding",
    waterlogged = "waterlogged",
    lowWaterLevel = "lowWaterLevel",
    highWaterLevel = "highWaterLevel",
    fallenLeaves = "fallenLeaves",
    fallenTree = "fallenTree",
    landslide = "landslide",
    undefinedEnvironmentalProblem = "undefinedEnvironmentalProblem",
    lightningStrike = "lightningStrike",
    sewerOverflow = "sewerOverflow",
    grassFire = "grassFire",
}

export enum DayType {
    monday = "monday",
    tuesday = "tuesday",
    wednesday = "wednesday",
    thursday = "thursday",
    friday = "friday",
    saturday = "saturday",
    sunday = "sunday",
}

export enum VehicleMode {
    bus = "bus",
    tram = "tram",
    ferryService = "ferryService",
    rail = "rail",
    underground = "underground",
}

export enum Severity {
    unknown = "unknown",
    normal = "normal",
    verySlight = "verySlight",
    slight = "slight",
    severe = "severe",
    verySevere = "verySevere",
}

export enum UserGroups {
    systemAdmins = "system-admins",
    orgAdmins = "org-admins",
    orgPublishers = "org-publishers",
    orgStaff = "org-staff",
    operators = "operators",
}

export enum PublishStatus {
    draft = "DRAFT",
    published = "PUBLISHED",
    editing = "EDITING",
    pendingApproval = "PENDING_APPROVAL",
    rejected = "REJECTED",
    editPendingApproval = "EDIT_PENDING_APPROVAL",
    pendingAndEditing = "PENDING_EDITING",
}

export enum SocialMediaPostStatus {
    pending = "Pending",
    successful = "Successful",
    rejected = "Rejected",
}

export enum Datasource {
    tnds = "tnds",
    bods = "bods",
}

export enum Modes {
    bus = "bus",
    coach = "coach",
    tram = "tram",
    ferry = "ferry",
    rail = "rail",
    underground = "underground",
    metro = "metro",
}
