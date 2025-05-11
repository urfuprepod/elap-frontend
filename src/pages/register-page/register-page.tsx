import React, { useEffect, useState } from "react";

import "./register-page.scss";
import { useNavigate } from "react-router-dom";
import {
  App,
  Button,
  Checkbox,
  Divider,
  Form,
  FormProps,
  Input,
  Modal,
  Select,
  Typography,
} from "antd";
import { httpClient } from "../../shared/api/http-client";
import { config } from "../../shared/config";
import { MetrikaCounters } from "react-metrika";

type FieldType = {
  email?: string;
  password?: string;
  confirmPassword?: string;
  login?: string;
};

export const RegisterPage = (): JSX.Element => {
  const navigate = useNavigate();
  const { notification } = App.useApp();
  const { Option } = Select;
  const { Text, Paragraph } = Typography;

  const [isOpenResetPasswordModal, setIsOpenResetPasswordModal] =
    useState<boolean>(false);
  const [isUserExists, setIsUserExists] = useState<boolean>(false);
  const [emailType, setEmailType] = useState<string>("@urfu.me");
  const [pdFile, setPdFile] = useState<File | null>(null);

  const [resetPasswordForm] = Form.useForm<{ email: string }>();

  useEffect(() => {}, []);

  const onFinish: FormProps<FieldType>["onFinish"] = (values) => {
    httpClient
      .axios()
      .post(config.endPoints.registerUser, {
        login: values.login,
        email: `${values.email}${emailType}`,
        password: values.password,
        confirmPassword: values.confirmPassword,
      })
      .then((response) => {
        navigate("/success-register");
      })
      .catch((error) => {
        if (error.status === 400) {
          setIsUserExists(true);
        } else {
          navigate("/error");
        }
      });
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
    <div className="register-page">
      <div style={{ textAlign: "center" }}>
        <Paragraph style={{ fontSize: "18pt" }}>Регистрация</Paragraph>
      </div>
      <div className="content">
        <Form
          name="basic"
          style={{ maxWidth: "inline" }}
          initialValues={{ remember: true }}
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item<FieldType>
            label="Логин:"
            labelAlign="left"
            name="login"
            rules={[{ required: true, message: "Логин: обязательное поле!" }]}
          >
            <Input
              placeholder="Введите фамилию.."
              style={{ borderRadius: "32px" }}
            />
          </Form.Item>

          <Form.Item<FieldType>
            label="E-mail:"
            labelAlign="left"
            tooltip="Название Вашей учетной записи, которая привязана к Вашему личному кабинету на сайте УрФУ"
            name="email"
            rules={[
              { required: true, message: "E-mail: обязательное поле!" },
              {
                pattern: /^\w+([\.-]?\w+)*$/,
                message: "E-mail: неверный формат почты!",
              },
            ]}
          >
            <Input addonAfter={selectAfter} placeholder="Введите почту.." />
          </Form.Item>

          <Form.Item<FieldType>
            label="Пароль:"
            tooltip="Пароль должен содержать минимум 8 символов"
            name="password"
            rules={[
              { required: true, message: "Пароль: обязательное поле!" },
              {
                type: "string",
                min: 8,
                message:
                  "Пароль: длина должна быть больше или равна 8 символам!",
              },
            ]}
          >
            <Input.Password
              style={{ borderRadius: "32px" }}
              placeholder="Введите пароль.."
            />
          </Form.Item>

          <Form.Item<FieldType>
            label="Повторите пароль:"
            name="confirmPassword"
            rules={[
              { required: true, message: "Введите пароль повторно!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Пароли не совпадают!"));
                },
              }),
            ]}
          >
            <Input.Password
              style={{ borderRadius: "32px" }}
              placeholder="Введите пароль повторно.."
            />
          </Form.Item>

          <Text italic>
            <Text style={{ color: "red" }}>*</Text> - Поля обязательны к
            заполнению
          </Text>
          {isUserExists ? (
            <Paragraph style={{ color: "red" }}>
              <br />
              Пользователь с указанным E-mail адресом уже зарегистрирован!
            </Paragraph>
          ) : null}
          <Form.Item>
            <Button
              type="primary"
              shape="round"
              htmlType="submit"
              style={{ marginTop: "10px", width: "300px" }}
            >
              Зарегистрироваться
            </Button>
          </Form.Item>
        </Form>
        <Divider plain>или</Divider>
        <Button
          type="primary"
          shape="round"
          style={{ width: "300px" }}
          onClick={() => navigate("/login")}
        >
          Войти
        </Button>
        <Button
          type="text"
          shape="round"
          style={{ width: "100%" }}
          onClick={() => {
            setIsOpenResetPasswordModal(true);
          }}
        >
          Забыли пароль?
        </Button>
      </div>

      <Modal
        open={isOpenResetPasswordModal}
        centered
        onCancel={() => {
          setIsOpenResetPasswordModal(false);
          resetPasswordForm.resetFields(["email"]);
        }}
        onOk={() => {
          resetPasswordForm
            .validateFields()
            .then((fields) => {
              httpClient
                .axios()
                .post(config.endPoints.createResetPasswordRequest, {
                  email: `${fields.email}${emailType}`,
                })
                .then(() => {
                  notification.success({
                    message:
                      "Успех! Если пользователь с указанной вами почтой существует - вам придет сообщение на почту.",
                  });
                  setIsOpenResetPasswordModal(false);
                  resetPasswordForm.resetFields(["email"]);
                })
                .catch(() => {
                  navigate("/error");
                });
            })
            .catch(() => {});
        }}
        title="Восстановить пароль"
        width={600}
        okText="Восстановить"
        okButtonProps={{ shape: "round" }}
        cancelButtonProps={{ shape: "round", type: "text" }}
      >
        <Form form={resetPasswordForm} layout="vertical">
          <Form.Item<FieldType>
            label="E-mail:"
            labelAlign="left"
            tooltip="Название Вашей учетной записи, которая привязана к Вашему личному кабинету на сайте УрФУ"
            name="email"
            rules={[
              { required: true, message: "E-mail: обязательное поле!" },
              {
                pattern: /^\w+([\.-]?\w+)*$/,
                message: "E-mail: неверный формат почты!",
              },
            ]}
          >
            <Input addonAfter={selectAfter} placeholder="Введите почту.." />
          </Form.Item>
        </Form>
      </Modal>

      <MetrikaCounters
        ids={[99048208, 99048260]}
        options={{
          trackHash: true,
          webvisor: true,
        }}
      />
    </div>
  );
};
