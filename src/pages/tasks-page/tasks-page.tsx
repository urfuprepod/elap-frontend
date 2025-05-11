import React, {useContext, useEffect, useRef, useState} from "react";

import "./tasks-page.scss";
import {
    App,
    Button,
    Card,
    Empty,
    Flex, Form,
    List,
    Modal, Radio, Select, Spin,
    Table,
    TableProps,
    Tag,
    Typography, Upload, UploadFile
} from "antd";
import {IconClockHour5, IconSchool, IconUser} from "@tabler/icons-react";
import {useNavigate} from "react-router-dom";
import {UserInfo} from "../../shared/model/user-info";
import {FileList} from "../../shared/ui/file-list/file-list";
import TextArea from "antd/lib/input/TextArea";
import {TextBlock} from "../../shared/ui/blocks/text-block/text-block";
import moment from "moment";
import {httpClient} from "../../shared/api/http-client";
import {config} from "../../shared/config";
import {PlusOutlined} from "@ant-design/icons";
import {Editor} from "@tinymce/tinymce-react";
import {AuthContext} from "../../shared/ui/auth-context/auth-context";
import {AxiosError} from "axios";
import {MetrikaCounter} from "react-metrika";

const { Paragraph, Text } = Typography;

enum TaskCommentUserType {
    USER = 'user',
    MENTOR = 'mentor'
}

type TaskComment = {
    maintainerUserType: TaskCommentUserType;
    message: string;
    files?: string[];
    date: Date;
}

enum TaskType {
    REVIEW = 'review',
    ESSAY = 'essay'
}

enum TaskStatus {
    CREATED = 'created',
    REVIEW = 'review',
    REWORK = 'rework',
    COMPLETE = 'complete'
}

type Task = {
    type: TaskType,
    id: number;
    student: UserInfo;
    mentor: UserInfo;
    text: string;
    taskFiles: string[];
    status: TaskStatus;
    comments: TaskComment[];
    responseText?: string;
    responseFiles?: string[];
}

const testTasksData: Task[] = [
    {
        type: TaskType.REVIEW,
        id: 0,
        student: {
            id: 0,
            firstName: '',
            lastName: '',
            patronymic: '',
            fullName: 'Тестовый юзер',
            email: 'email@urfu.test',
            groupName: 'Тестовая группа',
            authorities: [],
            isActive: true
        },
        mentor: {
            id: 0,
            firstName: '',
            lastName: '',
            patronymic: '',
            fullName: 'Тестовый ментор',
            email: 'mentor@urfu.test',
            authorities: [],
            isActive: true
        },
        text: 'Описание тестового задания',
        taskFiles: ["10-10-24_02:36:39_CSV_Data.csv", "10-10-24_02:36:39_CSV_Data.csv"],
        status: TaskStatus.CREATED,
        comments: [
            {
                maintainerUserType: TaskCommentUserType.MENTOR,
                message: 'Выполните задание внимательно!',
                date: new Date(),
                files: ["10-10-24_02:36:39_CSV_Data.csv", "10-10-24_02:36:39_CSV_Data.csv"]
            },
            {
                maintainerUserType: TaskCommentUserType.MENTOR,
                message: 'Выполните задание внимательно!!!!!!!',
                date: new Date()
            },
            {
                maintainerUserType: TaskCommentUserType.USER,
                message: 'Да я и так внимательно делал!',
                date: new Date()
            }
        ]
    },
    {
        type: TaskType.ESSAY,
        id: 1,
        student: {
            id: 1,
            firstName: '',
            lastName: '',
            patronymic: '',
            fullName: 'Тестовый юзер',
            email: 'email@urfu.test',
            groupName: 'Тестовая группа',
            authorities: [],
            isActive: true
        },
        mentor: {
            id: 0,
            firstName: '',
            lastName: '',
            patronymic: '',
            fullName: 'Тестовый ментор',
            email: 'mentor@urfu.test',
            authorities: [],
            isActive: true
        },
        text: 'Описание тестового задания 2',
        taskFiles: [],
        status: TaskStatus.REWORK,
        comments: [
            {
                maintainerUserType: TaskCommentUserType.MENTOR,
                message: 'Выполните задание внимательно!',
                date: new Date()
            }
        ]
    }
];

