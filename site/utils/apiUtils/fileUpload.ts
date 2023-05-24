/* eslint-disable camelcase */
import formidable from "formidable";
import { NextApiRequest } from "next";

export interface FileData {
    name: string;
    files: formidable.Files;
    fileContents: string;
    fields?: formidable.Fields;
}

interface FilesAndFields {
    files: formidable.Files;
    fields?: formidable.Fields;
}

export const formParse = async (req: NextApiRequest): Promise<FilesAndFields> => {
    return new Promise<FilesAndFields>((resolve, reject) => {
        const form = new formidable.IncomingForm();
        form.parse(req, (err, fields, files) => {
            if (err) {
                return reject(err);
            }

            return resolve({
                files,
                fields,
            });
        });
    });
};
