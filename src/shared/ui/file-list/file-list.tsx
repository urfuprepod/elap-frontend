import React from "react";
import { List, Typography } from "antd";
import { IconDownload } from "@tabler/icons-react";

const { Text } = Typography;

export type FileListProps = {
    files: string[];
    needHeader?: boolean;
    link: string;
};

export const FileList: React.FC<FileListProps> = (props) => {
    const { files, needHeader, link } = props;

    return (
        <List
            itemLayout="horizontal"
            style={{ border: "1px solid #f0f0f0" }}
            header={
                needHeader ? <Text strong>Прикрепленные файлы:</Text> : null
            }
            bordered
            dataSource={files}
            locale={{ emptyText: "Нет файлов" }}
            renderItem={(item) => (
                <List.Item
                    actions={[
                        <a
                            key="download-file"
                            style={{ display: "flex", alignItems: "center" }}
                            download // Заставляет браузер скачивать файл, а не открывать его
                            target="_blank" // Открывает в новой вкладке (опционально)
                            rel="noopener noreferrer" // Безопасность для target="_blank"
                            href={`static/${link}/` + item}
                        >
                            <IconDownload size={24} />
                        </a>,
                    ]}
                >
                    <Text italic>
                        {item}
                    </Text>
                </List.Item>
            )}
        />
    );
};