export const TasksPage = (): JSX.Element => {
    const authContext = useContext(AuthContext);
    const navigate = useNavigate();
    const { notification } = App.useApp();

    const editorRef = useRef<any>();

    const [selectionType, setSelectionType] = useState<'checkbox' | 'radio'>('checkbox');

    const [tasksData, setTasksData] = useState<Task[]>([]);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isOpenDetailsModal, setIsOpenDetailsModal] = useState<boolean>(false);
    const [isOpenCreateResponseModal, setIsOpenCreateResponseModal] = useState<boolean>(false);

    const [newTaskResponseForm] = Form.useForm<{ responseFiles: UploadFile[], commentText: string }>();


    useEffect(() => {
        updateTasksData();
    }, []);

    const updateTasksData = () => {
        httpClient.axios().get<Task[]>(config.endPoints.getAllTasks).then((response) => {
            setTasksData(response.data);
        }).catch((error: AxiosError) => {
            if (error.status === 401) {
                navigate("/login");
            } else {
                navigate("/error");
            }
        });
    }

    const tasksTableProps: TableProps<Task> = {
        bordered: true,
        size: "middle",
        showHeader: true
    };

    const tasksTableColumns: TableProps<Task>['columns'] = [
        {
            title: 'Идентификатор задания',
            dataIndex: 'id',
            key: 'id',
            width: 150,
            align: 'center',
            defaultSortOrder: 'descend',
        },
        {
            title: 'Тип задания',
            dataIndex: 'type',
            key: 'type',
            width: 150,
            align: 'center',
            render: (_, record) => record.type === TaskType.REVIEW ?
                (<span>Рецензия</span>) :
                (<span>Эссе</span>)
        },
        {
            title: 'ФИО ментора',
            dataIndex: 'student',
            key: 'student',
            width: 450,
            align: 'center',
            render: (_, record) => (<Text>
                {record.mentor?.fullName}
            </Text>)
        },
        {
            title: 'Статус',
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            render: (_, record) => getStatusRender(record.status)
        },
        {
            title: 'Доступные действия',
            key: 'action',
            align: 'center',
            width: 100,
            render: (_, record) => (
                <Flex justify="center" align="center" vertical>
                    <Button type="link" onClick={() => {
                        setSelectedTask(record);
                        setIsOpenDetailsModal(true);}}>
                        Детали задания
                    </Button>
                    {record.status === TaskStatus.CREATED || record.status === TaskStatus.REWORK ? (
                        <Button type="link" onClick={() => {
                            setSelectedTask(record);
                            setIsOpenCreateResponseModal(true);
                        }}>
                            Выполнить задание
                        </Button>
                    ) : null}
                </Flex>
            ),
        },
    ];

    const getStatusRender = (status: TaskStatus): JSX.Element => {
        switch (status) {
            case (TaskStatus.CREATED): {
                return (
                    <Tag color="yellow">Создано</Tag>
                )
            }
            case (TaskStatus.REVIEW): {
                return (
                    <Tag color="blue">На проверке</Tag>
                )
            }
            case (TaskStatus.REWORK): {
                return (
                    <Tag color="orange">На доработку</Tag>
                )
            }
            case (TaskStatus.COMPLETE): {
                return (
                    <Tag color="green">Выполнено</Tag>
                )
            }
        }
    }

    const normFile = (e: any) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e?.fileList;
    };

    // rowSelection object indicates the need for row selection
    const rowSelection: TableProps<Task>['rowSelection'] = {
        onChange: (selectedRowKeys: React.Key[], selectedRows: Task[]) => {
            // console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
        },
        getCheckboxProps: (record: Task) => ({
            //
        }),
    };

    return(<>
        {authContext ? (
            <div className="tasks-page">
                <div style={{textAlign: "center"}}>
                    <Paragraph style={{fontSize: "18pt"}}>Ваши задания</Paragraph>
                </div>
                <Table {...tasksTableProps} columns={tasksTableColumns} pagination={{ position: ["bottomCenter"], pageSize: 6 }}
                       dataSource={tasksData} bordered rowSelection={{ type: selectionType, ...rowSelection }} />
                <br />

                <Modal
                    open={isOpenDetailsModal}
                    centered
                    onCancel={() => {
                        setIsOpenDetailsModal(false);
                    }}
                    footer={[]}
                    title="Детали задания"
                    width={800}
                    cancelButtonProps={{shape: "round", type: "text"}}
                >
                    {selectedTask ? (
                        <Flex vertical gap={10}>
                            <Paragraph><Text strong style={{marginRight: '5px'}}
                            >Статус задания: </Text>{getStatusRender(selectedTask.status)}</Paragraph>
                            <Paragraph><Text strong>Тип задания: </Text>{selectedTask.type === TaskType.ESSAY ? 'Эссе' : 'Рецензия'}</Paragraph>
                            <Paragraph><Text strong>ФИО ментора: </Text>{selectedTask.mentor.fullName}</Paragraph>
                            <Paragraph><Text strong>Описание задания: </Text></Paragraph>
                            <Card>
                                <TextBlock data={selectedTask.text} />
                            </Card>
                            <Paragraph><Text strong>Файлы задания: </Text></Paragraph>
                            <FileList files={selectedTask.taskFiles ? selectedTask.taskFiles : []} />
                            <Paragraph><Text strong>Коментрии: </Text></Paragraph>
                            <Card>
                                {selectedTask.comments.length ? (
                                    <List
                                        itemLayout="horizontal"
                                        dataSource={selectedTask.comments}
                                        renderItem={(item, index) => (
                                            <List.Item>
                                                <List.Item.Meta
                                                    avatar={item.maintainerUserType === TaskCommentUserType.USER ?
                                                        <IconUser /> : <IconSchool />}
                                                    title={item.maintainerUserType === TaskCommentUserType.USER ?
                                                        selectedTask?.student.fullName : selectedTask?.mentor.fullName}
                                                    description={
                                                        <Flex vertical justify="center" gap={5}>
                                                            <Flex gap={3} align="center">
                                                                <IconClockHour5 size={18} />
                                                                <Text italic>{moment(item.date).format('LLL')}</Text>
                                                            </Flex>
                                                            <Text>{item.message}</Text>
                                                            {item.files?.length ? <FileList files={item.files} /> : null}
                                                        </Flex>
                                                    }
                                                />
                                            </List.Item>
                                        )}
                                    />
                                ) : <Empty description="Коментарии отсутвуют" />}
                            </Card>
                            {selectedTask.responseText ? <Paragraph><Text strong>Ваш ответ: </Text></Paragraph> : null}
                            {selectedTask.responseText ? <Card><TextBlock data={selectedTask.responseText} /></Card> : null}
                            {selectedTask.responseText ?
                                <>
                                    <Paragraph><Text strong>Файлы ответа: </Text></Paragraph>
                                    <FileList files={selectedTask.responseFiles ? selectedTask.responseFiles : []} />
                                </> : null}
                        </Flex>
                    ) : null}
                </Modal>

                <Modal
                    open={isOpenCreateResponseModal}
                    centered
                    onCancel={() => {
                        setIsOpenCreateResponseModal(false);
                        newTaskResponseForm.resetFields(["responseFiles", "commentText"]);
                    }}
                    okText="Отправить на проверку"
                    onOk={() => {
                        if (selectedTask) {
                            const newTaskResponse = newTaskResponseForm.getFieldsValue();
                            const responseFiles = newTaskResponse.responseFiles?.length ? newTaskResponse.responseFiles
                                .map((uploadFile) => uploadFile.originFileObj as File) : [];
                            const formData = new FormData();
                            formData.append("responseText", editorRef.current.getContent());
                            responseFiles.forEach((file) => {
                                formData.append("responseFiles", file);
                            });
                            if (newTaskResponse.commentText) {
                                formData.append("commentText", newTaskResponse.commentText);
                            }

                            httpClient.axios().post(config.endPoints.addResponseTask
                                .replace('{taskId}', selectedTask.id.toString()), formData)
                                .then((response) => {
                                notification.success({
                                    message: 'Ответ успешно отправлен!'
                                })
                                setIsOpenCreateResponseModal(false);
                                newTaskResponseForm.resetFields(["responseFiles", "commentText"]);
                                editorRef.current.resetContent();
                                updateTasksData();
                            }).catch(() => {
                                navigate('/error')
                            });

                        }
                    }}
                    okButtonProps={{shape: "round"}}
                    cancelButtonProps={{shape: "round", type: "text"}}
                    title="Выполнение задания"
                    width={800}
                >
                    <Form
                        form={newTaskResponseForm}
                        layout="vertical"
                    >
                        <Form.Item label="Текст ответа:">
                            <Editor
                                tinymceScriptSrc='/tinymce/tinymce.min.js'
                                licenseKey='gpl'
                                onInit={(_evt, editor) => editorRef.current = editor}
                                initialValue=''
                                init={{
                                    language: 'ru',
                                    height: 400,
                                    branding: false,
                                    elementpath: false,
                                    help_accessibility: false,
                                    details_initial_state: 'expanded',
                                    details_serialized_state: 'collapsed',
                                    plugins: [
                                        'advlist', 'autolink', 'lists', 'charmap', 'preview', 'link',
                                        'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                                        'table', 'help', 'wordcount', 'accordion'
                                    ],
                                    menu: {
                                        file: { title: 'File', items: '' },
                                        edit: { title: 'Edit', items: 'undo redo | cut copy paste pastetext | selectall | searchreplace' },
                                        view: { title: 'View', items: 'visualblocks | spellchecker | preview fullscreen' },
                                        insert: { title: 'Insert', items: 'inserttable | link | accordion | hr | anchor' },
                                        format: { title: 'Format', items: 'bold italic underline strikethrough superscript subscript codeformat | styles blocks fontfamily fontsize align lineheight | forecolor backcolor | language | removeformat' },
                                        tools: { title: 'Tools', items: 'spellchecker spellcheckerlanguage | a11ycheck code wordcount' },
                                        table: { title: 'Table', items: 'inserttable | cell row column | advtablesort | tableprops deletetable' },
                                        help: { title: 'Help', items: 'help' }
                                    },
                                    toolbar: 'undo redo | blocks | ' +
                                        'bold italic underline strikethrough | link accordion | forecolor backcolor | alignleft aligncenter ' +
                                        'alignright alignjustify | bullist numlist outdent indent | ' +
                                        'removeformat'
                                }}
                            />
                        </Form.Item>
                        <Form.Item label="Файлы:" name="responseFiles" getValueFromEvent={normFile} rules={[
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
                        <Form.Item name="commentText" label="Ваш коментарий:">
                            <TextArea placeholder="Введите ваш коментарий.." rows={4} style={{borderRadius: "14px"}}  />
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        ) : <div className="empty-page">
            <Spin tip="Загрузка" size="large" spinning={!authContext} />
        </div>}

        <MetrikaCounter
            id={99048235}
            options={{
                trackHash: true,
                webvisor: true
            }}
        />
    </>)

};
