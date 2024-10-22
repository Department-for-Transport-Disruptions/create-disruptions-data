import { Consequence, DisruptionInfo } from "@create-disruptions-data/shared-ts/disruptionTypes";
import {
    Datasource,
    DayType,
    EnvironmentReason,
    MiscellaneousReason,
    PersonnelReason,
    Progress,
    PublishStatus,
    Severity,
    SourceType,
    VehicleMode,
} from "@create-disruptions-data/shared-ts/enums";
import { PtSituationElement } from "@create-disruptions-data/shared-ts/siriTypes";

export const baseSiriJson: PtSituationElement = {
    CreationTime: "2023-01-01T01:10:00Z",
    ParticipantRef: "DepartmentForTransport",
    SituationNumber: "aaaaa-bbbbb-ccccc",
    Version: 1,
    Source: {
        SourceType: SourceType.feed,
        TimeOfCommunication: "2023-01-01T01:10:00Z",
    },
    Progress: Progress.open,
    ValidityPeriod: [
        {
            StartTime: "2023-03-03T01:10:00Z",
            EndTime: "2023-03-03T03:10:00Z",
        },
    ],
    PublicationWindow: {
        StartTime: "2023-03-02T10:10:00Z",
        EndTime: "2023-03-09T10:10:00Z",
    },
    ReasonType: "PersonnelReason",
    PersonnelReason: PersonnelReason.staffSickness,
    Planned: true,
    Summary: "Disruption Summary",
    Description: "Disruption Description",
    Consequences: {
        Consequence: [
            {
                Condition: "unknown",
                Severity: Severity.verySlight,
                Affects: {
                    Networks: {
                        AffectedNetwork: {
                            VehicleMode: VehicleMode.bus,
                            AllLines: "",
                        },
                    },
                },
                Advice: {
                    Details: "Some Advice",
                },
                Blocking: {
                    JourneyPlanner: false,
                },
                Delays: {
                    Delay: "PT10M",
                },
            },
        ],
    },
};

export const baseSiteDisruptionInfo: DisruptionInfo = {
    id: "aaaaa-bbbbb-ccccc",
    disruptionStartDate: "03/03/2023",
    disruptionStartTime: "0110",
    publishStartDate: "02/03/2020",
    publishStartTime: "1010",
    disruptionReason: PersonnelReason.staffSickness,
    disruptionType: "planned",
    summary: "Disruption Summary",
    description: "Disruption Description",
    displayId: "8fg3ha",
    orgId: "ce80ca56-5c1c-46f2-a70c-73429c3ad3ef",
};

export const baseConsequences: Consequence[] = [
    {
        disruptionSeverity: Severity.verySlight,
        consequenceType: "networkWide",
        vehicleMode: VehicleMode.bus,
        description: "Some Advice",
        removeFromJourneyPlanners: "no",
        disruptionDelay: "10",
        consequenceIndex: 0,
        disruptionId: "aaaaa-bbbbb-ccccc",
    },
];

