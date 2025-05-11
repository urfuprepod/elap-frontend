import React, {useContext, useState} from "react";

import "./account-page.scss";
import {AuthContext} from "../../shared/ui/auth-context/auth-context";
import {App, Button, Flex, Form, Input, Modal, Spin, Typography} from "antd";
import {IconChecklist, IconMessageCircleQuestion} from "@tabler/icons-react";
import {useNavigate} from "react-router-dom";
import {UserAuthorityType} from "../../shared/model/user-authority";
import {httpClient} from "../../shared/api/http-client";
import {config} from "../../shared/config";

const { Paragraph } = Typography;

type FieldType = {
    password?: string;
    confirmPassword?: string;
};

export const AccountPage = (): JSX.Element => {
    const navigate = useNavigate();
    const { notification } = App.useApp();
    const authContext = useContext(AuthContext);
   
    const [isOpenChangePasswordModal, setIsOpenChangePasswordModal] = useState<boolean>(false);

    const [changePasswordForm] = Form.useForm<{ password: string, confirmPassword: string }>();

    const getAccountByRole = (): JSX.Element => {
        if (authContext) {
            if (authContext.userInfo.authorities?.filter((authorityInfo) =>
                authorityInfo.authority === UserAuthorityType.ADMIN).length) {
                return (
                    <>
                        <div style={{textAlign: "center"}}>
                            <Paragraph style={{fontSize: "18pt"}}>Личный кабинет</Paragraph>
                        </div>
                        <Flex style={{height: '100%'}} justify="center" align="center" vertical>
                            <Form
                                name="basic"
                                style={{ maxWidth: "inline" }}
                                initialValues={{ remember: true }}
                                autoComplete="off"
                                layout="vertical"
                            >
                                <Form.Item
                                    label="Логин:"
                                    labelAlign="left"
                                >
                                    <Input value={authContext.userInfo.login} disabled style={{borderRadius: "32px", minWidth: "300px",
                                        width: "100%", maxWidth: "650px"}} />
                                </Form.Item>

                                <Form.Item
                                    label="Роль:"
                                    labelAlign="left"
                                >
                                    <Input value="Администратор" disabled style={{borderRadius: "32px"}} />
                                </Form.Item>

                                <Form.Item
                                    label="E-mail:"
                                    labelAlign="left"
                                >
                                    <Input value={authContext.userInfo.email} disabled style={{borderRadius: "32px"}} />
                                </Form.Item>
                            </Form>
                            <div className="actions-block">
                                <Button type="primary" shape="round" size="large" style={{width: "100%"}}
                                        onClick={() => setIsOpenChangePasswordModal(true)}>
                                    Сменить пароль
                                </Button>
                            </div>
                        </Flex>
                    </>
                );
            } else if (authContext.userInfo.authorities?.filter((authorityInfo) =>
                authorityInfo.authority === UserAuthorityType.MENTOR).length) {
                return (
                    <>
                        <div style={{textAlign: "center"}}>
                            <Paragraph style={{fontSize: "18pt"}}>Личный кабинет</Paragraph>
                        </div>
                        <Flex style={{height: '100%'}} justify="center" align="center" vertical>
                            <Form
                                name="basic"
                                initialValues={{ remember: true }}
                                autoComplete="off"
                                layout="vertical"
                            >
                                <Form.Item
                                    label="Логин:"
                                    labelAlign="left"
                                >
                                    <Input value={authContext.userInfo.login} disabled style={{borderRadius: "32px", minWidth: "300px",
                                        width: "100%", maxWidth: "650px"}} />
                                </Form.Item>

                                <Form.Item
                                    label="Роль:"
                                    labelAlign="left"
                                >
                                    <Input value="Ментор" disabled style={{borderRadius: "32px"}} />
                                </Form.Item>

                                <Form.Item
                                    label="E-mail:"
                                    labelAlign="left"
                                >
                                    <Input value={authContext.userInfo.email} disabled style={{borderRadius: "32px"}} />
                                </Form.Item>
                            </Form>
                            <div className="actions-block">
                                <Button type="primary" shape="round" size="large" style={{width: "100%"}}
                                        onClick={() => setIsOpenChangePasswordModal(true)}>
                                    Сменить пароль
                                </Button>
                            </div>
                        </Flex>
                    </>
                );
            } else {
                return (
                    <>
                        <div style={{textAlign: "center"}}>
                            <Paragraph style={{fontSize: "18pt"}}>Личный кабинет</Paragraph>
                        </div>
                        <Flex style={{height: '100%'}} justify="center" align="center" vertical>
                            <Form
                                name="basic"
                                style={{ width: "100%" }}
                                initialValues={{ remember: true }}
                                autoComplete="off"
                                layout="vertical"
                            >
                                <Form.Item
                                    label="Логин:"
                                    labelAlign="left"
                                >
                                    <Input value={authContext.userInfo.login} disabled style={{borderRadius: "32px", minWidth: "300px",
                                        width: "100%", maxWidth: "650px"}} />
                                </Form.Item>

                               

                                <Form.Item
                                    label="Ваш ментор:"
                                    labelAlign="left"
                                >
                                    <Input value={authContext.userInfo.mentor?.login} disabled style={{borderRadius: "32px"}} />
                                </Form.Item>
                            </Form>
                            <div className="actions-block">
                                <Button type="primary" shape="round" icon={<IconMessageCircleQuestion />} size="large"
                                        onClick={() => navigate("/messages")} style={{width: "100%"}}>
                                    Задать вопрос ментору
                                </Button>
                                <Button type="primary" shape="round" icon={<IconChecklist />} size="large"
                                        onClick={() => navigate("/tasks")} style={{width: "100%"}}>
                                    Посмотреть текущие задания
                                </Button>
                            </div>
                            <Button type="primary" shape="round" size="large" style={{marginTop: "10px", width: "50%"}}
                                    onClick={() => setIsOpenChangePasswordModal(true)}>
                                Сменить пароль
                            </Button>
                        </Flex>
                    </>
                )
            }
        }
        return (<></>);
    };

    return (
        <div className="account-page">
            {authContext ? <>
                    {getAccountByRole()}

                    <Modal
                        open={isOpenChangePasswordModal}
                        centered
                        onCancel={() => {
                            setIsOpenChangePasswordModal(false);
                            changePasswordForm.resetFields(["password", "confirmPassword"]);
                        }}
                        onOk={() => {
                            changePasswordForm.validateFields().then((fields) => {
                                httpClient.axios().post(config.endPoints.changePassword, {
                                    email: authContext?.userInfo.email,
                                    newPassword: fields.password
                                }).then(() => {
                                    notification.success({
                                        message: 'Ваш пароль успешно изменен!'
                                    });
                                    setIsOpenChangePasswordModal(false);
                                    changePasswordForm.resetFields(["password", "confirmPassword"]);
                                }).catch(() => {
                                    navigate('/error')
                                });
                            }).catch(() => {});
                        }}
                        title="Сменить пароль"
                        okText="Сменить"
                        okButtonProps={{shape: "round"}}
                        cancelButtonProps={{shape: "round", type: "text"}}
                    >
                        <Form
                            form={changePasswordForm}
                            layout="vertical"
                        >
                            <Form.Item<FieldType>
                                label="Новый пароль:"
                                tooltip="Пароль должен содержать минимум 8 символов"
                                name="password"
                                rules={[
                                    { required: true, message: 'Пароль: обязательное поле!' },
                                    { type: 'string', min: 8, message: 'Пароль: длина должна быть больше или равна 8 символам!' },
                                ]}
                            >
                                <Input.Password style={{borderRadius: "32px"}} placeholder="Введите пароль.."/>
                            </Form.Item>

                            <Form.Item<FieldType>
                                label="Повторите новый пароль:"
                                name="confirmPassword"
                                rules={[
                                    {required: true, message: 'Введите пароль повторно!'},
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue('password') === value) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('Пароли не совпадают!'));
                                        },
                                    })]}
                            >
                                <Input.Password style={{borderRadius: "32px"}} placeholder="Введите пароль повторно.."/>
                            </Form.Item>
                        </Form>
                    </Modal>
            </>:
                <Spin tip="Загрузка" size="large" spinning={!authContext} />}
        </div>
    )
};
