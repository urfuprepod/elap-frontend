import React, {useEffect, useState} from "react";

import "./admin-faq-page.scss";
import {
    App,
    Button, Card,
    Flex, Form,
    Input,
    Modal,
    Typography
} from "antd";
import {httpClient} from "../../shared/api/http-client";
import {config} from "../../shared/config";
// @ts-ignore
import Highlighter from "react-highlight-words";
import {IconEdit, IconTrash} from "@tabler/icons-react";
import {useNavigate} from "react-router-dom";
import TextArea from "antd/lib/input/TextArea";
import {FaqItem} from "../../shared/model/faq-item";

const { Paragraph, Text } = Typography;

export const AdminFaqPage = (): JSX.Element => {
    const navigate = useNavigate();
    const { notification } = App.useApp();

    const [isOpenCreateFaqItemModal, setIsOpenCreateFaqItemModal] = useState<boolean>(false);
    const [isOpenEditFaqItemModal, setIsOpenEditFaqItemModal] = useState<boolean>(false);
    const [isOpenDeleteFaqItemModal, setIsOpenDeleteFaqItemModal] = useState<boolean>(false);
    const [faqItems, setFaqItems] = useState<FaqItem[]>([]);
    const [selectedFaqItem, setSelectedFaqItem] = useState<FaqItem | null>(null);
    const [createFaqItemForm] = Form.useForm<FaqItem>();
    const [editFaqItemForm] = Form.useForm<FaqItem>();

    useEffect(() => {
        updateFaqItemsData();
    }, []);

    const updateFaqItemsData = () => {
        httpClient.axios().get<FaqItem[]>(config.endPoints.getAllFaqItems).then((response) => {
            setFaqItems(response.data);
        });
    }

    return (
        <div className="admin-faq-page">
            <div style={{textAlign: "center"}}>
                <Paragraph style={{fontSize: "18pt"}}>Редактор FAQ</Paragraph>
            </div>

            <Flex vertical gap={20}>
                <Button type="primary" onClick={() => {
                    setIsOpenCreateFaqItemModal(true);
                }} block>
                    + Добавить элемент
                </Button>
                {faqItems.map((faqItem) =>
                    <Card
                        hoverable
                        size="default"
                        title={faqItem.question}
                        style={{backgroundColor: '#f6f5f5', borderColor: '#f3f3f3'}}
                        key={faqItem.id}
                        extra={
                            <Flex justify="letf" align="center">
                                <Button type="text" icon={<IconEdit />} onClick={() => {
                                    setSelectedFaqItem(faqItem);
                                    setIsOpenEditFaqItemModal(true);
                                }} />
                                <Button type="text" icon={<IconTrash />} onClick={() => {
                                    setSelectedFaqItem(faqItem);
                                    setIsOpenDeleteFaqItemModal(true);
                                }} danger />
                            </Flex>
                        }>
                        <Paragraph>{faqItem.answer}</Paragraph>
                    </Card>)}
            </Flex>

            <Modal
                open={isOpenCreateFaqItemModal}
                centered
                onCancel={() => {
                    setIsOpenCreateFaqItemModal(false);
                    createFaqItemForm.resetFields(["question", "answer"]);
                }}
                onOk={() => {
                    createFaqItemForm.validateFields().then((fields) => {
                        httpClient.axios().post(config.endPoints.createFaqItem, {
                            question: fields?.question, answer: fields?.answer
                        }).then(() => {
                            notification.success({
                                message: 'Элемент успешно добавлен!'
                            })
                            setIsOpenCreateFaqItemModal(false);
                            createFaqItemForm.resetFields(["question", "answer"]);
                            updateFaqItemsData();
                        }).catch(() => {
                            navigate('/error')
                        });
                    }).catch(() => {})
                }}
                title="Добавить элемент"
                width={600}
                okText="Создать"
                okButtonProps={{shape: "round"}}
                cancelButtonProps={{shape: "round", type: "text"}}
            >
                <Form
                    form={createFaqItemForm}
                    layout="vertical"
                >
                    <Form.Item name="question" label="Вопрос:" required rules={[
                        { required: true, message: 'Вопрос: обязательное поле!' },
                        { type: 'string', min: 5, message: 'Вопрос: длина должна быть больше или равна 5 символам!' },
                        { pattern: /^[?!,.а-яА-ЯёЁ0-9\s]+$/, message: 'Вопрос: неверный формат поля!' }
                    ]}>
                        <Input placeholder="Введите вопрос.." style={{borderRadius: "32px"}} maxLength={1000} />
                    </Form.Item>
                    <Form.Item name="answer" label="Ответ:" required rules={[
                        { required: true, message: 'Ответ: обязательное поле!' },
                        { type: 'string', min: 10, message: 'Ответ: длина должна быть больше или равна 10 символам!' },
                    ]}>
                        <TextArea placeholder="Введите ответ.." rows={7} style={{borderRadius: "14px"}}
                                  maxLength={500} count={{max: 1000, show: true}} />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                open={isOpenEditFaqItemModal}
                centered
                onCancel={() => {
                    setIsOpenEditFaqItemModal(false);
                    setSelectedFaqItem(null);
                    editFaqItemForm.resetFields(["question", "answer"]);
                }}
                onOk={() => {
                    if (selectedFaqItem) {
                        editFaqItemForm.validateFields().then((fields) => {
                            httpClient.axios().put(config.endPoints.editFaqItem
                                .replace('{faqItemId}', selectedFaqItem?.id.toString()), {
                                question: fields?.question, answer: fields?.answer
                            }).then(() => {
                                notification.success({
                                    message: 'Элемент успешно изменен!'
                                })
                                setIsOpenEditFaqItemModal(false);
                                editFaqItemForm.resetFields(["question", "answer"]);
                                setSelectedFaqItem(null);
                                updateFaqItemsData();
                            }).catch(() => {
                                navigate('/error')
                            });
                        }).catch(() => {});
                    }
                }}
                title="Измненеие элемента"
                width={600}
                okText="Сохранить"
                okButtonProps={{shape: "round"}}
                cancelButtonProps={{shape: "round", type: "text"}}
            >
                <Form
                    form={editFaqItemForm}
                    layout="vertical"
                >
                    <Form.Item name="question" label="Вопрос:" required initialValue={selectedFaqItem?.question} rules={[
                        { required: true, message: 'Вопрос: обязательное поле!' },
                        { type: 'string', min: 5, message: 'Вопрос: длина должна быть больше или равна 5 символам!' },
                        { pattern: /^[?!,.а-яА-ЯёЁ0-9\s]+$/, message: 'Вопрос: неверный формат поля!' }
                    ]}>
                        <Input placeholder="Введите вопрос.." style={{borderRadius: "32px"}} maxLength={100} />
                    </Form.Item>
                    <Form.Item name="answer" label="Ответ:" required initialValue={selectedFaqItem?.answer} rules={[
                        { required: true, message: 'Ответ: обязательное поле!' },
                        { type: 'string', min: 10, message: 'Ответ: длина должна быть больше или равна 10 символам!' },
                    ]}>
                        <TextArea placeholder="Введите ответ.." rows={7} style={{borderRadius: "14px"}}
                                  maxLength={500} count={{max: 500, show: true}} />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                open={isOpenDeleteFaqItemModal}
                centered
                onCancel={() => {
                    setIsOpenDeleteFaqItemModal(false);
                    setSelectedFaqItem(null);
                }}
                onOk={() => {
                    if (selectedFaqItem) {
                        httpClient.axios().delete(config.endPoints.deleteFaqItem
                            .replace('{faqItemId}', selectedFaqItem?.id.toString())).then(() => {
                            notification.success({
                                message: 'Элемент успешно удален!'
                            })
                            setIsOpenDeleteFaqItemModal(false);
                            setSelectedFaqItem(null);
                            updateFaqItemsData();
                        }).catch(() => {
                            navigate('/error')
                        });
                    }
                }}
                title="Удаление элемента"
                width={600}
                okText="Удалить"
                okButtonProps={{shape: "round"}}
                cancelButtonProps={{shape: "round", type: "text"}}
            >
                <Paragraph>Вы действительно хотите удалить данный элемент?</Paragraph>
            </Modal>

        </div>
    )
};
