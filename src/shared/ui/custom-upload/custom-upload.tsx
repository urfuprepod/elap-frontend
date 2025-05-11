import {Upload} from "antd";
import {httpClient} from "../../api/http-client";
import {saveAs} from "file-saver";
import {PlusOutlined} from "@ant-design/icons";
import React, {useEffect, useState} from "react";
import {UploadChangeParam, UploadFile} from "antd/es/upload/interface";

type CustomUploadProps = {
    defaultFileList: UploadFile[];
    onValueChange(fileList: UploadFile[]): void;
};

export const CustomUpload: React.FunctionComponent<CustomUploadProps> = (props): JSX.Element => {
    const [fileList, setFileList] = useState<UploadFile[]>([]);

    useEffect(() => {
        setFileList(props.defaultFileList);
    }, [props.defaultFileList]);

    const onDownload = (file: UploadFile) => {
        if (file && file.url) {
            httpClient.axios().get<Blob>(file.url, {responseType: "blob"}).then((response) => {
                saveAs(response.data, file.name);
            })
        }
    }

    const onChange = (info: UploadChangeParam) => {
        setFileList(info.fileList);
        props.onValueChange(info.fileList);
    }

    return (
        <Upload listType="picture-card" maxCount={5} action="download"
                beforeUpload={() => false} fileList={fileList}
                onDownload={onDownload} onChange={onChange}
                showUploadList={{showPreviewIcon: false, showDownloadIcon: true, showRemoveIcon: true}}>
            <button style={{ border: 0, background: 'none' }} type="button">
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Прикрепить файл</div>
            </button>
        </Upload>
    );
}
