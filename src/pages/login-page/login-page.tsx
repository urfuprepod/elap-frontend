import React, {useEffect, useState} from "react";

import "./login-page.scss";
import {useNavigate} from "react-router-dom";
import {httpClient} from "../../shared/api/http-client";
import {config} from "../../shared/config";
import {AxiosError} from "axios";
import {App, Button, Divider, Form, FormProps, Input, Modal, Select, Typography} from "antd";
import {UserInfo} from "../../shared/model/user-info";
import {MetrikaCounter} from "react-metrika";

type FieldType = {
  email?: string;
  password?: string;
};

export const LoginPage = (): JSX.Element => {
  const navigate = useNavigate();
    const { notification } = App.useApp();
    const { Option } = Select;
    const [loginError, setLoginError] = useState<boolean>(false);
    const [isOpenResetPasswordModal, setIsOpenResetPasswordModal] = useState<boolean>(false);
    const [isActiveUser, setIsActiveUser] = useState<boolean>(true);
    const [emailType, setEmailType] = useState<string>("@urfu.ru");
    const { Text, Paragraph } = Typography;

    const [resetPasswordForm] = Form.useForm<{ email: string }>();

//   useEffect(() => {
//     if (window.localStorage.getItem("elap:portal:auth")) {
//         loginTry();
//     }
//   }, []);

  const loginTry = (values: FieldType) => {
        httpClient
            .axios()
            .post<{user: UserInfo, accessToken: string}>(config.endPoints.login, values)
            .then((response) => {
                const userInfo = response.data.user;
                localStorage.setItem('token', response.data.accessToken);
                if (userInfo) {
                    if (userInfo.isActive) {
                        window.localStorage.setItem("elap:portal:user", JSON.stringify(userInfo));
                        window.localStorage.setItem("elap:portal:user:lastUpdateDate", new Date().getTime().toString());
                        window.dispatchEvent(new Event("storage"));
                        window.location.replace("/");
                    } else {
                        window.localStorage.removeItem("elap:portal:auth");
                        window.localStorage.removeItem("elap:portal:user");
                        window.localStorage.removeItem("elap:portal:user:lastUpdateDate");
                        window.dispatchEvent(new Event("storage"));
                        setLoginError(false);
                        setIsActiveUser(false);
                    }
                }
            })
            .catch((error: AxiosError) => {
                window.localStorage.removeItem("elap:portal:auth");
                window.localStorage.removeItem("elap:portal:user");
                window.localStorage.removeItem("elap:portal:user:lastUpdateDate");
                window.dispatchEvent(new Event("storage"));
                if (error.status === 401) {
                    setIsActiveUser(true);
                    setLoginError(true);
                } else {
                    navigate("/error");
                }
            });
  }

  const onFinish: FormProps<FieldType>['onFinish'] = (values) => {
      if (values.email?.length && values.password?.length) {
          window.localStorage.setItem("elap:portal:auth", btoa(`${values.email}${emailType}:${values.password}`));
          loginTry({...values, email: `${values.email}${emailType}`});
      } else {
          setLoginError(true);
      }
  };

    const selectAfter = (
        <Select defaultValue={emailType} onChange={(value) => {setEmailType(value)}} tabIndex={-1}>
            <Option value="@urfu.ru">@urfu.ru</Option>
            <Option value="@urfu.me">@urfu.me</Option>
        </Select>
    );

  return (
      <div className="login-page">
          <div style={{textAlign: "center"}}>
              <Paragraph style={{fontSize: "18pt"}}>Авторизация</Paragraph>
          </div>
          <div className="content">
              <Form
                  name="basic"
                  style={{width: "100%"}}
                  initialValues={{ remember: true }}
                  onFinish={onFinish}
                  autoComplete="off"
                  layout="vertical"
              >
                  <Form.Item<FieldType>
                      label="E-mail:"
                      labelAlign="left"
                      tooltip="Название Вашей учетной записи, которая привязана к Вашему личному кабинету на сайте УрФУ"
                      name="email"
                      rules={[
                          { required: true, message: 'E-mail: обязательное поле!' },
                          { pattern: /^\w+([\.-]?\w+)*$/, message: "E-mail: неверный формат почты!" }
                      ]}
                  >
                      <Input addonAfter={selectAfter} placeholder="Введите почту.." />
                  </Form.Item>

                  <Form.Item<FieldType>
                      label="Пароль:"
                      name="password"
                      rules={[{ required: true, message: 'Пароль: обязательное поле!' }]}
                  >
                      <Input.Password style={{borderRadius: "32px"}} placeholder="Введите пароль.." />
                  </Form.Item>
                  <Paragraph italic><Text style={{color: "red"}}>*</Text> - Поля обязательны к заполнению</Paragraph>
                  {loginError ? <Paragraph style={{color: "red"}}>Неверный логин или пароль!</Paragraph> : null}
                  {!isActiveUser ? <Paragraph style={{color: "red"}}>
                      Ваш аккаунт не подвержден, либо деактивирован! Дождитесь активации или свяжитесь с администратором.
                  </Paragraph> : null}
                  <Form.Item>
                      <Button type="primary" shape="round" htmlType="submit" style={{marginTop: "10px", width: "100%"}}>
                          Войти
                      </Button>
                  </Form.Item>
              </Form>
              <Divider plain>или</Divider>
              <Button type="primary" shape="round" style={{width: "100%"}} onClick={() => navigate("/register")}>
                  Зарегистрироваться
              </Button>
              <Button type="text" shape="round" style={{width: "100%"}} onClick={() => {
                  setIsOpenResetPasswordModal(true);
              }}>
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
                  resetPasswordForm.validateFields().then((fields) => {
                      httpClient.axios().post(config.endPoints.createResetPasswordRequest, {
                          email: `${fields.email}${emailType}`
                      }).then(() => {
                          notification.success({
                              message: 'Успех! Если пользователь с указанной вами почтой существует - вам придет сообщение на почту.'
                          });
                          setIsOpenResetPasswordModal(false);
                          resetPasswordForm.resetFields(["email"]);
                      }).catch(() => {
                          navigate('/error')
                      });
                  }).catch(() => {});
              }}
              title="Восстановить пароль"
              width={600}
              okText="Восстановить"
              okButtonProps={{shape: "round"}}
              cancelButtonProps={{shape: "round", type: "text"}}
          >
              <Form
                  form={resetPasswordForm}
                  layout="vertical"
              >
                  <Form.Item<FieldType>
                      label="E-mail:"
                      labelAlign="left"
                      tooltip="Название Вашей учетной записи, которая привязана к Вашему личному кабинету на сайте УрФУ"
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

          <MetrikaCounter
              id={99048214}
              options={{
                  trackHash: true
              }}
          />
      </div>
  );
};
