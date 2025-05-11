import React, {useEffect, useState} from "react";

import "./reset-password-page.scss";
import {useNavigate, useParams} from "react-router-dom";
import {App, Button, Checkbox, Divider, Form, FormProps, Input, Typography} from "antd";
import {saveAs} from "file-saver";
import {httpClient} from "../../shared/api/http-client";
import {config} from "../../shared/config";

type FieldType = {
    password?: string;
    confirmPassword?: string;
};

export const ResetPasswordPage = (): JSX.Element => {
    const navigate = useNavigate();
    const { notification } = App.useApp();
    const { resetPassRequestId } = useParams();
    const { Paragraph } = Typography;

    useEffect(() => {
        if (resetPassRequestId) {
            httpClient.axios().get<boolean>(config.endPoints.validateResetPasswordRequest
                .replace('{resetPassRequestId}', resetPassRequestId)).then((response) => {
                    if (!response.data) {
                        navigate('/login');
                    }
            }).catch(() => {
                navigate('/error');
            })
        } else {
            navigate('/login');
        }
    }, []);

    const onFinish: FormProps<FieldType>['onFinish'] = (values) => {
        if (resetPassRequestId) {
            httpClient.axios().post(config.endPoints.changePasswordAfterReset
                .replace('{resetPassRequestId}', resetPassRequestId), {
                newPassword: values.password
            }).then((response) => {
                notification.success({
                    message: 'Ваш пароль успешно изменен! Сейчас вы будете перенаправлены на страницу авторизации.'
                });
                setTimeout(() => {
                    navigate('/login');
                }, 4000);
            }).catch(() => {
                navigate('/error');
            });
        }
    };

    return (
        <div className="reset-password-page">
            <div className="content">
                <div style={{textAlign: "center"}}>
                    <Paragraph style={{fontSize: "18pt"}}>Сброс пароля</Paragraph>
                </div>
                <Form
                    name="basic"
                    style={{maxWidth: "inline"}}
                    initialValues={{remember: true}}
                    onFinish={onFinish}
                    autoComplete="off"
                    layout="vertical"
                >
                    <Form.Item<FieldType>
                        label="Ваш новый пароль:"
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
                        label="Повторите пароль:"
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

                    <Form.Item>
                        <Button type="primary" shape="round" htmlType="submit" style={{marginTop: "10px", width: "300px"}}>
                            Сохранить
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
};
