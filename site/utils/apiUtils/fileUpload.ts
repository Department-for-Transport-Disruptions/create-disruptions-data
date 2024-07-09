import formidable from "formidable";
import { NextApiRequest } from "next";
import { notEmpty } from "..";

interface FilesAndFields {
    files: formidable.File[];
    fields?: formidable.Fields;
}

export const formParse = async (req: NextApiRequest): Promise<FilesAndFields> => {
    return new Promise<FilesAndFields>((resolve, reject) => {
        const form = formidable({ allowEmptyFiles: true, minFileSize: 0 });
        form.parse(req, (err, fields, files) => {
            if (err) {
                return reject(err);
            }

            const mappedFiles = Object.entries(files)
                .map(([fileName, fileData]) => {
                    const data = Array.isArray(fileData) ? fileData[0] : fileData;

                    if (data.size !== 0) {
                        return {
                            fileName,
                            ...data,
                        };
                    }

                    return null;
                })
                .filter(notEmpty);

            const mappedFields: {
                [key: string]: string;
            } = {};

            Object.entries(fields).forEach(([fieldName, fieldData]) => {
                mappedFields[fieldName] = Array.isArray(fieldData) ? fieldData[0] : fieldData;
            });

            return resolve({
                files: mappedFiles,
                fields: mappedFields,
            });
        });
    });
};
