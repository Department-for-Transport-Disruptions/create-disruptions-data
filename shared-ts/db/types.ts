import { Generated, Insertable, JSONColumnType, Kysely, Selectable, Updateable } from "kysely";
import { ConsequenceOperators, Journey, Service, Stop, Validity } from "../disruptionTypes";
import { History } from "../disruptionTypes.zod";
import { PublishStatus, Severity, VehicleMode } from "../enums";
import { PermitStatus, TrafficManagementType, WorkCategory, WorkStatus } from "../roadwork.zod";

export interface Database {
    disruptions: DisruptionsTable;
    consequences: ConsequencesTable;
    disruptionsEdited: DisruptionsTable;
    consequencesEdited: ConsequencesTable;
    stops: StopsTable;
    stopsNew?: StopsTable;
    stopsOld?: StopsTable;
    operators: OperatorsTable;
    operatorsNew?: OperatorsTable;
    operatorsOld?: OperatorsTable;
    operatorLines: OperatorLinesTable;
    operatorLinesNew?: OperatorLinesTable;
    operatorLinesOld?: OperatorLinesTable;
    operatorPublicData: OperatorPublicDataTable;
    operatorPublicDataNew?: OperatorPublicDataTable;
    operatorPublicDataOld?: OperatorPublicDataTable;
    services: ServicesTable;
    servicesNew?: ServicesTable;
    servicesOld?: ServicesTable;
    serviceJourneyPatterns: ServiceJourneyPatternsTable;
    serviceJourneyPatternsNew?: ServiceJourneyPatternsTable;
    serviceJourneyPatternsOld?: ServiceJourneyPatternsTable;
    serviceJourneyPatternLinks: ServiceJourneyPatternLinksTable;
    serviceJourneyPatternLinksNew?: ServiceJourneyPatternLinksTable;
    serviceJourneyPatternLinksOld?: ServiceJourneyPatternLinksTable;
    serviceAdminAreaCodes: ServiceAdminAreaCodesTable;
    serviceAdminAreaCodesNew?: ServiceAdminAreaCodesTable;
    serviceAdminAreaCodesOld?: ServiceAdminAreaCodesTable;
    localities: LocalitiesTable;
    localitiesNew?: LocalitiesTable;
    localitiesOld?: LocalitiesTable;
    vehicleJourneys: VehicleJourneysTable;
    vehicleJourneysNew?: VehicleJourneysTable;
    vehicleJourneysOld?: VehicleJourneysTable;
    tracks: TracksTable;
    tracksNew?: TracksTable;
    tracksOld?: TracksTable;
    nptgAdminAreas: NptgAdminAreasTable;
    nptgAdminAreasNew?: NptgAdminAreasTable;
    nptgAdminAreasOld?: NptgAdminAreasTable;
    roadworks: RoadworksTable;
    highwayAuthorityAdminAreas: HighwayAuthorityAdminAreasTable;
}

export type KyselyDb = Kysely<Database>;

export interface DisruptionsTable {
    id: string;
    displayId: string;
    orgId: string;
    summary: string;
    description: string;
    disruptionReason: string;
    disruptionType: string;
    publishStatus: PublishStatus;
    publishStartDate: string;
    publishStartTime: string;
    publishEndDate: string | null;
    publishEndTime: string | null;
    disruptionStartDate: string;
    disruptionStartTime: string;
    disruptionEndDate: string | null;
    disruptionEndTime: string | null;
    disruptionNoEndDateTime: "true" | "" | null;
    disruptionRepeats: "doesntRepeat" | "daily" | "weekly" | null;
    disruptionRepeatsEndDate: string | null;
    validity: JSONColumnType<Validity[]> | null;
    validityStartTimestamp: Date;
    validityEndTimestamp: Date | null;
    publishStartTimestamp: Date;
    publishEndTimestamp: Date | null;
    createdByOperatorOrgId: string | null;
    socialMediaPosts: JSONColumnType<object[]> | null;
    history: JSONColumnType<History[]> | null;
    permitReferenceNumber: string | null;
    associatedLink: string | null;
    template: boolean | null;
    creationTime: string | null;
    lastUpdated: string | null;
    version: number | null;
}

