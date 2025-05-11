import React, {useEffect, useState} from "react";

import "./admin-constructor-page.scss";
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
import {IconEdit, IconPlus, IconTrash} from "@tabler/icons-react";
import {useNavigate} from "react-router-dom";
import {UserInfo} from "../../shared/model/user-info";
import {BlockInfo, BlockType} from "../../shared/model/block";
import {Section} from "../../shared/ui/section/section";

const { Paragraph, Text } = Typography;

type SectionInfo = {
    id: number;
    text: string;
    subsections: SubsectionInfo[];
}

type SubsectionInfo = {
    id: number;
    text: string;
}

export const AdminConstructorPage = (): JSX.Element => {
    const navigate = useNavigate();
    const { notification } = App.useApp();

    const [isOpenCreateSectionModal, setIsOpenCreateSectionModal] = useState<boolean>(false);
    const [isOpenCreateSubsectionModal, setIsOpenCreateSubsectionModal] = useState<boolean>(false);
    const [isOpenEditSectionModal, setIsOpenEditSectionModal] = useState<boolean>(false);
    const [isOpenEditSubsectionModal, setIsOpenEditSubsectionModal] = useState<boolean>(false);
    const [isOpenDeleteSectionModal, setIsOpenDeleteSectionModal] = useState<boolean>(false);
    const [isOpenDeleteSubsectionModal, setIsOpenDeleteSubsectionModal] = useState<boolean>(false);
    const [sections, setSections] = useState<SectionInfo[]>([]);
    const [selectedSection, setSelectedSection] = useState<SectionInfo | null>(null);
    const [selectedSubsection, setSelectedSubsection] = useState<SubsectionInfo | null>(null);
    const [createSectionForm] = Form.useForm<{ text: string; }>();
    const [createSubsectionForm] = Form.useForm<{ text: string; }>();
    const [editSectionForm] = Form.useForm<{ text: string; }>();
    const [editSubsectionForm] = Form.useForm<{ text: string; }>();

    useEffect(() => {
        updateSectionsFullData();
    }, []);

    const updateSectionsFullData = () => {
        httpClient.axios().get<SectionInfo[]>(config.endPoints.getAllSectionsTree).then((responseSections) => {
            setSections(responseSections.data);
        });
    }

    return (
        <div className="admin-constructor-page">
            <div style={{textAlign: "center"}}>
                <Paragraph style={{fontSize: "18pt"}}>Конструктор</Paragraph>
            </div>

            <Flex vertical gap={20}>
                <Button type="primary" onClick={() => {
                    setIsOpenCreateSectionModal(true);
                }} block>
                    + Добавить раздел
                </Button>
                {sections.map((sectionInfo) =>
                    <Card
                        hoverable
                        size="default"
                        title={sectionInfo.text}
                        style={{backgroundColor: '#f6f5f5', borderColor: '#f3f3f3'}}
                        key={sectionInfo.id}
                        extra={
                            <Flex justify="letf" align="center">
                                <Button type="text" icon={<IconEdit />} onClick={() => {
                                    setSelectedSection(sectionInfo);
                                    setIsOpenEditSectionModal(true);
                                }} />
                                <Button type="text" icon={<IconTrash />} onClick={() => {
                                    setSelectedSection(sectionInfo);
                                    setIsOpenDeleteSectionModal(true);
                                }} danger />
                            </Flex>
                        }>
                        <Flex vertical gap={10}>
                            <Text>Подразделы:</Text>
                            <Button type="primary" onClick={() => {
                                setSelectedSection(sectionInfo);
                                setIsOpenCreateSubsectionModal(true);
                            }} block>
                                + Добавить подраздел
                            </Button>
                            {sectionInfo.subsections?.map((subsectionInfo) =>
                                <Card
                                    size="small"
                                    title={subsectionInfo.text}
                                    key={subsectionInfo.id + 99}
                                    extra={
                                        <Flex justify="letf" align="center">
                                            <Button type="text" icon={<IconEdit />} onClick={() => {
                                                setSelectedSection(sectionInfo);
                                                setSelectedSubsection(subsectionInfo);
                                                setIsOpenEditSubsectionModal(true);
                                            }} />
                                            <Button type="text" icon={<IconTrash />} onClick={() => {
                                                setSelectedSection(sectionInfo);
                                                setSelectedSubsection(subsectionInfo);
                                                setIsOpenDeleteSubsectionModal(true);
                                            }} danger />
                                        </Flex>
                                    }
                                >
                                    <Button style={{width: '100%', height: '100%'}}
                                            type="text" onClick={() => {
                                        navigate(`${sectionInfo.id}/${subsectionInfo.id}`);
                                    }}>Управлять</Button>
                                </Card>)}
                        </Flex>
                    </Card>)}
            </Flex>

            <Modal
                open={isOpenCreateSectionModal}
                centered
                onCancel={() => {
                    setIsOpenCreateSectionModal(false);
                    createSectionForm.resetFields(["text"]);
                }}
                onOk={() => {
                    createSectionForm.validateFields().then((fields) => {
                        httpClient.axios().post(config.endPoints.createSection, {
                            text: fields?.text
                        }).then(() => {
                            notification.success({
                                message: 'Раздел успешно создан!'
                            })
                            setIsOpenCreateSectionModal(false);
                            createSectionForm.resetFields(["text"]);
                            updateSectionsFullData();
                        }).catch(() => {
                            navigate('/error')
                        });
                    }).catch(() => {})
                }}
                title="Создать раздел"
                width={600}
                okText="Создать"
                okButtonProps={{shape: "round"}}
                cancelButtonProps={{shape: "round", type: "text"}}
            >
                <Form
                    form={createSectionForm}
                    layout="vertical"
                >
                    <Form.Item name="text" label="Название:" required rules={[
                        { required: true, message: 'Название: обязательное поле!' },
                        { type: 'string', min: 5, message: 'Название: длина должна быть больше или равна 5 символам!' },
                        { pattern: /^[,.а-яА-ЯёЁ\s]+$/, message: 'Название: неверный формат поля!' }
                    ]}>
                        <Input placeholder="Введите название раздела.." style={{borderRadius: "32px"}} maxLength={100} />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                open={isOpenCreateSubsectionModal}
                centered
                onCancel={() => {
                    setIsOpenCreateSubsectionModal(false);
                    setSelectedSection(null);
                    createSubsectionForm.resetFields(["text"]);
                }}
                onOk={() => {
                    if (selectedSection) {
                        createSubsectionForm.validateFields().then((fields) => {
                            httpClient.axios().post(config.endPoints.createSubsection
                                .replace('{sectionId}', selectedSection?.id.toString()), {
                                text: fields?.text
                            }).then(() => {
                                notification.success({
                                    message: 'Подраздел успешно создан!'
                                })
                                setIsOpenCreateSubsectionModal(false);
                                createSubsectionForm.resetFields(["text"]);
                                setSelectedSection(null);
                                updateSectionsFullData();
                            }).catch(() => {
                                navigate('/error')
                            });
                        }).catch(() => {});
                    }
                }}
                title="Создать подраздел"
                width={600}
                okText="Создать"
                okButtonProps={{shape: "round"}}
                cancelButtonProps={{shape: "round", type: "text"}}
            >
                <Form
                    form={createSubsectionForm}
                    layout="vertical"
                >
                    <Form.Item name="text" label="Название:" required rules={[
                        { required: true, message: 'Название: обязательное поле!' },
                        { type: 'string', min: 5, message: 'Название: длина должна быть больше или равна 5 символам!' },
                        { pattern: /^[,.а-яА-ЯёЁ\s]+$/, message: 'Название: неверный формат поля!' }
                    ]}>
                        <Input placeholder="Введите название раздела.." style={{borderRadius: "32px"}} maxLength={100} />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                open={isOpenEditSectionModal}
                centered
                onCancel={() => {
                    setIsOpenEditSectionModal(false);
                    setSelectedSection(null);
                    editSectionForm.resetFields(["text"]);
                }}
                onOk={() => {
                    if (selectedSection) {
                        editSectionForm.validateFields().then((fields) => {
                            httpClient.axios().put(config.endPoints.editSection
                                .replace('{sectionId}', selectedSection?.id.toString()), {
                                text: fields?.text
                            }).then(() => {
                                notification.success({
                                    message: 'Раздел успешно изменен!'
                                })
                                setIsOpenEditSectionModal(false);
                                editSectionForm.resetFields(["text"]);
                                setSelectedSection(null);
                                setSelectedSubsection(null);
                                updateSectionsFullData();
                            }).catch(() => {
                                navigate('/error')
                            });
                        }).catch(() => {});
                    }
                }}
                title="Измненеие раздела"
                width={600}
                okText="Сохранить"
                okButtonProps={{shape: "round"}}
                cancelButtonProps={{shape: "round", type: "text"}}
            >
                <Form
                    form={editSectionForm}
                    layout="vertical"
                >
                    <Form.Item name="text" label="Название:" required initialValue={selectedSection?.text} rules={[
                        { required: true, message: 'Название: обязательное поле!' },
                        { type: 'string', min: 5, message: 'Название: длина должна быть больше или равна 5 символам!' },
                        { pattern: /^[,.а-яА-ЯёЁ\s]+$/, message: 'Название: неверный формат поля!' }
                    ]}>
                        <Input placeholder="Введите название раздела.." style={{borderRadius: "32px"}} maxLength={100} />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                open={isOpenDeleteSectionModal}
                centered
                onCancel={() => {
                    setIsOpenDeleteSectionModal(false);
                    setSelectedSection(null);
                }}
                onOk={() => {
                    if (selectedSection) {
                        httpClient.axios().delete(config.endPoints.deleteSection
                            .replace('{sectionId}', selectedSection?.id.toString())).then(() => {
                            notification.success({
                                message: 'Раздел успешно удален!'
                            })
                            setIsOpenDeleteSectionModal(false);
                            setSelectedSection(null);
                            setSelectedSubsection(null);
                            updateSectionsFullData();
                        }).catch(() => {
                            navigate('/error')
                        });
                    }
                }}
                title="Удаление раздела"
                width={600}
                okText="Удалить"
                okButtonProps={{shape: "round"}}
                cancelButtonProps={{shape: "round", type: "text"}}
            >
                <Paragraph>Вы действительно хотите удалить данный раздел?</Paragraph>
            </Modal>

            <Modal
                open={isOpenEditSubsectionModal}
                centered
                onCancel={() => {
                    setIsOpenEditSubsectionModal(false);
                    setSelectedSection(null);
                    setSelectedSubsection(null);
                    editSubsectionForm.resetFields(["text"]);
                }}
                onOk={() => {
                    if (selectedSection && selectedSubsection) {
                        editSubsectionForm.validateFields().then((fields) => {
                            httpClient.axios().put(config.endPoints.editSubsection
                                .replace('{sectionId}', selectedSection?.id.toString())
                                .replace('{subsectionId}', selectedSubsection.id.toString()), {
                                text: fields?.text
                            }).then(() => {
                                notification.success({
                                    message: 'Подраздел успешно изменен!'
                                })
                                setIsOpenEditSubsectionModal(false);
                                editSubsectionForm.resetFields(["text"]);
                                setSelectedSection(null);
                                setSelectedSubsection(null);
                                updateSectionsFullData();
                            }).catch(() => {
                                navigate('/error')
                            });
                        }).catch(() => {});
                    }
                }}
                title="Измненеие подраздела"
                width={600}
                okText="Сохранить"
                okButtonProps={{shape: "round"}}
                cancelButtonProps={{shape: "round", type: "text"}}
            >
                <Form
                    form={editSubsectionForm}
                    layout="vertical"
                >
                    <Form.Item name="text" label="Название:" required initialValue={selectedSubsection?.text} rules={[
                        { required: true, message: 'Название: обязательное поле!' },
                        { type: 'string', min: 5, message: 'Название: длина должна быть больше или равна 5 символам!' },
                        { pattern: /^[,.а-яА-ЯёЁ\s]+$/, message: 'Название: неверный формат поля!' }
                    ]}>
                        <Input placeholder="Введите название подраздела.." style={{borderRadius: "32px"}} maxLength={100} />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                open={isOpenDeleteSubsectionModal}
                centered
                onCancel={() => {
                    setIsOpenDeleteSectionModal(false);
                    setSelectedSection(null);
                }}
                onOk={() => {
                    if (selectedSection && selectedSubsection) {
                        httpClient.axios().delete(config.endPoints.deleteSubsection
                            .replace('{sectionId}', selectedSection?.id.toString())
                            .replace('{subsectionId}', selectedSubsection.id.toString())).then(() => {
                            notification.success({
                                message: 'Подраздел успешно удален!'
                            })
                            setIsOpenDeleteSubsectionModal(false);
                            setSelectedSection(null);
                            setSelectedSubsection(null);
                            updateSectionsFullData();
                        }).catch(() => {
                            navigate('/error')
                        });
                    }
                }}
                title="Удаление подраздела"
                width={600}
                okText="Удалить"
                okButtonProps={{shape: "round"}}
                cancelButtonProps={{shape: "round", type: "text"}}
            >
                <Paragraph>Вы действительно хотите удалить данный подраздел?</Paragraph>
            </Modal>

        </div>
    )
};
