import React, {useEffect, useRef, useState} from "react";

import "./mentor-messages-page.scss";
import {
    App,
    Button,
    Flex, Form,
    Input,
    InputRef, Modal, Select,
    Space,
    Table,
    TableColumnsType, TableColumnType,
    TableProps,
    Tag,
    Typography, Upload, UploadFile
} from "antd";
import {httpClient} from "../../shared/api/http-client";
import {config} from "../../shared/config";
import {FilterDropdownProps} from "antd/es/table/interface";
import {PlusOutlined, SearchOutlined} from "@ant-design/icons";
// @ts-ignore
import Highlighter from "react-highlight-words";
import {IconPlus} from "@tabler/icons-react";
import {useNavigate} from "react-router-dom";
import {UserInfo} from "../../shared/model/user-info";
import {MentorInfo} from "../../shared/model/mentor-info";
import {Message} from "../messages-page/messages-page";
import {FileList} from "../../shared/ui/file-list/file-list";
import TextArea from "antd/lib/input/TextArea";
import {MessagesAgreementFileUrl} from "../../shared/model/messagesAgreementFile";

const { Paragraph, Text } = Typography;

export const MentorMessagesPage = (): JSX.Element => {
    const navigate = useNavigate();
    const { notification } = App.useApp();

    const [selectionType, setSelectionType] = useState<'checkbox' | 'radio'>('checkbox');

    const [mentorMessagesData, setMentorMessagesData] = useState<Message[]>([]);
    const [messagesAgreementFileUrl, setMessagesAgreementFileUrl] = useState<string>('');
    const [isEditMessagesAgreementFileUrl, setIsEditMessagesAgreementFileUrl] = useState<boolean>(false);
    const [isOpenRequestModal, setIsOpenRequestModal] = useState<boolean>(false);
    const [isOpenCreateModal, setIsOpenCreateResponse] = useState<boolean>(false);
    const [requestContent, setRequestContent] = useState<Message | null>(null);
    const [requestStudent, setRequestStudent] = useState<UserInfo | null>(null);
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');

    const searchInput = useRef<InputRef>(null);

    const [createResponseForm] = Form.useForm<{ response: string; filesList: UploadFile[] }>();

    useEffect(() => {
        updateMentorMessagesData();
        updateMessageAgreementFile();
    }, []);

    const updateMentorMessagesData = () => {
        httpClient.axios().get<Message[]>(config.endPoints.getAllMessages).then((response) => {
            setMentorMessagesData(response.data);
        });
    }

    const updateMessageAgreementFile = () => {
        httpClient.axios().get<string>(config.endPoints.getMessageAgreementFileUrl).then((response) => {
            setMessagesAgreementFileUrl(response.data);
        });
    }

    type DataIndex = keyof Message;

    const handleSearch = (
        selectedKeys: string[],
        confirm: FilterDropdownProps['confirm'],
        dataIndex: DataIndex,
    ) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };

    const handleReset = (clearFilters: () => void) => {
        clearFilters();
        setSearchText('');
    };

    const getColumnSearchProps = (dataIndex: DataIndex): TableColumnType<Message> => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
            <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
                <Input
                    ref={searchInput}
                    placeholder={`Введите..`}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
                    style={{ marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Найти
                    </Button>
                    <Button
                        onClick={() => clearFilters && handleReset(clearFilters)}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Сбросить
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            confirm({ closeDropdown: false });
                            setSearchText((selectedKeys as string[])[0]);
                            setSearchedColumn(dataIndex);
                        }}
                    >
                        Применить
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            close();
                        }}
                    >
                        Закрыть
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered: boolean) => (
            <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
        ),
        onFilter: (value, record) =>
            // @ts-ignore
            record[dataIndex]
                .toString()
                .toLowerCase()
                .includes((value as string).toLowerCase()),
        onFilterDropdownOpenChange: (visible) => {
            if (visible) {
                setTimeout(() => searchInput.current?.select(), 100);
            }
        },
        render: (text) =>
            searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ''}
                />
            ) : (
                text
            ),
    });

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
            title: 'E-mail студента',
            dataIndex: 'student',
            key: 'student',
            width: 450,
            align: 'center',
            render: (_, record) => (<Text>
                {record.student?.email}
            </Text>)
        },
        {
            title: 'ФИО студента',
            dataIndex: 'student',
            key: 'student',
            width: 450,
            align: 'center',
            render: (_, record) => (<Text>
                {record.student?.fullName}
            </Text>)
        },
        {
            title: 'Группа студента',
            dataIndex: 'student',
            key: 'student',
            width: 450,
            align: 'center',
            render: (_, record) => (<Text>
                {record.student?.groupName}
            </Text>)
        },
        {
            title: 'ФИО ментора',
            dataIndex: 'mentor',
            key: 'mentor',
            width: 450,
            align: 'center',
            render: (_, record) => (<Text>
                {record.mentor?.fullName}
            </Text>)
        },

        {
            title: 'Тема',
            dataIndex: 'theme',
            key: 'theme',
            align: 'center',
            ...getColumnSearchProps('theme'),
        },
        {
            title: 'Содержание вопроса',
            dataIndex: 'question',
            key: 'question',
            align: 'center',
            ...getColumnSearchProps('question'),
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
                <Flex justify="center" align="center" vertical>
                    <Button type="link" onClick={() => {
                        setRequestContent(record)
                        setIsOpenRequestModal(true);
                        httpClient.axios().get<UserInfo>(config.endPoints.getStudent
                            .replace('{userId}', record.student?.id.toString())).then((response) => {
                            setRequestStudent(response.data);
                        })
                    }}>Детали вопроса</Button>
                    {record.status === 'Создан' ? <Button type="link" onClick={() => {
                        httpClient.axios().post(config.endPoints.changeMessageStatus
                            .replace('{messageId}', record.id.toString())).then(() => {
                            notification.success({
                                message: 'Статус успешно обновлен!'
                            });
                            updateMentorMessagesData();
                        })
                    }}>Взять в работу</Button> : (record.status === 'В работе') ? (
                        <Button type="link" onClick={() => {
                            setRequestContent(record);
                            setIsOpenCreateResponse(true);
                        }}>Дать ответ</Button>
                    ) : null}
                </Flex>
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
        <div className="mentor-messages-page">
            <div style={{textAlign: "center"}}>
                <Paragraph style={{fontSize: "18pt"}}>Вопросы</Paragraph>
            </div>
            <Text>Ссылка на файл с правилами платформы:</Text>
            <Flex gap={5}>
                <Input placeholder="Введите ссылку на файл.." value={messagesAgreementFileUrl} style={{borderRadius: "32px"}}
                       maxLength={100} disabled={!isEditMessagesAgreementFileUrl} onChange={(e) => {
                           setMessagesAgreementFileUrl(e.target.value);
                }} />
                {isEditMessagesAgreementFileUrl ?
                    <Button shape="round" type="primary" onClick={() => {
                        httpClient.axios().put(config.endPoints.editMessageAgreementFileUrl,
                            {messagesAgreementFileUrl: messagesAgreementFileUrl}).then(() => {
                            notification.success({
                                message: 'Ссылка успешно изменена!'
                            });
                            setIsEditMessagesAgreementFileUrl(false);
                        });
                    }}>
                        Сохранить
                    </Button> :
                    <Button shape="round" type="text" onClick={() => {setIsEditMessagesAgreementFileUrl(true)}}>
                        Изменить
                    </Button>}
            </Flex>

            <Table columns={columns} pagination={{ position: ["bottomCenter"], pageSize: 6 }} dataSource={mentorMessagesData}
                   bordered rowSelection={{ type: selectionType, ...rowSelection }} />

            <Modal
                open={isOpenRequestModal}
                centered
                onCancel={() => {
                    setIsOpenRequestModal(false);
                    setRequestContent(null);
                    setRequestStudent(null);
                }}
                title="Детали вопроса"
                width={600}
                footer={[]}
            >
                <Paragraph><Text strong>ФИО студента: </Text>{requestStudent?.fullName}</Paragraph>
                <Paragraph><Text strong>E-mail студента: </Text>{requestStudent?.email}</Paragraph>
                <Paragraph><Text strong>Группа студента: </Text>{requestStudent?.groupName}</Paragraph>
                <Paragraph><Text strong>Тема: </Text>{requestContent?.theme}</Paragraph>
                <Paragraph><Text strong>Вопрос: </Text>{requestContent?.question}</Paragraph>
                <Paragraph><Text strong>Файлы вопроса: </Text></Paragraph>
                <FileList files={requestContent?.questionFiles ? requestContent?.questionFiles : []} />
                {requestContent?.response ? <Paragraph><Text strong>Ответ: </Text>{requestContent?.response}</Paragraph> : null}
                {requestContent?.response ?
                    <>
                        <Paragraph><Text strong>Файлы ответа: </Text></Paragraph>
                        <FileList files={requestContent?.responseFiles ? requestContent?.responseFiles : []} />
                    </> : null}
            </Modal>

            <Modal
                open={isOpenCreateModal}
                centered
                onCancel={() => {
                    setIsOpenCreateResponse(false);
                    createResponseForm.resetFields(["response", "filesList"]);
                }}
                onOk={() => {
                    if (requestContent) {
                        createResponseForm.validateFields().then((fields) => {
                            const responseFiles = fields.filesList?.length ? fields.filesList
                                .map((uploadFile) => uploadFile.originFileObj as File) : [];
                            const formData = new FormData();
                            formData.append("messageId", requestContent.id.toString());
                            formData.append("response", fields.response);
                            responseFiles.forEach((file) => {
                                formData.append("responseFiles", file);
                            });

                            httpClient.axios().post(config.endPoints.createMessageResponse, formData)
                                .then((response) => {
                                    notification.success({
                                        message: 'Ваш вопрос успешно отправлен!'
                                    })
                                    setIsOpenCreateResponse(false);
                                    createResponseForm.resetFields(["response", "filesList"]);
                                    updateMentorMessagesData();
                                }).catch(() => {
                                navigate('/error')
                            });
                        }).catch(() => {});
                    }
                }}
                title="Дать ответ"
                width={600}
                okText="Отправить"
                okButtonProps={{shape: "round"}}
                cancelButtonProps={{shape: "round", type: "text"}}
            >
                <Form
                    form={createResponseForm}
                    layout="vertical"
                >
                    <Form.Item name="response" label="Ответ:" required rules={[
                        { required: true, message: 'Ответ: обязательное поле!' },
                        { type: 'string', min: 10, message: 'Ответ: длина должна быть больше или равна 10 символам!' },
                    ]}>
                        <TextArea placeholder="Опишите ваш ответ" rows={6} style={{borderRadius: "14px"}}
                                  maxLength={1000} count={{max: 1000, show: true}} />
                    </Form.Item>
                    <Form.Item name="filesList" label="Файлы:" getValueFromEvent={normFile} rules={[
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
        </div>
    )
};
