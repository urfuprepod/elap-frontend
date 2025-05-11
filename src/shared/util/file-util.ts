import {UploadFile} from "antd";
import {config} from "../config";
import {httpClient} from "../api/http-client";

export const getUploadFiles = (fileNames: string[] | undefined): UploadFile[] => {
    const result: UploadFile[] = [];

    if (fileNames && fileNames.length) {
        fileNames.forEach((fileName, index) => {
            const formattedFileName = fileName.substring(fileName.lastIndexOf(':') + 4);
            const fileUrl = config.endPoints.getFile.replace('{fullFileName}', fileName);

            result.push({
                uid: index.toString(),
                name: formattedFileName,
                fileName: fileName,
                status: 'done',
                url: fileUrl,
            })
        });
    }

    return result;
}

export const appendFilesToFormData = (filesFieldName: string, formData: FormData, files: UploadFile[]): FormData => {
    if (formData) {
        if (files && files.length) {
            files.forEach(async (file) => {
                if (file.originFileObj) {
                    formData.append(filesFieldName, file.originFileObj as File);
                } else if (file.url) {
                    formData.append(filesFieldName, new File([], file.name, {
                        type: file.type,
                    }));
                }
            });
        }
    }
    return formData;
}
