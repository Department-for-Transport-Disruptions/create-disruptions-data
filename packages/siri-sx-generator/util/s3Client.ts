import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export const getS3Client = (): S3Client => {
    const s3Client = new S3Client({ region: "eu-west-2" });
    return s3Client;
};

export const uploadToS3 = async (data: string, filename: string, bucketName: string | undefined) => {
    const s3Client = getS3Client();

    // Name for uploaded object
    const keyName = filename;

    const putCommand: PutObjectCommand = new PutObjectCommand({
        Bucket: bucketName,
        Key: keyName,
        Body: data,
    });

    await s3Client.send(putCommand);
    // eslint-disable-next-line no-console
    console.log("Successfully uploaded data to " + bucketName + "/" + keyName);
};