export type DisruptionDB = Selectable<DisruptionsTable>;
export type NewDisruptionDB = Insertable<DisruptionsTable>;
export type DisruptionUpdateDB = Updateable<DisruptionsTable>;

export interface ConsequencesTable {
    disruptionId: string;
    consequenceIndex: number;
    consequenceType: string;
    description: string;
    disruptionDelay: string | null;
    disruptionDirection: string | null;
    disruptionSeverity: Severity;
    removeFromJourneyPlanners: string;
    vehicleMode: VehicleMode;
    services: JSONColumnType<Service[]>;
    stops: JSONColumnType<Stop[]>;
    consequenceOperators: JSONColumnType<ConsequenceOperators[]>;
    disruptionArea: JSONColumnType<string[]>;
    journeys: JSONColumnType<Journey[]>;
}

export type ConsequenceDB = Selectable<ConsequencesTable>;
export type NewConsequenceDB = Insertable<ConsequencesTable>;
export type ConsequenceUpdateDB = Updateable<ConsequencesTable>;

export interface StopsTable {
    id: Generated<number>;
    atcoCode: string;
    naptanCode: string | null;
    plateCode: string | null;
    cleardownCode: string | null;
    commonName: string | null;
    commonNameLang: string | null;
    shortCommonName: string | null;
    shortCommonNameLang: string | null;
    landmark: string | null;
    landmarkLang: string | null;
    street: string | null;
    streetLang: string | null;
    crossing: string | null;
    crossingLang: string | null;
    indicator: string | null;
    indicatorLang: string | null;
    bearing: string | null;
    nptgLocalityCode: string | null;
    localityName: string | null;
    parentLocalityName: string | null;
    grandParentLocalityName: string | null;
    town: string | null;
    townLang: string | null;
    suburb: string | null;
    suburbLang: string | null;
    localityCentre: string | null;
    gridType: string | null;
    easting: string | null;
    northing: string | null;
    longitude: string | null;
    latitude: string | null;
    stopType: string | null;
    busStopType: string | null;
    timingStatus: string | null;
    defaultWaitTime: string | null;
    notes: string | null;
    notesLang: string | null;
    administrativeAreaCode: string | null;
    creationDateTime: string | null;
    modificationDateTime: string | null;
    revisionNumber: string | null;
    modification: string | null;
    status: string | null;
}

export type StopDB = Selectable<StopsTable>;
export type NewStopDB = Insertable<StopsTable>;
export type StopUpdateDB = Updateable<StopsTable>;

export interface OperatorsTable {
    id: Generated<number>;
    nocCode: string;
    operatorPublicName: string | null;
    vosaPsvLicenseName: string | null;
    opId: string | null;
    pubNmId: string | null;
    nocCdQual: string | null;
    changeDate: string | null;
    changeAgent: string | null;
    changeComment: string | null;
    dateCeased: string | null;
    dataOwner: string | null;
}

export type OperatorDB = Selectable<OperatorsTable>;
export type NewOperatorDB = Insertable<OperatorsTable>;
export type OperatorUpdateDB = Updateable<OperatorsTable>;

export interface OperatorLinesTable {
    id: Generated<number>;
    nocLineNo: string;
    nocCode: string | null;
    pubNm: string | null;
    refNm: string | null;
    licence: string | null;
    mode: string | null;
    tlRegOwn: string | null;
    ebsrAgent: string | null;
    lo: string | null;
    sw: string | null;
    wm: string | null;
    wa: string | null;
    yo: string | null;
    nw: string | null;
    ne: string | null;
    sc: string | null;
    se: string | null;
    ea: string | null;
    em: string | null;
    ni: string | null;
    nx: string | null;
    megabus: string | null;
    newBharat: string | null;
    terravision: string | null;
    ncsd: string | null;
    easybus: string | null;
    yorksRt: string | null;
    travelEnq: string | null;
    comment: string | null;
    auditDate: string | null;
    auditEditor: string | null;
    auditComment: string | null;
    duplicate: string | null;
    dateCeased: string | null;
    cessationComment: string | null;
}

