/* eslint-disable camelcase */
import formidable from "formidable";
import { NextApiRequest } from "next";
import fs from "fs";
import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from "../../constants";
import logger from "../logger";

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

interface FileUploadResponse {
    fileContents: string;
    fileError: string | null;
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

export const getFormData = async (req: NextApiRequest): Promise<FileData> => {
    const { files, fields } = await formParse(req);
    const { type, name } = files["image"];
    let fileContents = "";

    if (ACCEPTED_IMAGE_TYPES.includes(type)) {
        fileContents = await fs.promises.readFile(files["image"].path, "utf-8");
    }

    return {
        files,
        fileContents,
        fields,
        name,
    };
};

// export const validateFile = (fileData: formidable.File, fileContents: string): string => {
//     const { size, type, name } = fileData;

//     if (!fileContents && name === '') {
//         logger.warn('', { context: 'api.utils.validateFile', message: 'no file attached.' });

//         return 'Select a CSV file to upload';
//     }

//     if (!fileContents && name !== '') {
//         logger.warn('', { context: 'api.utils.validateFile', message: 'empty CSV Selected', fileName: name });

//         return 'The selected file is empty';
//     }

//     if (size > MAX_FILE_SIZE) {
//         logger.warn('', {
//             context: 'api.utils.validateFile',
//             message: 'file is too large',
//             size,
//             maxSize: MAX_FILE_SIZE,
//         });

//         return `The selected file must be smaller than 5MB`;
//     }

//     if (!ACCEPTED_IMAGE_TYPES.includes(type) && !ALLOWED_XLSX_FILE_TYPES.includes(type)) {
//         logger.warn('', { context: 'api.utils.validateFile', message: 'file not of allowed type', type });

//         return 'The selected file must be a .csv or .xlsx';
//     }

//     return '';
// };

export const processFileUpload = async (formData: FileData, inputName: string): Promise<FileUploadResponse> => {
    if (!formData.fileContents || formData.fileContents === "") {
        logger.warn("", { context: "api.utils.processFileUpload", message: "no file attached" });

        return {
            fileContents: "",
            fileError: "Select a image file to upload",
        };
    }

    const fileData = formData.files[inputName];

    const { fileContents } = formData;

    const validationResult = validateFile(fileData, fileContents);

    return {
        fileContents,
        fileError: validationResult || null,
    };
};
