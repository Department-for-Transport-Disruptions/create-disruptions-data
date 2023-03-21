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
        ValidityPeriod: {
            StartTime: "2023-03-03T01:10:00Z",
        },
        PublicationWindow: {
            StartTime: "2023-03-02T10:10:00Z",
            EndTime: "2023-03-09T10:10:00Z",
        },
        ReasonType: "PersonnelReason",
        PersonnelReason: PersonnelReason.staffSickness,
        Planned: true,
        Summary: "Disruption Summary",
        Description: "Disruption Description",
        Consequences: [
            {
                Consequence: {
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
                },
            },
        ],
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
        ValidityPeriod: {
            StartTime: "2023-03-03T01:10:00Z",
            EndTime: "2023-05-01T01:10:00Z",
        },
        Planned: false,
        Summary: "Disruption Summary 2",
        Description: "Disruption Description 2",
        Consequences: [
            {
                Consequence: {
                    Condition: "unknown",
                    Severity: Severity.verySlight,
                    Affects: {
                        Operators: {
                            AffectedOperator: {
                                OperatorName: "Test Operator",
                                OperatorRef: "TEST",
                            },
                        },
                        Networks: {
                            AffectedNetwork: {
                                VehicleMode: VehicleMode.tram,
                                AllLines: "",
                            },
                        },
                    },
                },
            },
        ],
        InfoLinks: [
            {
                InfoLink: {
                    Uri: "https://example.com",
                },
            },
            {
                InfoLink: {
                    Uri: "https://example.com/2",
                },
            },
        ],
        References: [
            {
                RelatedToRef: {
                    ParticipantRef: "ref",
                    CreationTime: "2023-01-01T01:10:00Z",
                    SituationNumber: "aaaaa-bbbbb-ccccc",
                },
            },
        ],
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
        ValidityPeriod: {
            StartTime: "2023-03-03T01:10:00Z",
        },
        Planned: true,
        Summary: "Disruption Summary 3",
        Description: "Disruption Description 3",
        Repetitions: [
            {
                DayType: DayType.saturday,
            },
            {
                DayType: DayType.sunday,
            },
        ],
    },
];

export const invalidDisruptionJsonExamples: [string, object][] = [
    [
        "Missing field (ParticipantRef)",
        {
            CreationTime: "2023-01-01T01:10:00Z",
            SituationNumber: "aaaaa-bbbbb-ccccc",
            Version: 1,
            Source: {
                SourceType: SourceType.feed,
                TimeOfCommunication: "2023-01-01T01:10:00Z",
            },
            Progress: Progress.open,
            ValidityPeriod: {
                StartTime: "2023-03-03T01:10:00Z",
            },
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
    ],

    [
        "Invalid enum value (EnvironmentReason)",
        {
            CreationTime: "2023-01-01T01:10:00Z",
            SituationNumber: "aaaaa-bbbbb-ccccc",
            Version: 1,
            Source: {
                SourceType: SourceType.feed,
                TimeOfCommunication: "2023-01-01T01:10:00Z",
            },
            Progress: Progress.open,
            ValidityPeriod: {
                StartTime: "2023-03-03T01:10:00Z",
            },
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

    [
        "EndTime before StartTime",
        {
            CreationTime: "2023-01-01T01:10:00Z",
            SituationNumber: "aaaaa-bbbbb-ccccc",
            Version: 1,
            Source: {
                SourceType: SourceType.feed,
                TimeOfCommunication: "2023-01-01T01:10:00Z",
            },
            Progress: Progress.open,
            ValidityPeriod: {
                StartTime: "2023-03-03T01:10:00Z",
            },
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
];