export type OperatorLineDB = Selectable<OperatorLinesTable>;
export type NewOperatorLineDB = Insertable<OperatorLinesTable>;
export type OperatorLineUpdateDB = Updateable<OperatorLinesTable>;

export interface OperatorPublicDataTable {
    id: Generated<number>;
    pubNmId: string;
    operatorPublicName: string | null;
    pubNmQual: string | null;
    ttrteEnq: string | null;
    fareEnq: string | null;
    lostPropEnq: string | null;
    disruptEnq: string | null;
    complEnq: string | null;
    twitter: string | null;
    facebook: string | null;
    linkedin: string | null;
    youtube: string | null;
    changeDate: string | null;
    changeAgent: string | null;
    changeComment: string | null;
    ceasedDate: string | null;
    dataOwner: string | null;
    website: string | null;
}

export type OperatorPublicDataDB = Selectable<OperatorPublicDataTable>;
export type NewOperatorPublicDataDB = Insertable<OperatorPublicDataTable>;
export type OperatorPublicDataUpdateDB = Updateable<OperatorPublicDataTable>;

export interface ServicesTable {
    id: Generated<number>;
    nocCode: string | null;
    lineName: string | null;
    startDate: string | null;
    operatorShortName: string | null;
    serviceDescription: string | null;
    serviceCode: string | null;
    regionCode: string | null;
    dataSource: "bods" | "tnds";
    origin: string | null;
    destination: string | null;
    lineId: string | null;
    endDate: string | null;
    inboundDirectionDescription: string | null;
    outboundDirectionDescription: string | null;
    mode: string | null;
    centrePointLon: string | null;
    centrePointLat: string | null;
}

export type ServiceDB = Selectable<ServicesTable>;
export type NewServiceDB = Insertable<ServicesTable>;
export type ServiceUpdateDB = Updateable<ServicesTable>;

export interface ServiceJourneyPatternsTable {
    id: Generated<number>;
    operatorServiceId: number;
    destinationDisplay: string | null;
    direction: string | null;
    routeRef: string | null;
    journeyPatternRef: string | null;
    sectionRefs: string | null;
}

export type ServiceJourneyPatternDB = Selectable<ServiceJourneyPatternsTable>;
export type NewServiceJourneyPatternDB = Insertable<ServiceJourneyPatternsTable>;
export type ServiceJourneyPatternUpdateDB = Updateable<ServiceJourneyPatternsTable>;

export interface ServiceJourneyPatternLinksTable {
    id: Generated<number>;
    journeyPatternId: number;
    fromAtcoCode: string;
    fromTimingStatus: string | null;
    toAtcoCode: string;
    toTimingStatus: string | null;
    runtime: string | null;
    orderInSequence: number;
    fromSequenceNumber: string | null;
    toSequenceNumber: string | null;
}

export type ServiceJourneyPatternLinkDB = Selectable<ServiceJourneyPatternLinksTable>;
export type NewServiceJourneyPatternLinkDB = Insertable<ServiceJourneyPatternLinksTable>;
export type ServiceJourneyPatternLinkUpdateDB = Updateable<ServiceJourneyPatternLinksTable>;

export interface ServiceAdminAreaCodesTable {
    serviceId: number;
    adminAreaCode: string;
}

export type ServiceAdminAreaCodeDB = Selectable<ServiceAdminAreaCodesTable>;
export type NewServiceAdminAreaCodeDB = Insertable<ServiceAdminAreaCodesTable>;
export type ServiceAdminAreaCodeUpdateDB = Updateable<ServiceAdminAreaCodesTable>;

