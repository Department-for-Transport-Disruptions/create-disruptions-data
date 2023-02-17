import { SituationExchangeDelivery, SourceType, Progress, MiscellaneousReason  } from '../../../shared-ts/jsonTypes';

const jsonData: SituationExchangeDelivery = {
    ResponseTimestamp: "2021-05-11T08:51:07.016Z",
    Situations: {
        PtSituationElement: [
            {
                CreationTime: "2020-05-01T08:45:58Z",
                ParticipantRef: "ItoWorld",
                SituationNumber: "RGlzcnVwdGlvbk5vZGU6MTA3MTQ=",
                Version: 1,
                Source: {
                    SourceType: SourceType.feed,
                    TimeOfCommunication: "2021-05-11T08:49:28Z"
                },
                Progress: Progress.open,
                ValidityPeriod: [{
                    StartTime: "2020-05-03T23:00:00Z"
                }],
                PublicationWindow: {
                    StartTime: "2020-04-30T23:00:00Z"
                },
                MiscellaneousReason: MiscellaneousReason.routeDiversion,
                Planned: true,
                Summary: "Burtonhead Road (St Helens)",
                Description: "Burtonhead Road will be closed (northbound), between Milverny Way and the Recycling Centre, from Monday 4 May 2020 until further notice.",
                InfoLinks: {
                    InfoLink: [{
                        Uri: "https://www.merseytravel.gov.uk/travel-updates/burtonhead-road-(st-helens)/"
                    }]
                }
            }
        ]
    }
}

const bucketName = ""
const params = {
    Bucket: process.env.SIRI_SX_BUCKET_ARN,
    Key: 'cat.jpg', // File name you want to save as in S3
    Body: fileContent
};

// Uploading files to the bucket
s3.upload(params, function(err, data) {
    if (err) {
        throw err;
    }
    console.log(`File uploaded successfully. ${data.Location}`);
});