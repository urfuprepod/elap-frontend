import React, {useEffect, useRef, useState} from "react";

import "./mentor-tasks-page.scss";
import {
    App,
    Button,
    Card,
    Empty,
    Flex, Form, Input, InputRef,
    List,
    Modal, Popover, Radio, Select, Space,
    Table, TableColumnType,
    TableProps,
    Tag,
    Typography, Upload, UploadFile
} from "antd";
import {IconClockHour5, IconEdit, IconPlus, IconSchool, IconUser} from "@tabler/icons-react";
import {useNavigate} from "react-router-dom";
// @ts-ignore
import Highlighter from "react-highlight-words";
import {UserInfo} from "../../shared/model/user-info";
import {FileList} from "../../shared/ui/file-list/file-list";
import TextArea from "antd/lib/input/TextArea";
import {TextBlock} from "../../shared/ui/blocks/text-block/text-block";
import moment from "moment";
import {httpClient} from "../../shared/api/http-client";
import {config} from "../../shared/config";
import {PlusOutlined, SearchOutlined} from "@ant-design/icons";
import {Editor} from "@tinymce/tinymce-react";
import {CustomUpload} from "../../shared/ui/custom-upload/custom-upload";
import {appendFilesToFormData, getUploadFiles} from "../../shared/util/file-util";
import {FilterDropdownProps} from "antd/es/table/interface";

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