export const testDisruptionsJson: PtSituationElement[] = [
    {
        CreationTime: "2023-01-01T01:10:00Z",
        ParticipantRef: "DepartmentForTransport",
        SituationNumber: "aaaaa-bbbbb-ccccc",
        Version: 1,
        Source: {
            SourceType: SourceType.feed,
            TimeOfCommunication: "2023-01-01T01:10:00Z",
        },
        Progress: Progress.open,
        ValidityPeriod: [
            {
                StartTime: "2023-03-03T01:10:00Z",
            },
        ],
        PublicationWindow: {
            StartTime: "2023-03-02T10:10:00Z",
            EndTime: "2023-03-09T10:10:00Z",
        },
        ReasonType: "PersonnelReason",
        PersonnelReason: PersonnelReason.staffSickness,
        Planned: true,
        Summary: "Disruption Summary",
        Description: "Disruption Description",
        Consequences: {
            Consequence: [
                {
                    Condition: "unknown",
                    Severity: Severity.verySlight,
                    Affects: {
                        Networks: {
                            AffectedNetwork: {
                                VehicleMode: VehicleMode.bus,
                                AllLines: "",
                            },
                        },
                    },
                    Advice: {
                        Details: "Some Advice",
                    },
                    Blocking: {
                        JourneyPlanner: false,
                    },
                    Delays: {
                        Delay: "PT10M",
                    },
                },
            ],
        },
    },
    {
        PublicationWindow: {
            StartTime: "2023-03-05T10:10:00Z",
            EndTime: "2023-05-09T10:10:00Z",
        },
        Source: {
            SourceType: SourceType.directReport,
            TimeOfCommunication: "2023-02-02T10:10:00Z",
        },
        ReasonType: "MiscellaneousReason",
        MiscellaneousReason: MiscellaneousReason.vegetation,
        CreationTime: "2023-02-02T05:10:00Z",
        ParticipantRef: "DepartmentForTransport",
        SituationNumber: "11111-22222-33333",
        Version: 2,
        Progress: Progress.closing,
        ValidityPeriod: [
            {
                StartTime: "2023-03-03T01:10:00Z",
                EndTime: "2023-05-01T01:10:00Z",
            },
            {
                StartTime: "2023-06-01T01:10:00Z",
                EndTime: "2023-06-22T11:10:00Z",
            },
        ],
        Planned: false,
        Summary: "Disruption Summary 2",
        Description: "Disruption Description 2",
        Consequences: {
            Consequence: [
                {
                    Condition: "unknown",
                    Severity: Severity.verySlight,
                    Affects: {
                        Operators: {
                            AffectedOperator: [
                                {
                                    OperatorName: "Test Operator",
                                    OperatorRef: "TEST",
                                },
                            ],
                        },
                        Networks: {
                            AffectedNetwork: {
                                VehicleMode: VehicleMode.tram,
                                AllLines: "",
                            },
                        },
                    },
                    Advice: {
                        Details: "Some More Advice",
                    },
                    Blocking: {
                        JourneyPlanner: true,
                    },
                },
            ],
        },

        InfoLinks: {
            InfoLink: [
                {
                    Uri: "https://example.com",
                },
                {
                    Uri: "https://example.com/2",
                },
            ],
        },

        References: {
            RelatedToRef: [
                {
                    ParticipantRef: "DepartmentForTransport",
                    CreationTime: "2023-01-01T01:10:00Z",
                    SituationNumber: "aaaaa-bbbbb-ccccc",
                },
            ],
        },
    },
    {
        PublicationWindow: {
            StartTime: "2023-03-05T10:10:00Z",
        },
        Source: {
            SourceType: SourceType.directReport,
            TimeOfCommunication: "2023-02-02T10:10:00Z",
        },
        ReasonType: "EnvironmentReason",
        EnvironmentReason: EnvironmentReason.grassFire,
        CreationTime: "2023-03-05T05:10:00Z",
        ParticipantRef: "DepartmentForTransport",
        SituationNumber: "ddddd-eeeee-fffff",
        Version: 1,
        Progress: Progress.published,
        ValidityPeriod: [
            {
                StartTime: "2023-03-03T01:10:00Z",
            },
        ],
        Planned: true,
        Summary: "Disruption Summary 3",
        Description: "Disruption Description 3",
        Repetitions: {
            DayType: [DayType.saturday, DayType.sunday],
        },
    },
];

export const invalidDisruptionJsonExamples: [string, object[]][] = [];

