const sqsMessage = {
    permitReferenceNumber: "TSR1591199404915-01",
    highwayAuthority: "CITY OF WESTMINSTER",
    highwayAuthoritySwaCode: 5990,
    worksLocationCoordinates: "LINESTRING(501251.53 222574.64,501305.92 222506.65)",
    streetName: "HIGH STREET NORTH",
    areaName: "LONDON",
    workCategory: "Standard",
    trafficManagementType: "Road closure",
    proposedStartDateTime: "2020-06-10T00:00:00.000Z",
    proposedEndDateTime: "2020-06-12T00:00:00.000Z",
    actualStartDateTime: null,
    actualEndDateTime: null,
    workStatus: "Works planned",
    usrn: "8401426",
    activityType: "Remedial works",
    worksLocationType: "Cycleway, Footpath",
    isTrafficSensitive: "Yes",
    permitStatus: "permit_modification_request",
    town: "LONDON",
    currentTrafficManagementType: "Multi-way signals",
    currentTrafficManagementTypeUpdateDate: null,
    lastUpdatedDateTime: "2020-06-04T08:00:00.000Z",
};

export const mockSqsEvent = {
    Records: [
        {
            messageId: "id",
            receiptHandle: "test",
            body: JSON.stringify(sqsMessage),
            md5OfBody: "test",
            eventSource: "test",
            eventSourceARN: "test",
            awsRegion: "test",
            attributes: {
                ApproximateReceiveCount: "test",
                SentTimestamp: "test",
                SenderId: "test",
                ApproximateFirstReceiveTimestamp: "test",
            },
            messageAttributes: {
                message: { dataType: "String" },
            },
        },
    ],
};