export const MentorTasksPage = (): JSX.Element => {
    const navigate = useNavigate();
    const { notification } = App.useApp();

    const editorRef = useRef<any>();

    const [tasksData, setTasksData] = useState<Task[]>([]);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [selectedTasks, setSelectedTasks] = useState<Task[]>([]);
    const [newCommentText, setNewCommentText] = useState<string>('');
    const [studentsData, setStudentsData] = useState<UserInfo[]>([]);
    const [isOpenDetailsModal, setIsOpenDetailsModal] = useState<boolean>(false);
    const [isOpenReviewModal, setIsOpenReviewModal] = useState<boolean>(false);
    const [isOpenNewTaskModal, setIsOpenNewTaskModal] = useState<boolean>(false);
    const [isOpenEditTaskModal, setIsOpenEditTaskModal] = useState<boolean>(false);
    const [isOpenDeleteTaskModal, setIsOpenDeleteTaskModal] = useState<boolean>(false);
    const [isMassOpenEditTaskModal, setIsMassOpenEditTaskModal] = useState<boolean>(false);
    const [selectedTaskFileList, setSelectedTaskFileList] = useState<UploadFile[]>([]);

    const [newTaskForm] = Form.useForm<{ studentId: number, type: string, taskFiles: UploadFile[] }>();
    const [editTaskForm] = Form.useForm<{ studentId: number, type: string, taskFiles: UploadFile[] }>();
    const [newCommentForm] = Form.useForm<{ text: string, files: UploadFile[] }>();
    const [massEditTaskForm] = Form.useForm<{ type: string }>();

    useEffect(() => {
        updateTasksAndUsersData();
    }, []);

    const updateTasksAndUsersData = () => {
        httpClient.axios().get<Task[]>(config.endPoints.getAllTasks, {headers: {Authorization: `Bearer ${localStorage.getItem('token')}`}, withCredentials: true}).then((response) => {
            setTasksData(response.data);
        });
        httpClient.axios().get<UserInfo[]>(config.endPoints.getAllStudents).then((response) => {
            setStudentsData(response.data);
        });
    }

    const tasksTableProps: TableProps<Task> = {
        bordered: true,
        size: "middle",
        title: () => {return(
            <Flex gap={5}>
                <Button onClick={() => {
                setIsOpenNewTaskModal(true);
            }} icon={<IconPlus />}>Добавить задание</Button>
                <Popover title={selectedTasks.length <= 1 ? 'Выберите несколько элементов' : 'Массовое редактирование'}>
                    <Button onClick={() => {setIsMassOpenEditTaskModal(true)}}
                            icon={<IconEdit />} disabled={selectedTasks.length <= 1}>Изменить задания</Button>
                </Popover>
        </Flex>
        )},
        showHeader: true
    };

    const getEmailStudentsForFilter = () => {
        const emailsStudentArray = tasksData.filter((task) => task.student)
            .map((task) => { return { text: task.student.email, value: task.student.email }});
        const emailsStudentSet = new Set(emailsStudentArray.map((email) => JSON.stringify(email)));
        return Array.from(emailsStudentSet).map((email) => JSON.parse(email));
    }

    const getFullNameStudentsForFilter = () => {
        const fullNamesStudentArray = tasksData.filter((task) => task.student)
            .map((task) => { return { text: task.student.login, value: task.student.login }});
        const fullNamesStudentSet = new Set(fullNamesStudentArray.map((login) => JSON.stringify(login)));
        return Array.from(fullNamesStudentSet).map((login) => JSON.parse(login));
    }

    const getFullNameMentorsForFilter = () => {
        const fullNamesMentorArray = tasksData.filter((task) => task.mentor)
            .map((task) => { return { text: task.mentor.login, value: task.mentor.login }});
        const fullNamesMentorSet = new Set(fullNamesMentorArray.map((login) => JSON.stringify(login)));
        return Array.from(fullNamesMentorSet).map((login) => JSON.parse(login));
    }

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
                (<span>Эссе</span>),
            filters: [
                {
                    text: 'Рецензия',
                    value: TaskType.REVIEW,
                },
                {
                    text: 'Эссе',
                    value: TaskType.ESSAY,
                }
            ],
            onFilter: (value, record) => record.type === value as TaskType,
        },
        {
            title: 'E-mail студента',
            dataIndex: 'student',
            key: 'student',
            width: 450,
            align: 'center',
            render: (_, record) => (<Text>
                {record.student?.email}
            </Text>),
            filters: getEmailStudentsForFilter(),
            onFilter: (value, record) => record.student ? record.student.email.startsWith(value as string) : false,
            filterSearch: true,
        },
        {
            title: 'Логин студента',
            dataIndex: 'student',
            key: 'student',
            width: 450,
            align: 'center',
            render: (_, record) => (<Text>
                {record.student?.login}
            </Text>),
            filters: getFullNameStudentsForFilter(),
            onFilter: (value, record) => record.student ? record.student.login.startsWith(value as string) : false,
            filterSearch: true,
        },
        
        {
            title: 'Логин ментора',
            dataIndex: 'mentor',
            key: 'mentor',
            width: 450,
            align: 'center',
            render: (_, record) => (<Text>
                {record.mentor?.login}
            </Text>),
            filters: getFullNameMentorsForFilter(),
            onFilter: (value, record) => record.mentor ? record.mentor.login.startsWith(value as string) : false,
            filterSearch: true,
        },
        {
            title: 'Статус',
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            render: (_, record) => getStatusRender(record.status),
            filters: [
                {text: 'Создано', value: TaskStatus.CREATED},
                {text: 'На проверке', value: TaskStatus.REVIEW},
                {text: 'На доработку', value: TaskStatus.REWORK},
                {text: 'Выполнено', value: TaskStatus.COMPLETE},
            ],
            onFilter: (value, record) => record.status === value as TaskStatus,

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
                    {record.status !== TaskStatus.CREATED && record.status !== TaskStatus.COMPLETE ? (
                        <Button type="link" onClick={() => {
                            setSelectedTask(record);
                            setIsOpenReviewModal(true);}}>
                            Проверить
                        </Button>
                    ) : null}
                    {record.status === TaskStatus.CREATED ? (
                        <>
                            <Button type="link" onClick={() => {
                                setSelectedTask(record);
                                setSelectedTaskFileList(getUploadFiles(record.taskFiles));
                                setIsOpenEditTaskModal(true);}}>
                                Изменить
                            </Button>
                            <Button type="link" onClick={() => {
                                setSelectedTask(record);
                                setIsOpenDeleteTaskModal(true);}}>
                                Удалить
                            </Button>
                        </>
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

    const rowSelection: TableProps<Task>['rowSelection'] = {
        onChange: (selectedRowKeys: React.Key[], selectedRows: Task[]) => {
            setSelectedTasks(selectedRows);
        }
    };

    return (
        <div className="mentor-tasks-page">
            <div style={{textAlign: "center"}}>
                <Paragraph style={{fontSize: "18pt"}}>Задания</Paragraph>
            </div>
            <Table rowKey="id" {...tasksTableProps} columns={tasksTableColumns} pagination={{ position: ["bottomCenter"], pageSize: 6 }}
                   dataSource={tasksData} bordered rowSelection={{ type: 'checkbox', ...rowSelection }} />
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
                        <Paragraph><Text strong>Логин студента: </Text>{selectedTask.student.login}</Paragraph>
                        <Paragraph><Text strong>E-mail студента: </Text>{selectedTask.student.email}</Paragraph>
                        
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
                                                        selectedTask?.student.login : selectedTask?.mentor.login}
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
                        {selectedTask.responseText ? <Paragraph><Text strong>Ответ: </Text></Paragraph> : null}
                        {selectedTask.responseText ? <TextBlock data={selectedTask.responseText} /> : null}
                        {selectedTask.responseText ?
                            <>
                                <Paragraph><Text strong>Файлы ответа: </Text></Paragraph>
                                <FileList files={selectedTask.responseFiles ? selectedTask.responseFiles : []} />
                            </> : null}
                    </Flex>
                ) : null}
            </Modal>

            <Modal
                open={isOpenReviewModal}
                centered
                onCancel={() => {
                    setIsOpenReviewModal(false);
                    newCommentForm.resetFields(["text", "files"]);
                }}
                footer={[
                    <Button key="back" type="text" shape="round" onClick={() => {
                        setIsOpenReviewModal(false);
                        newCommentForm.resetFields(["text", "files"]);
                    }}>
                        Отмена
                    </Button>,
                    <Button key="submit" type="text" shape="round" onClick={() => {
                        if (selectedTask) {
                            newCommentForm.validateFields().then((fields) => {
                                const newCommentFiles = fields.files?.length ? fields.files
                                    .map((uploadFile) => uploadFile.originFileObj as File) : [];
                                const formData = new FormData();
                                formData.append("commentText", fields.text);
                                newCommentFiles.forEach((file) => {
                                    formData.append("commentFiles", file);
                                });

                                httpClient.axios().post(config.endPoints.setTaskStatusRework
                                    .replace('{taskId}', selectedTask.id.toString()), formData)
                                    .then((response) => {
                                        notification.success({
                                            message: 'Задание упешно отправлено на доработку!'
                                        });
                                        setIsOpenReviewModal(false);
                                        newCommentForm.resetFields(["text", "files"]);
                                        updateTasksAndUsersData();
                                    }).catch(() => {
                                    navigate('/error')
                                });
                            }).catch(() => {
                            });
                        }
                    }}>
                        Отправить на доработку
                    </Button>,
                    <Button key="submit" type="primary" shape="round" onClick={() => {
                        if (selectedTask) {
                            newCommentForm.validateFields().then((fields) => {
                                const newCommentFiles = fields.files?.length ? fields.files
                                    .map((uploadFile) => uploadFile.originFileObj as File) : [];
                                const formData = new FormData();
                                formData.append("commentText", fields.text);
                                newCommentFiles.forEach((file) => {
                                    formData.append("commentFiles", file);
                                });

                                httpClient.axios().post(config.endPoints.setTaskStatusComplete
                                    .replace('{taskId}', selectedTask.id.toString()), formData)
                                    .then((response) => {
                                        notification.success({
                                            message: 'Задание успешно принято!'
                                        });
                                        setIsOpenReviewModal(false);
                                        newCommentForm.resetFields(["text", "files"]);
                                        updateTasksAndUsersData();
                                    }).catch(() => {
                                    navigate('/error')
                                });
                            }).catch(() => {
                            });
                        }
                    }}>
                        Принять
                    </Button>
                ]}
                title="Проверка задания"
                width={800}
                cancelButtonProps={{shape: "round", type: "text"}}
            >
                {selectedTask ? (
                    <Flex vertical gap={5}>
                        <Paragraph><Text strong>Логин студента: </Text>{selectedTask.student.login}</Paragraph>
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
                                                    selectedTask?.student.login : selectedTask?.mentor.login}
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
                        {selectedTask.responseText ? <Paragraph><Text strong>Ответ: </Text></Paragraph> : null}
                        {selectedTask.responseText ? <TextBlock data={selectedTask.responseText} /> : null}
                        {selectedTask.responseFiles?.length ? <FileList files={selectedTask.responseFiles} /> : null}
                        <br />
                        <Form
                            form={newCommentForm}
                            layout="vertical"
                        >
                            <Form.Item label="Оставить коментарий:" name="text">
                                <TextArea placeholder="Введите ваш коментарий.." rows={7} />
                            </Form.Item>
                            <Form.Item label="Файлы коментария:" name="files" getValueFromEvent={normFile}
                                       rules={[
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
                                <Upload listType="picture-card" maxCount={3} beforeUpload={() => false}>
                                    <button style={{ border: 0, background: 'none' }} type="button">
                                        <PlusOutlined />
                                        <div style={{ marginTop: 8 }}>Прикрепить файл</div>
                                    </button>
                                </Upload>
                            </Form.Item>
                        </Form>
                    </Flex>
                ) : null}
            </Modal>

            <Modal
                open={isOpenNewTaskModal}
                centered
                onCancel={() => {
                    setIsOpenNewTaskModal(false);
                    newTaskForm.resetFields(["studentId", "type", "taskFiles"]);
                }}
                onOk={() => {
                    newTaskForm.validateFields().then((fields) => {
                        const taskFiles = fields.taskFiles?.length ? fields.taskFiles
                            .map((uploadFile) => uploadFile.originFileObj as File) : [];
                        const formData = new FormData();
                        formData.append("studentId", fields.studentId.toString());
                        formData.append("type", fields.type);
                        formData.append("text", editorRef.current.getContent());
                        taskFiles.forEach((file) => {
                            formData.append("taskFiles", file);
                        });

                        httpClient.axios().post(config.endPoints.addTask, formData)
                            .then((response) => {
                                notification.success({
                                    message: 'Задание успешно создано!'
                                })
                                setIsOpenNewTaskModal(false);
                                newTaskForm.resetFields(["studentId", "type", "taskFiles"]);
                                editorRef.current.resetContent();
                                updateTasksAndUsersData();
                            }).catch(() => {
                            navigate('/error')
                        });
                    }).catch(() => {});
                }}
                title="Добавить задание"
                width={800}
                okText="Добавить"
                okButtonProps={{shape: "round"}}
                cancelButtonProps={{shape: "round", type: "text"}}
            >
                <Form
                    form={newTaskForm}
                    layout="vertical"
                >
                    <Form.Item name="type" label="Тип задания:" initialValue="review" required rules={[
                        { required: true, message: 'Тип задания: обязательное поле!' },
                    ]}>
                        <Radio.Group>
                            <Radio value="review">Рецензия</Radio>
                            <Radio value="essay">Эссе</Radio>
                        </Radio.Group>
                    </Form.Item>
                    <Form.Item name="studentId" label="Студент:" required rules={[
                        { required: true, message: 'Студент: обязательное поле!' },
                    ]}>
                        <Select options={studentsData.map((student) =>
                        {return {value: student.id, label: student.login}})} />
                    </Form.Item>
                    <Form.Item label="Текст задания:">
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
                    <Form.Item label="Файлы:" name="taskFiles" getValueFromEvent={normFile} rules={[
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

            <Modal
                open={isOpenEditTaskModal}
                centered
                onCancel={() => {
                    setIsOpenEditTaskModal(false);
                    setSelectedTask(null);
                    setSelectedTaskFileList([]);
                    editTaskForm.resetFields(["studentId", "type", "taskFiles"]);
                }}
                onOk={() => {
                    if (selectedTask) {
                        editTaskForm.validateFields().then((fields) => {
                            const formData = new FormData();
                            formData.append("studentId", fields.studentId.toString());
                            formData.append("type", fields.type);
                            formData.append("text", editorRef.current.getContent());
                            appendFilesToFormData("taskFiles", formData, selectedTaskFileList);

                            httpClient.axios().put(config.endPoints.editTask
                                .replace('{taskId}', selectedTask.id.toString()), formData)
                                .then((response) => {
                                    notification.success({
                                        message: 'Задание успешно сохранено!'
                                    })
                                    setIsOpenEditTaskModal(false);
                                    editTaskForm.resetFields(["studentId", "type", "taskFiles"]);
                                    editorRef.current.resetContent();
                                    updateTasksAndUsersData();
                                }).catch(() => {
                                navigate('/error')
                            });
                        }).catch(() => {});
                    }
                }}
                title="Изменить задание"
                width={800}
                okText="Сохранить"
                okButtonProps={{shape: "round"}}
                cancelButtonProps={{shape: "round", type: "text"}}
            >
                <Form
                    form={editTaskForm}
                    layout="vertical"
                >
                    <Form.Item name="type" label="Тип задания:" initialValue={selectedTask?.type} required rules={[
                        { required: true, message: 'Тип задания: обязательное поле!' },
                    ]}>
                        <Radio.Group>
                            <Radio value="review">Рецензия</Radio>
                            <Radio value="essay">Эссе</Radio>
                        </Radio.Group>
                    </Form.Item>
                    <Form.Item name="studentId" label="Студент:" initialValue={selectedTask?.student.id} required rules={[
                        { required: true, message: 'Студент: обязательное поле!' },
                    ]}>
                        <Select options={studentsData.map((student) =>
                        {return {value: student.id, label: student.login}})} />
                    </Form.Item>
                    <Form.Item label="Текст задания:">
                        <Editor
                            tinymceScriptSrc='/tinymce/tinymce.min.js'
                            licenseKey='gpl'
                            onInit={(_evt, editor) => editorRef.current = editor}
                            initialValue={selectedTask?.text}
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
                    <Form.Item label="Файлы:" name="taskFiles" getValueFromEvent={normFile}
                               rules={[
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
                        <CustomUpload defaultFileList={selectedTaskFileList}
                                      onValueChange={(fileList) => {setSelectedTaskFileList(fileList)}} />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                open={isMassOpenEditTaskModal}
                centered
                onCancel={() => {
                    setIsMassOpenEditTaskModal(false);
                    massEditTaskForm.resetFields(["type"]);
                }}
                onOk={() => {
                    massEditTaskForm.validateFields().then((fields) => {
                        let itemsProcessed = 0;
                        selectedTasks.forEach((task, index, array) => {
                            const formData = new FormData();
                            formData.append("studentId", task.student.id.toString());
                            formData.append("type", fields.type);
                            formData.append("text", task.text);

                            httpClient.axios().put(config.endPoints.editTask
                                .replace('{taskId}', task.id.toString()), formData).then(() => {
                                itemsProcessed++;
                                if(itemsProcessed === array.length) {
                                    notification.success({
                                        message: 'Задания успешно изменены!'
                                    })
                                    setIsMassOpenEditTaskModal(false);
                                    setSelectedTasks([]);
                                    massEditTaskForm.resetFields(["type"]);
                                    setTimeout(() => {
                                        window.location.reload();
                                    }, 1500);
                                }
                            }).catch(() => {
                                navigate('/error')
                            });
                        });
                    }).catch(() => {});
                }}
                title="Массовое редактирование выбранных заданий"
                width={800}
                okText="Сохранить"
                okButtonProps={{shape: "round"}}
                cancelButtonProps={{shape: "round", type: "text"}}
            >
                <Form
                    form={massEditTaskForm}
                    layout="vertical"
                >
                    <Form.Item name="type" label="Тип задания:" required rules={[
                        { required: true, message: 'Тип задания: обязательное поле!' },
                    ]}>
                        <Radio.Group>
                            <Radio value="review">Рецензия</Radio>
                            <Radio value="essay">Эссе</Radio>
                        </Radio.Group>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                open={isOpenDeleteTaskModal}
                centered
                onCancel={() => {
                    setIsOpenDeleteTaskModal(false);
                }}
                onOk={() => {
                    if (selectedTask) {
                        httpClient.axios().delete(config.endPoints.deleteTask
                            .replace('{taskId}', selectedTask.id.toString() as string)).then(() => {
                            notification.success({
                                message: 'Задание успешно удалено!'
                            })
                            setIsOpenDeleteTaskModal(false);
                            updateTasksAndUsersData();
                        }).catch(() => {
                            navigate('/error')
                        });
                    }
                }}
                title="Удаление задания"
                width={600}
                okText="Удалить"
                okButtonProps={{shape: "round"}}
                cancelButtonProps={{shape: "round", type: "text"}}
            >
                Вы действитель хотите удалить данное задание?
            </Modal>
        </div>
    )
};