export const emptySiri = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
  <Siri version="2.0" xmlns="http://www.siri.org.uk/siri" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.siri.org.uk/siri http://www.siri.org.uk/schema/2.0/xsd/siri.xsd">
     <ServiceDelivery>
         <ResponseTimestamp>2023-03-06T12:00:00Z</ResponseTimestamp>
         <ProducerRef>DepartmentForTransport</ProducerRef>
         <ResponseMessageIdentifier>abcde-fghij-klmno-pqrst</ResponseMessageIdentifier>
         <SituationExchangeDelivery>
            <ResponseTimestamp>2023-03-06T12:00:00Z</ResponseTimestamp>
            <Situations/>
         </SituationExchangeDelivery>
     </ServiceDelivery>
 </Siri>`;

export const orgId = "6f6435e3-a485-4c8c-8c29-e121b1e76802";

export const consequenceInfoOperatorTest = {
    PK: orgId,
    SK: "acde070d-8c4c-4f0d-9d8a-162843c10333#CONSEQUENCE#0",
    consequenceIndex: 0,
    disruptionId: "acde070d-8c4c-4f0d-9d8a-162843c10333",
    consequenceType: "operatorWide",
    consequenceOperators: [{ operatorNoc: "FSYO", operatorPublicName: "Operator Name" }],
    description: "Some consequence description",
    disruptionSeverity: Severity.severe,
    vehicleMode: VehicleMode.bus,
    removeFromJourneyPlanners: "yes",
    disruptionDelay: "40",
};

export const consequenceInfoNetworkTest = {
    PK: orgId,
    SK: "acde070d-8c4c-4f0d-9d8a-162843c10333#CONSEQUENCE#1",
    consequenceIndex: 1,
    disruptionId: "acde070d-8c4c-4f0d-9d8a-162843c10333",
    consequenceType: "networkWide",
    description: "Some consequence description",
    disruptionSeverity: Severity.slight,
    vehicleMode: VehicleMode.tram,
    removeFromJourneyPlanners: "no",
    disruptionArea: ["082", "002"],
};

export const consequenceInfoServiceTest = {
    consequenceIndex: 2,
    PK: orgId,
    SK: "acde070d-8c4c-4f0d-9d8a-162843c10333#CONSEQUENCE#2",
    consequenceType: "services",
    disruptionDirection: "allDirections",
    services: [
        {
            destination: "Dest",
            origin: "Origin",
            id: 123,
            lineName: "Line",
            nocCode: "NOC",
            operatorShortName: "Test",
            dataSource: Datasource.tnds,
            lineId: "SL1",
            startDate: "2023-08-10",
            endDate: null,
            serviceCode: "1234",
        },
    ],
    description: "Service test",
    disruptionId: "acde070d-8c4c-4f0d-9d8a-162843c10333",
    disruptionSeverity: Severity.severe,
    removeFromJourneyPlanners: "yes",
    vehicleMode: VehicleMode.rail,
};

export const consequenceInfoJourneysTest = {
    PK: orgId,
    SK: "acde070d-8c4c-4f0d-9d8a-162843c10333#CONSEQUENCE#3",
    disruptionId: "acde070d-8c4c-4f0d-9d8a-162843c10333",
    description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    removeFromJourneyPlanners: "no",
    disruptionDelay: "45",
    disruptionSeverity: Severity.unknown,
    vehicleMode: "bus" as VehicleMode,
    consequenceIndex: 3,
    consequenceType: "journeys",
    services: [
        {
            destination: "HigH Green",
            id: 23127,
            lineName: "1",
            nocCode: "TEST",
            operatorShortName: "First South Yorkshire",
            origin: "Jordanthorpe",
            startDate: "2023-07-23",
            serviceCode: "NW_04_SCMN_149_1",
            dataSource: Datasource.tnds,
            lineId: "SL1",
            endDate: "2023-08-10",
        },
    ],
    journeys: [
        {
            dataSource: Datasource.tnds,
            journeyCode: null,
            vehicleJourneyCode: "VJ24",
            departureTime: "17:30:00",
            destination: "Liverpool Sir Thomas Street",
            origin: "Chester Bus Interchange",
            direction: "outbound",
        },
        {
            dataSource: Datasource.tnds,
            journeyCode: null,
            vehicleJourneyCode: "VJ25",
            departureTime: "18:00:00",
            destination: "Liverpool Sir Thomas Street",
            origin: "Chester Bus Interchange",
            direction: "outbound",
        },
    ],
};

export const disruptionHistoryInfoCreated = {
    datetime: "2023-05-13T14:45:00Z",
    historyItems: ["Disruption created and published"],
    status: "PUBLISHED",
    user: "user",
    SK: "acde070d-8c4c-4f0d-9d8a-162843c10333#HISTORY#123456",
    PK: orgId,
};

export const disruptionHistoryInfoPendingApproval = {
    datetime: "2023-05-19T14:40:00Z",
    historyItems: ["some text"],
    status: "PENDING_APPROVAL",
    user: "user",
    SK: "acde070d-8c4c-4f0d-9d8a-162843c10333#HISTORY#1234",
    PK: orgId,
};

export const disruption = {
    PK: orgId,
    SK: "acde070d-8c4c-4f0d-9d8a-162843c10333#INFO",
    publishStatus: PublishStatus.published,
    disruptionId: "acde070d-8c4c-4f0d-9d8a-162843c10333",
    description: "Test description",
    disruptionType: "planned",
    summary: "Some summary",
    disruptionReason: PersonnelReason.staffInWrongPlace,
    validity: [
        {
            disruptionStartDate: "10/03/2023",
            disruptionStartTime: "1200",
            disruptionEndDate: "17/03/2023",
            disruptionEndTime: "1700",
        },
    ],
    publishStartDate: "10/03/2023",
    publishStartTime: "1200",
    disruptionStartDate: "18/03/2023",
    disruptionStartTime: "1200",
    disruptionNoEndDateTime: "true",
    consequences: [],
    displayId: "8fg3ha",
    orgId: orgId,
    history: [
        {
            datetime: "2023-05-19T14:40:00Z",
            status: "PENDING_APPROVAL",
            user: "Test User 1",
            historyItems: ["Some Text"],
        },
        {
            datetime: "2023-05-13T14:45:00Z",
            status: "PUBLISHED",
            user: "Test User 3",
            historyItems: ["Disruption created and published", "Some More Text"],
        },
        {
            datetime: "2023-05-11T14:40:00Z",
            status: "PENDING_APPROVAL",
            user: "Test User 1",
            historyItems: ["Some Text"],
        },
    ],
    lastUpdated: "2023-05-11T14:40:00Z",
};

export const invalidDisruption1 = {
    PK: orgId,
    SK: "fcbf40b2-8a13-4f96-9306-0a89036146bf#INFO",
    publishStatus: PublishStatus.published,
    disruptionId: "fcbf40b2-8a13-4f96-9306-0a89036146bf",
    description: "Test description",
    disruptionType: "planned",
    summary: "Some summary",
    disruptionReason: PersonnelReason.staffInWrongPlace,
    validity: [
        {
            disruptionStartDate: "10/03/2023",
            disruptionStartTime: "1200",
            disruptionEndDate: "17/03/2023",
            disruptionEndTime: "1700",
        },
    ],
    publishStartDate: "10/03/2023",
    publishStartTime: "1200",
    disruptionStartDate: "18/03/2023",
    disruptionStartTime: "1200",
    disruptionNoEndDateTime: "",
    consequences: [],
    displayId: "8fg3ha",
    orgId: orgId,
    history: [
        {
            datetime: "2023-05-19T14:40:00Z",
            status: "PENDING_APPROVAL",
            user: "Test User 1",
            historyItems: ["Some Text"],
        },
        {
            datetime: "2023-05-13T14:45:00Z",
            status: "PUBLISHED",
            user: "Test User 3",
            historyItems: ["Disruption created and published", "Some More Text"],
        },
        {
            datetime: "2023-05-11T14:40:00Z",
            status: "PENDING_APPROVAL",
            user: "Test User 1",
            historyItems: ["Some Text"],
        },
    ],
    lastUpdated: "2023-05-11T14:40:00Z",
};

export const invalidDisruption2 = {
    PK: orgId,
    SK: "952ad8f9-c6f6-4ca2-a4e9-4554cbf69fb6#INFO",
    publishStatus: PublishStatus.published,
    disruptionId: "952ad8f9-c6f6-4ca2-a4e9-4554cbf69fb6",
    description: "Test description",
    disruptionType: "planned",
    summary: "Some summary",
    disruptionReason: "Invalid reason",
    validity: [
        {
            disruptionStartDate: "10/03/2023",
            disruptionStartTime: "1200",
            disruptionEndDate: "17/03/2023",
            disruptionEndTime: "1700",
        },
    ],
    publishStartDate: "10/03/2023",
    publishStartTime: "1200",
    disruptionStartDate: "18/03/2023",
    disruptionStartTime: "1200",
    disruptionNoEndDateTime: "true",
    consequences: [],
    displayId: "8fg3ha",
    orgId: orgId,
    history: [
        {
            datetime: "2023-05-19T14:40:00Z",
            status: "PENDING_APPROVAL",
            user: "Test User 1",
            historyItems: ["Some Text"],
        },
        {
            datetime: "2023-05-13T14:45:00Z",
            status: "PUBLISHED",
            user: "Test User 3",
            historyItems: ["Disruption created and published", "Some More Text"],
        },
        {
            datetime: "2023-05-11T14:40:00Z",
            status: "PENDING_APPROVAL",
            user: "Test User 1",
            historyItems: ["Some Text"],
        },
    ],
    lastUpdated: "2023-05-11T14:40:00Z",
};

export const draftDisruption = {
    PK: orgId,
    SK: "bd679c69-5a16-431f-8801-e6b9b526525a#INFO",
    publishStatus: PublishStatus.draft,
    disruptionId: "bd679c69-5a16-431f-8801-e6b9b526525a",
    description: "Test description",
    disruptionType: "planned",
    summary: "Some summary",
    disruptionReason: PersonnelReason.staffInWrongPlace,
    validity: [
        {
            disruptionStartDate: "10/03/2023",
            disruptionStartTime: "1200",
            disruptionEndDate: "17/03/2023",
            disruptionEndTime: "1700",
        },
    ],
    publishStartDate: "10/03/2023",
    publishStartTime: "1200",
    disruptionStartDate: "18/03/2023",
    disruptionStartTime: "1200",
    disruptionNoEndDateTime: "true",
    consequences: [],
    displayId: "8fg3ha",
    orgId: orgId,
    lastUpdated: "2023-05-11T14:40:00Z",
};

export const expiredDisruption = {
    PK: orgId,
    SK: "e6ea3e32-8fe5-4e18-869a-435752084ecd#INFO",
    publishStatus: PublishStatus.published,
    disruptionId: "e6ea3e32-8fe5-4e18-869a-435752084ecd",
    description: "Test description",
    disruptionType: "planned",
    summary: "Some summary",
    disruptionReason: PersonnelReason.staffInWrongPlace,
    publishStartDate: "10/03/2023",
    publishStartTime: "1200",
    publishEndDate: "28/03/2023",
    publishEndTime: "1200",
    disruptionStartDate: "18/03/2023",
    disruptionStartTime: "1200",
    disruptionEndDate: "24/03/2023",
    disruptionEndTime: "1200",
    disruptionNoEndDateTime: "",
    consequences: [],
    displayId: "8fg3ha",
    orgId: orgId,
    history: [
        {
            datetime: "2023-05-19T14:40:00Z",
            status: "PENDING_APPROVAL",
            user: "Test User 1",
            historyItems: ["Some Text"],
        },
        {
            datetime: "2023-05-13T14:45:00Z",
            status: "PUBLISHED",
            user: "Test User 3",
            historyItems: ["Disruption created and published", "Some More Text"],
        },
        {
            datetime: "2023-05-11T14:40:00Z",
            status: "PENDING_APPROVAL",
            user: "Test User 1",
            historyItems: ["Some Text"],
        },
    ],
    lastUpdated: "2023-05-11T14:40:00Z",
};

export const dbResponse = [
    disruption,
    consequenceInfoOperatorTest,
    consequenceInfoNetworkTest,
    consequenceInfoServiceTest,
    consequenceInfoJourneysTest,
    invalidDisruption1,
    invalidDisruption2,
    draftDisruption,
    expiredDisruption,
    disruptionHistoryInfoPendingApproval,
    disruptionHistoryInfoCreated,
];

export const dbResponseWithCreationTime = [
    { ...disruption, creationTime: "2023-05-13T14:45:00Z" },
    consequenceInfoOperatorTest,
    consequenceInfoNetworkTest,
    invalidDisruption1,
    invalidDisruption2,
    draftDisruption,
    expiredDisruption,
];
