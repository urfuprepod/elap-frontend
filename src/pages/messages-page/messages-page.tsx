import React, {useContext, useEffect, useState} from "react";

import "./messages-page.scss";
import {AuthContext} from "../../shared/ui/auth-context/auth-context";
import {
    App,
    Button,
    Divider,
    Form,
    Input,
    Modal,
    Spin,
    Table,
    TableProps,
    Tag,
    Typography,
    Upload,
    UploadFile
} from "antd";
import {FileList} from "../../shared/ui/file-list/file-list";
import {PlusOutlined} from "@ant-design/icons";
import {httpClient} from "../../shared/api/http-client";
import {config} from "../../shared/config";
import {useNavigate} from "react-router-dom";
import {UserInfo} from "../../shared/model/user-info";
import {MetrikaCounter} from "react-metrika";

const { Paragraph, Text } = Typography;
const { TextArea } = Input;

export interface Message {
    id: number;
    student: UserInfo;
    mentor: UserInfo;
    theme: string;
    question: string;
    questionFiles?: string[];
    response?: string;
    responseFiles?: string[];
    status: string;
}

export const MessagesPage = (): JSX.Element => {
    const navigate = useNavigate();
    const { notification } = App.useApp();
    const authContext = useContext(AuthContext);

    const [selectionType, setSelectionType] = useState<'checkbox' | 'radio'>('checkbox');

    const [messagesData, setMessagesData] = useState<Message[]>([]);
    const [isOpenResponseModal, setIsOpenResponseModal] = useState<boolean>(false);
    const [responseContent, setResponseContent] = useState<string>('');
    const [responseFiles, setResponseFiles] = useState<string[]>([]);
    const [messagesAgreementFileUrl, setMessagesAgreementFileUrl] = useState<string>('');

    const [isNewQuestionModal, setIsNewQuestionModal] = useState<boolean>(false);
    const [newQuestionForm] = Form.useForm<{ theme: string; question: string; filesList: UploadFile[] }>();

    useEffect(() => {
        updateMessageData();
        updateMessageAgreementFile();
    }, []);

    const updateMessageData = () => {
        httpClient.axios().get<Message[]>(config.endPoints.getAllMessages).then((response) => {
            setMessagesData(response.data);
        }).catch(() => {
            // navigate("/error");
        });
    }

    const updateMessageAgreementFile = () => {
        httpClient.axios().get<string>(config.endPoints.getMessageAgreementFileUrl).then((response) => {
            setMessagesAgreementFileUrl(response.data);
        });
    }

    const showResponseModal = (message: Message) => {
        setResponseContent(message.response ? message.response : '');
        setResponseFiles(message.responseFiles?.length ? message.responseFiles : []);
        setIsOpenResponseModal(true);
    };

    const columns: TableProps<Message>['columns'] = [
        {
            title: 'Идентификатор вопроса',
            dataIndex: 'id',
            key: 'id',
            width: 15,
            align: 'center',
            render: (text) => <span>{parseInt(text) + 1}</span>,
            defaultSortOrder: 'descend',
        },
        {
            title: 'Тема',
            dataIndex: 'theme',
            key: 'theme',
            align: 'center'
        },
        {
            title: 'Содержание вопроса',
            dataIndex: 'question',
            key: 'question',
            align: 'center'
        },
        {
            title: 'Статус',
            key: 'status',
            dataIndex: 'status',
            align: 'center',
            render: (_, { status }) =>
                <Tag color={status === 'Ответ готов' ? "green" : (status === 'В работе' ? "blue" : "yellow")}
                     key={status}>{status}</Tag>,
            filters: [
                {
                    text: 'Создан',
                    value: 'Создан',
                },
                {
                    text: 'В работе',
                    value: 'В работе',
                },
                {
                    text: 'Ответ готов',
                    value: 'Ответ готов',
                },
            ],
            onFilter: (value, record) => record.status.indexOf(value as string) === 0,
        },
        {
            title: 'Доступные действия',
            key: 'action',
            align: 'center',
            render: (_, record) => (
                record.response ? <a
                    onClick={() => {showResponseModal(record)}}
                >
                    Ответ
                </a> : null
            ),
        },
    ];

    const normFile = (e: any) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e?.fileList;
    };

    // rowSelection object indicates the need for row selection
    const rowSelection: TableProps<Message>['rowSelection'] = {
        onChange: (selectedRowKeys: React.Key[], selectedRows: Message[]) => {
            // console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
        },
        getCheckboxProps: (record: Message) => ({
            //
        }),
    };

    return (
        <div className="messages-page">
            {authContext ? (
                    <>
                        <div style={{textAlign: "center"}}>
                            <Paragraph style={{fontSize: "18pt"}}>Вопросы ментору</Paragraph>
                        </div>
                        <Paragraph>
                            <strong>Дорогой студент</strong>,<br />
                            Перед тем, как отправить вопрос Вашему ментору, ознакомьтесь с
                            <a href={messagesAgreementFileUrl} target="_blank" rel="noreferrer"> правилами работы</a> модуля «Вопросы ментору».<br />
                        </Paragraph>
                        <Paragraph className="signature" italic>
                            С уважением,<br />команда проекта «ЭЛАП»
                        </Paragraph>
                        <Divider />
                        <Table columns={columns} pagination={{ position: ["bottomCenter"], pageSize: 6 }} dataSource={messagesData}
                               style={{marginTop: "20px"}} bordered rowSelection={{ type: selectionType, ...rowSelection }} />
                        <Button type="primary" shape="round" style={{marginTop: "20px", width: "300px", alignSelf: "center"}}
                        onClick={() => {setIsNewQuestionModal(true)}} disabled={messagesData.filter((message) =>
                            message.status === 'Создан').length >= 3}>
                            Задать вопрос ментору
                        </Button>

                        <Modal
                            open={isOpenResponseModal}
                            centered
                            onCancel={() => {
                                setIsOpenResponseModal(false);
                                setResponseContent('');
                                setResponseFiles([]);
                            }}
                            title="Ответ ментора"
                            width={600}
                            footer={[]}
                        >
                            <Paragraph>{responseContent}</Paragraph>
                            <Paragraph><Text strong>Файлы ответа: </Text></Paragraph>
                            <FileList files={responseFiles ? responseFiles : []} />
                        </Modal>

                        <Modal
                            open={isNewQuestionModal}
                            centered
                            onCancel={() => {
                                setIsNewQuestionModal(false);
                                newQuestionForm.resetFields(["theme", "question", "filesList"]);
                            }}
                            onOk={() => {
                                newQuestionForm.validateFields().then((fields) => {
                                    const newMessageFiles = fields.filesList?.length ? fields.filesList
                                        .map((uploadFile) => uploadFile.originFileObj as File) : [];

                                    const formData = new FormData();
                                    formData.append("theme", fields.theme);
                                    formData.append("question", fields.question);
                                    newMessageFiles.forEach((file) => {
                                        formData.append("questionFiles", file);
                                    });

                                    httpClient.axios().post(config.endPoints.addMessage, formData)
                                        .then((response) => {
                                            notification.success({
                                                message: 'Ваш вопрос успешно отправлен!'
                                            })
                                            setIsNewQuestionModal(false);
                                            newQuestionForm.resetFields(["theme", "question", "filesList"]);
                                            updateMessageData();
                                        }).catch(() => {
                                        navigate('/error')
                                    });
                                }).catch(() => {});
                            }}
                            title="Задать вопрос ментору"
                            width={600}
                            okText="Отправить"
                            okButtonProps={{shape: "round"}}
                            cancelButtonProps={{shape: "round", type: "text"}}
                        >
                            <Form
                                form={newQuestionForm}

                                layout="vertical"
                            >
                                <Form.Item name="theme" label="Тема:" required rules={[
                                    { required: true, message: 'Тема: обязательное поле!' },
                                    { type: 'string', min: 10, message: 'Тема: длина должна быть больше или равна 10 символам!' },
                                    { pattern: /^[?!,.а-яА-ЯёЁ0-9\s]+$/, message: 'Тема: неверный формат поля!' }
                                ]}>
                                    <Input placeholder="Тема вопроса" style={{borderRadius: "32px"}} maxLength={100} />
                                </Form.Item>
                                <Form.Item name="question" label="Вопрос:" required rules={[
                                    { required: true, message: 'Вопрос: обязательное поле!' },
                                    { type: 'string', min: 10, message: 'Вопрос: длина должна быть больше или равна 10 символам!' }
                                ]}>
                                    <TextArea placeholder="Суть вопроса" rows={6} style={{borderRadius: "14px"}}
                                              maxLength={1000} count={{max: 1000, show: true}} />
                                </Form.Item>
                                <Form.Item label="Файлы:" name="filesList" getValueFromEvent={normFile} rules={[
                                    () => ({
                                        validator(_, value) {
                                            if (!value) {
                                                return Promise.resolve();
                                            }
                                            const exceedingLimitFileSize = (value as UploadFile[])
                                                .filter((file) => {
                                                    const fileExtension = file.name.split('.').pop();
                                                    if (fileExtension === 'jpg' || fileExtension === 'jpeg' || fileExtension === 'png') {
                                                        if (file.size && file.size / (1024 * 1024) > 4) {
                                                            return file;
                                                        }
                                                    } else if (fileExtension === 'doc' || fileExtension === 'docx' || fileExtension === 'pdf') {
                                                        if (file.size && file.size / (1024 * 1024) > 5) {
                                                            return file;
                                                        }
                                                    } else {
                                                        return file;
                                                    }
                                                })
                                            if (exceedingLimitFileSize.length === 0) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('Доступные форматы и объём файла:' +
                                                ' Файлы формата doc, docx и pdf объём файла  1 МБ.' +
                                                ' Для изображений формата  png, jpeg и jpg объём файла 4 МБ.!'));
                                        },
                                    })
                                ]}>
                                    <Upload listType="picture-card" maxCount={5} beforeUpload={() => false}>
                                        <button style={{ border: 0, background: 'none' }} type="button">
                                            <PlusOutlined />
                                            <div style={{ marginTop: 8 }}>Прикрепить файл</div>
                                        </button>
                                    </Upload>
                                </Form.Item>
                            </Form>
                        </Modal>
                    </>
                ) :
                <Spin tip="Загрузка" size="large" spinning={!authContext} />}

            <MetrikaCounter
                id={99048247}
                options={{
                    trackHash: true,
                    webvisor: true
                }}
            />
        </div>
    )
};