export interface VehicleJourneysTable {
    id: Generated<number>;
    vehicleJourneyCode: string | null;
    serviceRef: string | null;
    lineRef: string | null;
    journeyPatternRef: string | null;
    departureTime: string | null;
    journeyCode: string | null;
    operatorServiceId: number | null;
    operationalForToday: boolean;
}

export type VehicleJourneyDB = Selectable<VehicleJourneysTable>;
export type NewVehicleJourneyDB = Insertable<VehicleJourneysTable>;
export type VehicleJourneyUpdateDB = Updateable<VehicleJourneysTable>;

export interface LocalitiesTable {
    id: Generated<number>;
    nptgLocalityCode: string;
    localityName: string | null;
    localityNameLang: string | null;
    shortName: string | null;
    shortNameLang: string | null;
    qualifierName: string | null;
    qualifierNameLang: string | null;
    qualifierLocalityRef: string | null;
    qualifierDistrictRef: string | null;
    parentLocalityName: string | null;
    parentLocalityNameLang: string | null;
    administrativeAreaCode: string;
    nptgDistrictCode: string | null;
    sourceLocalityType: string | null;
    gridType: string | null;
    easting: string | null;
    northing: string | null;
    creationDateTime: string | null;
    modificationDateTime: string | null;
    revisionNumber: string | null;
    modification: string | null;
}

export type LocalityDB = Selectable<LocalitiesTable>;
export type NewLocalityDB = Insertable<LocalitiesTable>;
export type LocalityUpdateDB = Updateable<LocalitiesTable>;

export interface TracksTable {
    id: Generated<number>;
    operatorServiceId: number;
    longitude: string;
    latitude: string;
}

export type TrackDB = Selectable<TracksTable>;
export type NewTrackDB = Insertable<TracksTable>;
export type TrackUpdateDB = Updateable<TracksTable>;

export interface NptgAdminAreasTable {
    id: Generated<number>;
    administrativeAreaCode: string;
    atcoAreaCode: string | null;
    name: string | null;
    shortName: string | null;
}

export type NptgAdminAreaDB = Selectable<NptgAdminAreasTable>;
export type NewNptgAdminAreaDB = Insertable<NptgAdminAreasTable>;
export type NptgAdminAreaUpdateDB = Updateable<NptgAdminAreasTable>;

export interface RoadworksTable {
    permitReferenceNumber: string;
    highwayAuthority: string | null;
    highwayAuthoritySwaCode: number;
    worksLocationCoordinates: string | null;
    streetName: string | null;
    areaName: string | null;
    workCategory: WorkCategory | null;
    trafficManagementType: TrafficManagementType | null;
    proposedStartDateTime: string | null;
    proposedEndDateTime: string | null;
    actualStartDateTime: string | null;
    actualEndDateTime: string | null;
    workStatus: WorkStatus | null;
    usrn: string | null;
    activityType: string | null;
    worksLocationType: string | null;
    isTrafficSensitive: string | null;
    permitStatus: PermitStatus | null;
    town: string | null;
    currentTrafficManagementType: TrafficManagementType | null;
    currentTrafficManagementTypeUpdateDate: string | null;
    createdDateTime: string;
    lastUpdatedDateTime: string;
}

export type RoadworkDB = Selectable<RoadworksTable>;
export type NewRoadworkDB = Insertable<RoadworksTable>;
export type RoadworkUpdateDB = Updateable<RoadworksTable>;

export interface HighwayAuthorityAdminAreasTable {
    highwayAuthoritySwaCode: number;
    administrativeAreaCode: string;
}

export type HighwayAuthorityAdminAreaDB = Selectable<HighwayAuthorityAdminAreasTable>;
export type NewHighwayAuthorityAdminAreaDB = Insertable<HighwayAuthorityAdminAreasTable>;
export type HighwayAuthorityAdminAreaUpdateDB = Updateable<HighwayAuthorityAdminAreasTable>;
