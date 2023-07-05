import {
    DayType,
    EnvironmentReason,
    MiscellaneousReason,
    PersonnelReason,
    Progress,
    Severity,
    SourceType,
    VehicleMode,
} from "@create-disruptions-data/shared-ts/enums";
import { PtSituationElement } from "@create-disruptions-data/shared-ts/siriTypes";
import { Consequence } from "../../../site/schemas/consequence.schema";
import { DisruptionInfo } from "../../../site/schemas/create-disruption.schema";

export const baseSiriJson: PtSituationElement = {
    CreationTime: "2023-01-01T01:10:00Z",
    ParticipantRef: "ref",
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
    disruptionId: "aaaaa-bbbbb-ccccc",
    disruptionStartDate: "03/03/2023",
    disruptionStartTime: "0110",
    publishStartDate: "02/03/2020",
    publishStartTime: "1010",
    disruptionReason: PersonnelReason.staffSickness,
    disruptionType: "planned",
    summary: "Disruption Summary",
    description: "Disruption Description",
    displayId: "8fg3ha",
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
        ParticipantRef: "ref",
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
        ParticipantRef: "ref2",
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
                    ParticipantRef: "ref",
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
        ParticipantRef: "ref3",
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

export const invalidDisruptionJsonExamples: [string, object[]][] = [
    [
        "Missing field (ParticipantRef) with valid disruption as well",
        [
            {
                CreationTime: "2023-01-01T01:10:00Z",
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
                ParticipantRef: "ref3",
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
        ],
    ],

    [
        "Invalid enum value (EnvironmentReason)",
        [
            {
                CreationTime: "2023-01-01T01:10:00Z",
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
                ReasonType: "EnvironmentReason",
                EnvironmentReason: "EnvironmentReason",
                Planned: true,
                Summary: "Disruption Summary",
                Description: "Disruption Description",
                ParticipantRef: "ref",
            },
        ],
    ],

    [
        "EndTime before StartTime",
        [
            {
                CreationTime: "2023-01-01T01:10:00Z",
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
                    EndTime: "2023-02-09T10:10:00Z",
                },
                ReasonType: "EnvironmentReason",
                EnvironmentReason: EnvironmentReason.sewerOverflow,
                Planned: true,
                Summary: "Disruption Summary",
                Description: "Disruption Description",
                ParticipantRef: "ref",
            },
        ],
    ],
];

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
