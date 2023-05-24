import formidable from "formidable";
import { NextApiRequest } from "next";
import { notEmpty } from "..";

export interface FileData {
    name: string;
    files: formidable.Files;
    fileContents: string;
    fields?: formidable.Fields;
}

interface FilesAndFields {
    files: formidable.File[];
    fields?: formidable.Fields;
}

export const formParse = async (req: NextApiRequest): Promise<FilesAndFields> => {
    return new Promise<FilesAndFields>((resolve, reject) => {
        const form = new formidable.IncomingForm();
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

            return resolve({
                files: mappedFiles,
                fields,
            });
        });
    });
};
