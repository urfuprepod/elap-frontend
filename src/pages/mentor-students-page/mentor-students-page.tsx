import React, {useEffect, useRef, useState} from "react";

import "./mentor-students-page.scss";
import {
    App,
    Button,
    Flex, Form,
    Input,
    InputRef, Modal, Popover, Select,
    Space,
    Table,
    TableColumnsType, TableColumnType,
    TableProps,
    Tag,
    Typography
} from "antd";
import {httpClient} from "../../shared/api/http-client";
import {config} from "../../shared/config";
import {FilterDropdownProps} from "antd/es/table/interface";
import {SearchOutlined} from "@ant-design/icons";
// @ts-ignore
import Highlighter from "react-highlight-words";
import {IconEdit, IconPlus} from "@tabler/icons-react";
import {useNavigate} from "react-router-dom";
import {UserInfo} from "../../shared/model/user-info";
import {TableRef} from "antd/lib/table";

const { Paragraph, Text } = Typography;

export const MentorStudentsPage = (): JSX.Element => {
    const navigate = useNavigate();
    const { notification } = App.useApp();
    const { Option } = Select;

    const [studentsData, setStudentsData] = useState<UserInfo[]>([]);
    const [selectedStudents, setSelectedStudents] = useState<UserInfo[]>([]);
    const [mentorsData, setMentorsData] = useState<UserInfo[]>([]);
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const [isRegisterStudentModal, setIsRegisterStudentModal] = useState<boolean>(false);
    const [isEditStudentModal, setIsEditStudentModal] = useState<boolean>(false);
    const [isDeleteStudentModal, setIsDeleteStudentModal] = useState<boolean>(false);
    const [isMassEditStudentModal, setIsMassEditStudentModal] = useState<boolean>(false);
    const [selectedStudent, setSelectedStudent] = useState<UserInfo | null>(null);
    const [emailType, setEmailType] = useState<string>("@urfu.ru");

    const searchInput = useRef<InputRef>(null);
    const tableRef = useRef<TableRef>(null);

    const [registerUserForm] = Form.useForm<{ login: string, email: string }>();
    const [editUserForm] = Form.useForm<{ login: string; mentorId: number }>();
    const [massEditUserForm] = Form.useForm<{ groupName: string; mentorId: number, status: number }>();

    useEffect(() => {
        updateStudentsAndMentorsData();
    }, []);

    const updateStudentsAndMentorsData = () => {
        httpClient.axios().get<UserInfo[]>(config.endPoints.getAllStudents).then((response) => {
            setStudentsData(response.data);
        });
        httpClient.axios().get<UserInfo[]>(config.endPoints.getAllMentors).then((response) => {
            setMentorsData(response.data);
        });
    }

    const tableProps: TableProps<UserInfo> = {
        bordered: true,
        size: "middle",
        title: () => {return(
            <Flex gap={5}>
                <Button onClick={() => {setIsRegisterStudentModal(true)}}
                        icon={<IconPlus />}>Добавить студента</Button>
                <Popover title={selectedStudents.length <= 1 ? 'Выберите несколько элементов' : 'Массовое редактирование'}>
                    <Button onClick={() => {setIsMassEditStudentModal(true)}}
                            icon={<IconEdit />} disabled={selectedStudents.length <= 1}>Изменить студентов</Button>
                </Popover>
            </Flex>
        )},
        showHeader: true,
    };

    type DataIndex = keyof UserInfo;

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

    const getColumnSearchProps = (dataIndex: DataIndex): TableColumnType<UserInfo> => ({
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

    const tableColumns: TableColumnsType<UserInfo> = [
        {
            title: 'Идентификатор',
            dataIndex: 'id',
            width: '10%',
            align: 'center',
            defaultSortOrder: 'descend',
        },
        {
            title: 'Логин',
            dataIndex: 'login',
            width: '35%',
            align: 'center',
            ...getColumnSearchProps('login'),
        },
        
        {
            title: 'E-mail',
            dataIndex: 'email',
            width: '15%',
            align: 'center',
            ...getColumnSearchProps('email'),
        },
        {
            title: 'Логин ментора',
            dataIndex: 'mentor',
            width: '25%',
            render: (_, record) => (
                <span>{record.mentor?.fullName}</span>
            ),
            align: 'center',
            filters: Array.from(new Set(
                mentorsData.map((mentor) => { return { text: mentor.login, value: mentor.login }})
            )),
            onFilter: (value, record) => record.mentor ? record.mentor.fullName.startsWith(value as string) : false,
            filterSearch: true,
        },
        {
            title: 'Статус студента',
            dataIndex: 'isActive',
            width: '10%',
            render: (_, record) => (
                <Tag color={record.isActive ? "green" : "red"}>{record.isActive ? "Активен" : "Деактивирован / не активирован"}</Tag>
            ),
            align: 'center',
            filters: [
                {
                    text: 'Активен',
                    value: true,
                },
                {
                    text: 'Деактивирован / не активирован',
                    value: false,
                }
            ],
            onFilter: (value, record) => record.isActive === value as boolean,

        },
        {
            title: 'Доступные действия',
            key: 'action',
            align: 'center',
            width: '15%',
            render: (_, record) => (
                <Flex justify="center" align="center" gap={10} vertical>
                    <Button type="link" onClick={() => {
                        setSelectedStudent(record);
                        setIsEditStudentModal(true);
                    }}>
                        Редактировать
                    </Button>
                    <Button type="link" danger onClick={() => {
                        setSelectedStudent(record);
                        setIsDeleteStudentModal(true);
                    }}>
                        Деактивировать / Удалить
                    </Button>
                    {!record.isActive ? <Button type="link" onClick={() => {
                        if (record) {
                            httpClient.axios().post(config.endPoints.activateUser
                                .replace('{userId}', record.id.toString())).then(() => {

                                setIsDeleteStudentModal(false);
                                notification.success({
                                    message: 'Пользователь успешно активирован!'
                                });
                                updateStudentsAndMentorsData();
                            });
                        }
                    }}>
                        Активировать
                    </Button> : null}
                </Flex>
            ),
        }
    ];

    const rowSelection: TableProps<UserInfo>['rowSelection'] = {
        onChange: (selectedRowKeys: React.Key[], selectedRows: UserInfo[]) => {
            setSelectedStudents(selectedRows);
        },
        selectedRowKeys: selectedStudents.map((student) => student.id)
    };

    const selectAfter = (
        <Select defaultValue={emailType} onChange={(value) => {setEmailType(value)}} tabIndex={-1}>
            <Option value="@urfu.ru">@urfu.ru</Option>
            <Option value="@urfu.me">@urfu.me</Option>
        </Select>
    );

    return (
        <div className="mentor-students-page">
            <div style={{textAlign: "center"}}>
                <Paragraph style={{fontSize: "18pt"}}>Студенты</Paragraph>
            </div>
            <Table<UserInfo>
                {...tableProps}
                rowKey="id"
                pagination={{ position: ["bottomCenter"], pageSize: 6 }}
                columns={tableColumns}
                dataSource={studentsData}
                rowSelection={{ type: 'checkbox', ...rowSelection }}
            />
            <Modal
                open={isRegisterStudentModal}
                centered
                onCancel={() => {
                    setIsRegisterStudentModal(false);
                    registerUserForm.resetFields(["login", "email"]);
                }}
                onOk={() => {
                    registerUserForm.validateFields().then((fields) => {
                        httpClient.axios().post(config.endPoints.registerUser, {
                             login: fields.login, email: `${fields.email}${emailType}`
                        }).then((response) => {
                            notification.success({
                                message: 'Пользователь успешно создан!'
                            })
                            setIsRegisterStudentModal(false);
                            registerUserForm.resetFields([ "login", "email"]);
                            updateStudentsAndMentorsData();
                        }).catch(() => {
                            navigate('/error')
                        });
                    }).catch(() => {});
                }}
                title="Создать пользователя"
                width={600}
                okText="Создать"
                okButtonProps={{shape: "round"}}
                cancelButtonProps={{shape: "round", type: "text"}}
            >
                <Form
                    form={registerUserForm}
                    layout="vertical"
                >
                    <Form.Item
                        label="Логин:"
                        labelAlign="left"
                        name="login"
                        rules={[
                            { required: true, message: 'Логин: обязательное поле!' },
                            { pattern: /^[а-яА-ЯёЁ]+$/, message: 'Логин: неверный формат поля!' }
                        ]}
                    >
                        <Input placeholder="Введите логин.." style={{borderRadius: "32px"}}/>
                    </Form.Item>
                    

                    <Form.Item
                        label="E-mail:"
                        labelAlign="left"
                        tooltip="Название учетной записи, которая привязана к личному кабинету на сайте УрФУ"
                        name="email"
                        rules={[
                            { required: true, message: 'E-mail: обязательное поле!' },
                            { pattern: /^\w+([\.-]?\w+)*$/, message: "E-mail: неверный формат почты!" }
                        ]}
                    >
                        <Input addonAfter={selectAfter} placeholder="Введите почту.."/>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                open={isEditStudentModal}
                centered
                onCancel={() => {
                    setIsEditStudentModal(false);
                    editUserForm.resetFields(["login", "mentorId"]);
                }}
                onClose={() => {
                    setIsEditStudentModal(false);
                    editUserForm.resetFields(["login", "mentorId"]);
                }}
                onOk={() => {
                    editUserForm.validateFields().then((editUser) => {
                        const userId = selectedStudent ? selectedStudent.id.toString() : '-';
                        httpClient.axios().put(config.endPoints.editUser.replace('{userId}', userId), {
                            login:  editUser.login ? editUser.login : selectedStudent?.login,
                            
                            mentorId: editUser.mentorId ? editUser.mentorId : selectedStudent?.mentor?.id,
                            isActive: selectedStudent?.isActive
                    }).then(() => {
                            notification.success({
                                message: 'Пользователь успешно изменен!'
                            })
                            setIsEditStudentModal(false);
                            editUserForm.resetFields(["login", "mentorId"]);
                            updateStudentsAndMentorsData();
                        }).catch(() => {
                            navigate('/error')
                        });
                    })
                        .catch(() => {});
                }}
                title="Редактирование пользователя"
                width={600}
                okText="Сохранить"
                okButtonProps={{shape: "round"}}
                cancelButtonProps={{shape: "round", type: "text"}}
            >
                <Form
                    form={editUserForm}
                    layout="vertical"
                >
                    <Form.Item
                        label="Логин:"
                        labelAlign="left"
                        name="login"
                        initialValue={selectedStudent?.login}
                        validateTrigger={['onChange', 'onBlur']}
                        rules={[
                            { required: true, message: 'Логин: обязательное поле!' },
                            { pattern: /^[а-яА-ЯёЁ]+$/, message: 'Логин: неверный формат поля!' }
                        ]}
                    >
                        <Input placeholder="Введите логин.." style={{borderRadius: "32px"}} />
                    </Form.Item>
                    
                   
                   
                    <Form.Item
                        label="Ментор:"
                        labelAlign="left"
                        name="mentorId"
                        initialValue={selectedStudent?.mentor?.id}
                        validateTrigger={['onChange', 'onBlur']}
                        rules={[
                            { required: true, message: 'Ментор: обязательное поле!' }
                        ]}
                    >
                        <Select options={mentorsData.filter((mentor) => mentor.isActive)
                            .map((mentor) => {return {value: mentor.id, label: mentor.login}})}
                        />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                open={isMassEditStudentModal}
                centered
                onCancel={() => {
                    setIsMassEditStudentModal(false);
                    massEditUserForm.resetFields(["groupName", "mentorId", "status"]);
                }}
                onClose={() => {
                    setIsMassEditStudentModal(false);
                    massEditUserForm.resetFields(["groupName", "mentorId", "status"]);
                }}
                onOk={() => {
                    massEditUserForm.validateFields().then((massEditUser) => {
                        let itemsProcessed = 0;
                        selectedStudents.forEach((user, index, array) => {
                            httpClient.axios().put(config.endPoints.editUser.replace('{userId}', user.id.toString()), {
                                login: user.login,
                                
                                mentorId: massEditUser.mentorId ? massEditUser.mentorId : user?.mentor?.id,
                                isActive: massEditUser.status !== undefined ? massEditUser.status === 1 : user?.isActive
                            }).then(() => {
                                itemsProcessed++;
                                if(itemsProcessed === array.length) {
                                    notification.success({
                                        message: 'Пользователи успешно изменены!'
                                    })
                                    setIsMassEditStudentModal(false);
                                    setSelectedStudents([]);
                                    massEditUserForm.resetFields(["groupName", "mentorId", "status"]);
                                    setTimeout(() => {
                                        window.location.reload();
                                    }, 1500);
                                }
                            }).catch(() => {
                                navigate('/error')
                            });
                        });
                    })
                        .catch(() => {});
                }}
                title="Массовое редактирование выбранных пользователей"
                width={600}
                okText="Сохранить"
                okButtonProps={{shape: "round"}}
                cancelButtonProps={{shape: "round", type: "text"}}
            >
                <Form
                    form={massEditUserForm}
                    layout="vertical"
                >
                   
                    <Form.Item
                        label="Ментор:"
                        labelAlign="left"
                        name="mentorId"
                        validateTrigger={['onChange', 'onBlur']}
                    >
                        <Select placeholder="Не выбрано" options={mentorsData.filter((mentor) => mentor.isActive)
                            .map((mentor) => {return {value: mentor.id, label: mentor.login}})}
                        />
                    </Form.Item>
                    <Form.Item
                        label="Статус:"
                        labelAlign="left"
                        name="status"
                        validateTrigger={['onChange', 'onBlur']}
                    >
                        <Select placeholder="Не выбрано" options={[{value: 0, label: 'Деактивирован'}, {value: 1, label: 'Активен'}]} />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                open={isDeleteStudentModal}
                centered
                onCancel={() => {
                    setIsDeleteStudentModal(false);
                }}
                onClose={() => {
                    setIsDeleteStudentModal(false);
                }}
                title="Деактивация / удаление пользователя"
                footer={[
                    <Button key="back" shape="round" type="text" onClick={() => {
                        setIsDeleteStudentModal(false);
                    }}>
                        Отмена
                    </Button>,
                    <Button key="submit" shape="round" type="primary" onClick={() => {
                        if (selectedStudent) {
                            httpClient.axios().delete(config.endPoints.deleteUser
                                .replace('{userId}', selectedStudent.id.toString())).then(() => {

                                setIsDeleteStudentModal(false);
                                notification.success({
                                    message: 'Пользователь успешно удален из системы!'
                                });
                                updateStudentsAndMentorsData();
                            });
                        }
                    }}>
                        Удалить
                    </Button>,
                    <Button key="submit" shape="round" type="primary" onClick={() => {
                       if (selectedStudent) {
                           httpClient.axios().post(config.endPoints.deactivateUser
                               .replace('{userId}', selectedStudent.id.toString())).then(() => {

                               setIsDeleteStudentModal(false);
                               notification.success({
                                   message: 'Пользователь успешно деактивирован!'
                               });
                               updateStudentsAndMentorsData();
                           });
                       }
                    }}>
                        Деактивировать
                    </Button>,
                ]}
                width={600}
                okButtonProps={{disabled: true}}
                cancelButtonProps={{shape: "round", type: "text"}}
            >
                <Text>Вы действительно хотите удалить данного пользователя?</Text>
            </Modal>
        </div>
    )
};
