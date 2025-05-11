import React, { useEffect, useRef, useState } from "react";

import "./admin-mentors-page.scss";
import {
  App,
  Button,
  Flex,
  Form,
  Input,
  InputRef,
  Modal,
  Popover,
  Select,
  Space,
  Table,
  TableColumnsType,
  TableColumnType,
  TableProps,
  Tag,
  Typography,
} from "antd";
import { httpClient } from "../../shared/api/http-client";
import { config } from "../../shared/config";
import { FilterDropdownProps } from "antd/es/table/interface";
import { SearchOutlined } from "@ant-design/icons";
// @ts-ignore
import Highlighter from "react-highlight-words";
import { IconEdit, IconPlus } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { UserInfo } from "../../shared/model/user-info";
import { Message } from "../messages-page/messages-page";

const { Paragraph, Text } = Typography;

export const AdminMentorsPage = (): JSX.Element => {
  const navigate = useNavigate();
  const { notification } = App.useApp();
  const { Option } = Select;

  const [mentorsData, setMentorsData] = useState<UserInfo[]>([]);
  const [selectedMentors, setSelectedMentors] = useState<UserInfo[]>([]);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [isRegisterMentorModal, setIsRegisterMentorModal] =
    useState<boolean>(false);
  const [isEditMentorModal, setIsEditMentorModal] = useState<boolean>(false);
  const [isDeleteMentorModal, setIsDeleteMentorModal] =
    useState<boolean>(false);
  const [isMassEditMentorModal, setIsMassEditMentorModal] =
    useState<boolean>(false);
  const [selectedMentor, setSelectedMentor] = useState<UserInfo | null>(null);
  const [emailType, setEmailType] = useState<string>("@urfu.ru");

  const searchInput = useRef<InputRef>(null);

  const [registerMentorForm] = Form.useForm<{
    login: string;
    email: string;
    mentorRole: string;
  }>();
  const [editMentorForm] = Form.useForm<{
    login: string;
    mentorId: number;
    mentorRole: string;
  }>();
  const [massEditMentorForm] = Form.useForm<{
    mentorRole: string;
    status: number;
  }>();

  useEffect(() => {
    updateMentorsData();
  }, []);

  const updateMentorsData = () => {
    httpClient
      .axios()
      .get<UserInfo[]>(config.endPoints.getAllMentors)
      .then((response) => {
        setMentorsData(response.data);
      });
  };

  const tableProps: TableProps<UserInfo> = {
    bordered: true,
    size: "middle",
    title: () => {
      return (
        <Flex gap={5}>
          <Button
            onClick={() => {
              setIsRegisterMentorModal(true);
            }}
            icon={<IconPlus />}
          >
            Добавить ментора
          </Button>
          <Popover
            title={
              selectedMentors.length <= 1
                ? "Выберите несколько элементов"
                : "Массовое редактирование"
            }
          >
            <Button
              onClick={() => {
                setIsMassEditMentorModal(true);
              }}
              icon={<IconEdit />}
              disabled={selectedMentors.length <= 1}
            >
              Изменить менторов
            </Button>
          </Popover>
        </Flex>
      );
    },
    showHeader: true,
  };

  type DataIndex = keyof UserInfo;

  const handleSearch = (
    selectedKeys: string[],
    confirm: FilterDropdownProps["confirm"],
    dataIndex: DataIndex
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText("");
  };

  const getColumnSearchProps = (
    dataIndex: DataIndex
  ): TableColumnType<UserInfo> => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Введите..`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() =>
            handleSearch(selectedKeys as string[], confirm, dataIndex)
          }
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() =>
              handleSearch(selectedKeys as string[], confirm, dataIndex)
            }
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
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
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
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  const tableColumns: TableColumnsType<UserInfo> = [
    {
      title: "Идентификатор",
      dataIndex: "id",
      width: "10%",
      align: "center",
      defaultSortOrder: "descend",
    },
    {
      title: "ФИО",
      dataIndex: "login",
      width: "30%",
      align: "center",
      ...getColumnSearchProps("login"),
    },
    {
      title: "E-mail",
      dataIndex: "email",
      width: "15%",
      align: "center",
      ...getColumnSearchProps("email"),
    },
    {
      title: "Роль",
      dataIndex: "mentorRole",
      width: "15%",
      align: "center",
      render: (_, record) => (
        <Text>{record.mentorRole ? record.mentorRole : "-"}</Text>
      ),
      filters: Array.from(
        new Set(
          mentorsData.map((mentor) => {
            return {
              text: mentor.mentorRole ? mentor.mentorRole : "-",
              value: mentor.mentorRole ? mentor.mentorRole : "-",
            };
          })
        )
      ),
      onFilter: (value, record) =>
        record.mentorRole
          ? record.mentorRole.startsWith(value as string)
          : "-".startsWith(value as string),
      filterSearch: true,
    },
    {
      title: "Статус",
      dataIndex: "isActive",
      width: "10%",
      render: (_, record) => (
        <Tag color={record.isActive ? "green" : "red"}>
          {record.isActive ? "Активен" : "Деактивирован / не активирован"}
        </Tag>
      ),
      align: "center",
      filters: [
        {
          text: "Активен",
          value: true,
        },
        {
          text: "Деактивирован / не активирован",
          value: false,
        },
      ],
      onFilter: (value, record) => record.isActive === (value as boolean),
    },
    {
      title: "Доступные действия",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Flex justify="center" align="center" gap={10} vertical>
          <Button
            type="link"
            onClick={() => {
              setSelectedMentor(record);
              setIsEditMentorModal(true);
            }}
          >
            Редактировать
          </Button>
          <Button
            type="link"
            danger
            onClick={() => {
              setSelectedMentor(record);
              setIsDeleteMentorModal(true);
            }}
          >
            Деактивировать / Удалить
          </Button>
          {!record.isActive ? (
            <Button
              type="link"
              onClick={() => {
                if (record) {
                  httpClient
                    .axios()
                    .post(
                      config.endPoints.activateUser.replace(
                        "{userId}",
                        record.id.toString()
                      )
                    )
                    .then(() => {
                      setIsDeleteMentorModal(false);
                      notification.success({
                        message: "Ментор успешно активирован!",
                      });
                      updateMentorsData();
                    });
                }
              }}
            >
              Активировать
            </Button>
          ) : null}
        </Flex>
      ),
    },
  ];

  const rowSelection: TableProps<UserInfo>["rowSelection"] = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: UserInfo[]) => {
      setSelectedMentors(selectedRows);
    },
  };

  const selectAfter = (
    <Select
      defaultValue={emailType}
      onChange={(value) => {
        setEmailType(value);
      }}
      tabIndex={-1}
    >
      <Option value="@urfu.ru">@urfu.ru</Option>
      <Option value="@urfu.me">@urfu.me</Option>
    </Select>
  );

  return (
    <div className="admin-mentors-page">
      <div style={{ textAlign: "center" }}>
        <Paragraph style={{ fontSize: "18pt" }}>Менторы</Paragraph>
      </div>
      <Table<UserInfo>
        {...tableProps}
        rowKey="id"
        pagination={{ position: ["bottomCenter"], pageSize: 6 }}
        columns={tableColumns}
        dataSource={mentorsData}
        rowSelection={{ type: "checkbox", ...rowSelection }}
      />
      <Modal
        open={isRegisterMentorModal}
        centered
        onCancel={() => {
          setIsRegisterMentorModal(false);
          registerMentorForm.resetFields(["login", "email", "mentorRole"]);
        }}
        onOk={() => {
          registerMentorForm
            .validateFields()
            .then((fields) => {
              httpClient
                .axios()
                .post(config.endPoints.registerMentor, {
                  login: fields.login,
                  email: `${fields.email}${emailType}`,
                  mentorRole: fields.mentorRole,
                })
                .then((response) => {
                  notification.success({
                    message: "Ментор успешно создан!",
                  });
                  setIsRegisterMentorModal(false);
                  registerMentorForm.resetFields([
                    "login",
                    "email",
                    "mentorRole",
                  ]);
                  updateMentorsData();
                })
                .catch(() => {
                  navigate("/error");
                });
            })
            .catch(() => {});
        }}
        title="Создать ментора"
        width={600}
        okText="Создать"
        okButtonProps={{ shape: "round" }}
        cancelButtonProps={{ shape: "round", type: "text" }}
      >
        <Form form={registerMentorForm} layout="vertical">
          <Form.Item
            label="Фамилия:"
            labelAlign="left"
            name="lastName"
            rules={[
              { required: true, message: "Фамилия: обязательное поле!" },
              {
                pattern: /^[а-яА-ЯёЁ]+$/,
                message: "Фамилия: неверный формат поля!",
              },
            ]}
          >
            <Input
              placeholder="Введите фамилию.."
              style={{ borderRadius: "32px" }}
              maxLength={40}
            />
          </Form.Item>
          <Form.Item
            label="Имя:"
            labelAlign="left"
            name="firstName"
            rules={[
              { required: true, message: "Имя: обязательное поле!" },
              {
                pattern: /^[а-яА-ЯёЁ]+$/,
                message: "Имя: неверный формат поля!",
              },
            ]}
          >
            <Input
              placeholder="Введите имя.."
              style={{ borderRadius: "32px" }}
              maxLength={40}
            />
          </Form.Item>
          <Form.Item
            label="Отчество:"
            labelAlign="left"
            name="patronymic"
            rules={[
              {
                pattern: /^[а-яА-ЯёЁ]+$/,
                message: "Отчество: неверный формат поля!",
              },
            ]}
          >
            <Input
              placeholder="Введите отчество (если оно есть).."
              style={{ borderRadius: "32px" }}
              maxLength={40}
            />
          </Form.Item>

          <Form.Item
            label="E-mail:"
            labelAlign="left"
            tooltip="Название учетной записи, которая привязана к личному кабинету на сайте УрФУ"
            name="email"
            rules={[
              { required: true, message: "Введите почту!" },
              {
                pattern: /^\w+([\.-]?\w+)*$/,
                message: "E-mail: неверный формат почты!",
              },
            ]}
          >
            <Input
              addonAfter={selectAfter}
              placeholder="Введите почту.."
              maxLength={30}
            />
          </Form.Item>

          <Form.Item
            label="Роль:"
            labelAlign="left"
            name="mentorRole"
            rules={[
              {
                pattern: /^[,.а-яА-ЯёЁ\s]+$/,
                message: "Роль: неверный формат поля!",
              },
            ]}
          >
            <Input
              placeholder="Введите роль ментора.."
              style={{ borderRadius: "32px" }}
              maxLength={40}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={isEditMentorModal}
        centered
        onCancel={() => {
          setIsEditMentorModal(false);
          editMentorForm.resetFields(["login", "mentorRole"]);
        }}
        onClose={() => {
          setIsEditMentorModal(false);
          editMentorForm.resetFields(["login", "mentorRole"]);
        }}
        onOk={() => {
          editMentorForm
            .validateFields()
            .then((fields) => {
              const userId = selectedMentor
                ? selectedMentor.id.toString()
                : "-";
              httpClient
                .axios()
                .put(config.endPoints.editUser.replace("{userId}", userId), {
                  login: selectedMentor?.login,
                  mentorId: null,
                  mentorRole: fields.mentorRole,
                })
                .then(() => {
                  notification.success({
                    message: "Ментор успешно изменен!",
                  });
                  setIsEditMentorModal(false);
                  editMentorForm.resetFields(["login", "mentorRole"]);
                  updateMentorsData();
                })
                .catch(() => {
                  navigate("/error");
                });
            })
            .catch(() => {});
        }}
        title="Редактирование ментора"
        width={600}
        okText="Сохранить"
        okButtonProps={{ shape: "round" }}
        cancelButtonProps={{ shape: "round", type: "text" }}
      >
        <Form form={editMentorForm} layout="vertical">
          <Form.Item
            label="Логин:"
            labelAlign="left"
            name="login"
            initialValue={selectedMentor?.login}
            validateTrigger={["onChange", "onBlur"]}
            rules={[{ required: true, message: "Логин: обязательное поле!" }]}
          >
            <Input
              placeholder="Введите логин.."
              style={{ borderRadius: "32px" }}
              maxLength={40}
            />
          </Form.Item>

          <Form.Item
            label="Роль:"
            labelAlign="left"
            name="mentorRole"
            initialValue={selectedMentor?.mentorRole}
            rules={[
              {
                pattern: /^[,.а-яА-ЯёЁ\s]+$/,
                message: "Роль: неверный формат поля!",
              },
            ]}
          >
            <Input
              placeholder="Введите роль ментора.."
              style={{ borderRadius: "32px" }}
              maxLength={40}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={isMassEditMentorModal}
        centered
        onCancel={() => {
          setIsMassEditMentorModal(false);
          massEditMentorForm.resetFields(["mentorRole", "status"]);
        }}
        onClose={() => {
          setIsMassEditMentorModal(false);
          massEditMentorForm.resetFields(["mentorRole", "status"]);
        }}
        onOk={() => {
          massEditMentorForm
            .validateFields()
            .then((massEditUser) => {
              let itemsProcessed = 0;
              selectedMentors.forEach((user, index, array) => {
                httpClient
                  .axios()
                  .put(
                    config.endPoints.editUser.replace(
                      "{userId}",
                      user.id.toString()
                    ),
                    {
                      login: user.login,
                      mentorId: null,
                      mentorRole: massEditUser.mentorRole
                        ? massEditUser.mentorRole
                        : user?.mentorRole,
                      isActive:
                        massEditUser.status !== undefined
                          ? massEditUser.status === 1
                          : user?.isActive,
                    }
                  )
                  .then(() => {
                    itemsProcessed++;
                    if (itemsProcessed === array.length) {
                      notification.success({
                        message: "Менторы успешно изменены!",
                      });
                      setIsMassEditMentorModal(false);
                      setSelectedMentors([]);
                      massEditMentorForm.resetFields(["mentorRole", "status"]);
                      setTimeout(() => {
                        window.location.reload();
                      }, 1500);
                    }
                  })
                  .catch(() => {
                    navigate("/error");
                  });
              });
            })
            .catch(() => {});
        }}
        title="Массовое редактирование выбранных менторов"
        width={600}
        okText="Сохранить"
        okButtonProps={{ shape: "round" }}
        cancelButtonProps={{ shape: "round", type: "text" }}
      >
        <Form form={massEditMentorForm} layout="vertical">
          <Form.Item
            label="Роль:"
            labelAlign="left"
            name="mentorRole"
            rules={[
              {
                pattern: /^[,.а-яА-ЯёЁ\s]+$/,
                message: "Роль: неверный формат поля!",
              },
            ]}
          >
            <Input placeholder="Не указано" style={{ borderRadius: "32px" }} />
          </Form.Item>
          <Form.Item
            label="Статус:"
            labelAlign="left"
            name="status"
            validateTrigger={["onChange", "onBlur"]}
          >
            <Select
              placeholder="Не выбрано"
              options={[
                { value: 0, label: "Деактивирован" },
                { value: 1, label: "Активен" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={isDeleteMentorModal}
        centered
        onCancel={() => {
          setIsDeleteMentorModal(false);
        }}
        onClose={() => {
          setIsDeleteMentorModal(false);
        }}
        title="Деактивация / удаление ментора"
        footer={[
          <Button
            key="back"
            shape="round"
            type="text"
            onClick={() => {
              setIsDeleteMentorModal(false);
            }}
          >
            Отмена
          </Button>,
          <Button
            key="submit"
            shape="round"
            type="primary"
            onClick={() => {
              if (selectedMentor) {
                httpClient
                  .axios()
                  .delete(
                    config.endPoints.deleteUser.replace(
                      "{userId}",
                      selectedMentor.id.toString()
                    )
                  )
                  .then(() => {
                    setIsDeleteMentorModal(false);
                    notification.success({
                      message: "Пользователь успешно удален из системы!",
                    });
                    updateMentorsData();
                  });
              }
            }}
          >
            Удалить
          </Button>,
          <Button
            key="submit"
            shape="round"
            type="primary"
            onClick={() => {
              if (selectedMentor) {
                httpClient
                  .axios()
                  .post(
                    config.endPoints.deactivateUser.replace(
                      "{userId}",
                      selectedMentor.id.toString()
                    )
                  )
                  .then(() => {
                    setIsDeleteMentorModal(false);
                    notification.success({
                      message: "Ментор успешно деактивирован!",
                    });
                    updateMentorsData();
                  });
              }
            }}
          >
            Деактивировать
          </Button>,
        ]}
        width={600}
        okButtonProps={{ disabled: true }}
        cancelButtonProps={{ shape: "round", type: "text" }}
      >
        <Text>Вы действительно хотите удалить данного ментора?</Text>
      </Modal>
    </div>
  );
};
