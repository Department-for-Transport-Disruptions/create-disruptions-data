import {
    DayType,
    EnvironmentReason,
    MiscellaneousReason,
    PersonnelReason,
    Progress,
    SourceType,
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

export const expectedSiriSx = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Siri version="2.0" xmlns="http://www.siri.org.uk/siri" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.siri.org.uk/siri http://www.siri.org.uk/schema/2.0/xsd/siri.xsd">
    <ServiceDelivery>
        <ResponseTimestamp>2023-03-06T12:00:00Z</ResponseTimestamp>
        <ProducerRef>DfT</ProducerRef>
        <ResponseMessageIdentifier>abcde-fghij-klmno-pqrst</ResponseMessageIdentifier>
        <SituationExchangeDelivery>
            <ResponseTimestamp>2023-03-06T12:00:00Z</ResponseTimestamp>
            <Situations>
                <PtSituationElement>
                    <CreationTime>2023-01-01T01:10:00Z</CreationTime>
                    <ParticipantRef>ref</ParticipantRef>
                    <SituationNumber>aaaaa-bbbbb-ccccc</SituationNumber>
                    <Version>1</Version>
                    <Source>
                        <SourceType>feed</SourceType>
                        <TimeOfCommunication>2023-01-01T01:10:00Z</TimeOfCommunication>
                    </Source>
                    <Progress>open</Progress>
                    <ValidityPeriod>
                        <StartTime>2023-03-03T01:10:00Z</StartTime>
                    </ValidityPeriod>
                    <PublicationWindow>
                        <StartTime>2023-03-02T10:10:00Z</StartTime>
                        <EndTime>2023-03-09T10:10:00Z</EndTime>
                    </PublicationWindow>
                    <PersonnelReason>staffSickness</PersonnelReason>
                    <Planned>true</Planned>
                    <Summary>Disruption Summary</Summary>
                    <Description>Disruption Description</Description>
                </PtSituationElement>
                <PtSituationElement>
                    <CreationTime>2023-02-02T05:10:00Z</CreationTime>
                    <ParticipantRef>ref2</ParticipantRef>
                    <SituationNumber>11111-22222-33333</SituationNumber>
                    <Version>2</Version>
                    <References>
                        <RelatedToRef>
                            <CreationTime>2023-01-01T01:10:00Z</CreationTime>
                            <ParticipantRef>ref</ParticipantRef>
                            <SituationNumber>aaaaa-bbbbb-ccccc</SituationNumber>
                        </RelatedToRef>
                    </References>
                    <Source>
                        <SourceType>directReport</SourceType>
                        <TimeOfCommunication>2023-02-02T10:10:00Z</TimeOfCommunication>
                    </Source>
                    <Progress>closing</Progress>
                    <ValidityPeriod>
                        <StartTime>2023-03-03T01:10:00Z</StartTime>
                        <EndTime>2023-05-01T01:10:00Z</EndTime>
                    </ValidityPeriod>
                    <PublicationWindow>
                        <StartTime>2023-03-05T10:10:00Z</StartTime>
                        <EndTime>2023-05-09T10:10:00Z</EndTime>
                    </PublicationWindow>
                    <MiscellaneousReason>vegetation</MiscellaneousReason>
                    <Planned>false</Planned>
                    <Summary>Disruption Summary 2</Summary>
                    <Description>Disruption Description 2</Description>
                    <InfoLinks>
                        <InfoLink>
                            <Uri>https://example.com</Uri>
                        </InfoLink>
                        <InfoLink>
                            <Uri>https://example.com/2</Uri>
                        </InfoLink>
                    </InfoLinks>
                </PtSituationElement>
                <PtSituationElement>
                    <CreationTime>2023-03-05T05:10:00Z</CreationTime>
                    <ParticipantRef>ref3</ParticipantRef>
                    <SituationNumber>ddddd-eeeee-fffff</SituationNumber>
                    <Version>1</Version>
                    <Source>
                        <SourceType>directReport</SourceType>
                        <TimeOfCommunication>2023-02-02T10:10:00Z</TimeOfCommunication>
                    </Source>
                    <Progress>published</Progress>
                    <ValidityPeriod>
                        <StartTime>2023-03-03T01:10:00Z</StartTime>
                    </ValidityPeriod>
                    <Repetitions>
                        <DayType>saturday</DayType>
                        <DayType>sunday</DayType>
                    </Repetitions>
                    <PublicationWindow>
                        <StartTime>2023-03-05T10:10:00Z</StartTime>
                    </PublicationWindow>
                    <EnvironmentReason>grassFire</EnvironmentReason>
                    <Planned>true</Planned>
                    <Summary>Disruption Summary 3</Summary>
                    <Description>Disruption Description 3</Description>
                </PtSituationElement>
            </Situations>
        </SituationExchangeDelivery>
    </ServiceDelivery>
</Siri>`;
