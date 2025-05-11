import React, {useContext, useEffect, useState} from "react";

import "./advertisements-page.scss";
import {App, Button, Card, Col, Flex, Form, Input, Modal, Row, Spin, Typography, Upload, UploadFile} from "antd";
import {AuthContext} from "../../shared/ui/auth-context/auth-context";
import {Advertisement} from "../../shared/model/advertisement";
import {Section} from "../../shared/ui/section/section";
import {httpClient} from "../../shared/api/http-client";
import {config} from "../../shared/config";
import {useNavigate} from "react-router-dom";
import {UserAuthorityType} from "../../shared/model/user-authority";
import {IconEdit, IconPlus, IconTrash} from "@tabler/icons-react";
import TextArea from "antd/lib/input/TextArea";
import moment from "moment/moment";
import {FileList} from "../../shared/ui/file-list/file-list";
import {PlusOutlined} from "@ant-design/icons";
import {saveAs} from "file-saver";
import {CustomUpload} from "../../shared/ui/custom-upload/custom-upload";
import {appendFilesToFormData, getUploadFiles} from "../../shared/util/file-util";

const {Paragraph, Text} = Typography;

export const AdvertisementsPage = (): JSX.Element => {
    const authContext = useContext(AuthContext);
    const navigate = useNavigate();
    const { notification } = App.useApp();
    const [advertisementsData, setAdvertisementsData] = useState<Advertisement[]>([]);
    const [selectedAdvertisement, setSelectedAdvertisement] = useState<Advertisement | null>(null);
    const [isOpenCreateAdvertisementModal, setIsOpenCreateAdvertisementModal] = useState<boolean>(false);
    const [isOpenEditAdvertisementModal, setIsOpenEditAdvertisementModal] = useState<boolean>(false);
    const [isOpenDeleteAdvertisementModal, setIsOpenDeleteAdvertisementModal] = useState<boolean>(false);
    const [selectedAdvertisementFileList, setSelectedAdvertisementFileList] = useState<UploadFile[]>([]);

    const [createAdvertisementForm] = Form.useForm<{ title: string; text: string; filesList: UploadFile[] }>();
    const [editAdvertisementForm] = Form.useForm<{ title: string; text: string; filesList: UploadFile[] }>();


    useEffect(() => {
        updateAdvertisementsData();
    }, []);

    const updateAdvertisementsData = () => {
        httpClient.axios().get<Advertisement[]>(config.endPoints.getAllAdvertisementsUrl).then((response) => {
            setAdvertisementsData(response.data);
        }).catch(() => {
            navigate("/error");
        });
    }

    const getAdvertisements = () => {
        const result: JSX.Element[] = [];

        if (advertisementsData.length) {
            advertisementsData.forEach((item) => {
                result.push(
                    <Col xs={24} sm={24} md={24} lg={24} xl={8} xxl={8}>
                        <Card style={{backgroundColor: "#d8b2ed", height: "100%"}} bordered={false}>
                            <Paragraph style={{fontSize: "12pt", fontWeight: "bold"}}>
                                {item.title}
                            </Paragraph>
                            <Paragraph>
                                {item.text}
                            </Paragraph>
                            { item?.files?.length ? <FileList files={item.files} /> : null }
                            <Flex justify="space-between" align="center" style={{marginTop: "10px"}}>
                                <Text italic>{moment(item.date).format('LLL')}</Text>
                                {authContext?.userInfo.authorities?.filter((authorityInfo) =>
                                    authorityInfo.authority === UserAuthorityType.ADMIN).length ? (
                                    <Flex>
                                        <Button type="text" icon={<IconEdit />} onClick={() => {
                                            setSelectedAdvertisement(item);
                                            
                                            setSelectedAdvertisementFileList(getUploadFiles(item.files));
                                            setIsOpenEditAdvertisementModal(true);
                                        }} />
                                        <Button type="text" icon={<IconTrash />} onClick={() => {
                                            setSelectedAdvertisement(item);
                                            setIsOpenDeleteAdvertisementModal(true);
                                        }} />
                                    </Flex>
                                ) : null}
                            </Flex>
                        </Card>
                    </Col>
                )
            });
        } else {
            result.push(
                <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                    <Card style={{backgroundColor: "#d8b2ed", height: "100%", display: "flex",
                        justifyContent: "center", alignItems: "center"}} bordered={false}>
                        <Paragraph style={{fontSize: "12pt", fontWeight: "bold", marginBottom: "0"}}>
                            Пока нет никаких объявлений
                        </Paragraph>
                    </Card>
                </Col>
            )
        }

        return result;
    };

    const normFile = (e: any) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e?.fileList;
    };

    return (
        <div className="advertisements-page">
            <Section title="Объявления" className="content">
                {authContext?.userInfo.authorities?.filter((authorityInfo) =>
                    authorityInfo.authority === UserAuthorityType.ADMIN).length ? (
                    <>
                        <Button style={{minHeight: '45px', width: "100%"}} color="primary" variant="outlined"
                                icon={<IconPlus />} onClick={() => {setIsOpenCreateAdvertisementModal(true);}}>
                            Добавить объявление
                        </Button>

                        <Modal
                            open={isOpenCreateAdvertisementModal}
                            centered
                            onCancel={() => {
                                setIsOpenCreateAdvertisementModal(false);
                                createAdvertisementForm.resetFields(["title", "text", "filesList"]);
                            }}
                            onOk={() => {
                                createAdvertisementForm.validateFields().then((fields) => {
                                    const advertisementFiles = fields.filesList?.length ? fields.filesList
                                        .map((uploadFile) => uploadFile.originFileObj as File) : [];
                                    const formData = new FormData();
                                    formData.append("title", fields.title);
                                    formData.append("text", fields.text);
                                    advertisementFiles.forEach((file) => {
                                        formData.append("files", file);
                                    });

                                    httpClient.axios().post(config.endPoints.createAdvertisement, formData).then(() => {
                                        notification.success({
                                            message: 'Объявление успешно создано!'
                                        })
                                        setIsOpenCreateAdvertisementModal(false);
                                        createAdvertisementForm.resetFields(["title", "text", "filesList"]);
                                        updateAdvertisementsData();
                                    }).catch(() => {
                                        navigate('/error')
                                    });
                                }).catch(() => {});
                            }}
                            title="Создать объявление"
                            width={600}
                            okText="Создать"
                            okButtonProps={{shape: "round"}}
                            cancelButtonProps={{shape: "round", type: "text"}}
                        >
                            <Form
                                form={createAdvertisementForm}
                                layout="vertical"
                            >
                                <Form.Item name="title" label="Заголовок:" required rules={[
                                    { required: true, message: 'Заголовок: обязательное поле!' },
                                    { type: 'string', min: 10, message: 'Заголовок: длина должна быть больше или равна 10 символам!' },
                                    { pattern: /^[?!,.а-яА-ЯёЁ0-9\s]+$/, message: 'Заголовок: неверный формат поля!' }
                                ]}>
                                    <Input placeholder="Введите заголовок объявления.." style={{borderRadius: "32px"}}
                                        maxLength={40} />
                                </Form.Item>
                                <Form.Item name="text" label="Текст:" required rules={[
                                    { required: true, message: 'Текст: обязательное поле!' },
                                    { type: 'string', min: 10, message: 'Текст: длина должна быть больше или равна 10 символам!' },
                                ]}>
                                    <TextArea placeholder="Введите текст объявления.." rows={7} style={{borderRadius: "14px"}}
                                        maxLength={500} count={{max: 500, show: true}} />
                                </Form.Item>
                                <Form.Item name="filesList" label="Файлы:" getValueFromEvent={normFile} rules={[
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
                            open={isOpenEditAdvertisementModal}
                            centered
                            onCancel={() => {
                                setIsOpenEditAdvertisementModal(false);
                                setSelectedAdvertisement(null);
                                setSelectedAdvertisementFileList([]);
                                editAdvertisementForm.resetFields(["title", "text", "filesList"]);
                            }}
                            onOk={() => {
                                editAdvertisementForm.validateFields().then((fields) => {
                                    const formData = new FormData();
                                    formData.append("title", fields.title);
                                    formData.append("text", fields.text);
                                    appendFilesToFormData("files", formData, selectedAdvertisementFileList);
                                    httpClient.axios().put(config.endPoints.editAdvertisement
                                        .replace('{advertisementId}', selectedAdvertisement?.id.toString() as string), formData).then(() => {
                                        notification.success({
                                            message: 'Объявление успешно измненено!'
                                        })
                                        setIsOpenEditAdvertisementModal(false);
                                        editAdvertisementForm.resetFields(["title", "text", "filesList"]);
                                        updateAdvertisementsData();
                                    }).catch(() => {
                                        navigate('/error')
                                    });
                                }).catch(() => {});
                            }}
                            title="Изменить объявление"
                            width={600}
                            okText="Сохранить"
                            okButtonProps={{shape: "round"}}
                            cancelButtonProps={{shape: "round", type: "text"}}
                        >
                            <Form
                                form={editAdvertisementForm}
                                layout="vertical"
                            >
                                <Form.Item name="title" label="Заголовок:" required initialValue={selectedAdvertisement?.title}
                                           rules={[
                                               { required: true, message: 'Заголовок: обязательное поле!' },
                                               { type: 'string', min: 10, message: 'Заголовок: длина должна быть больше или равна 10 символам!' },
                                               { pattern: /^[?!,.а-яА-ЯёЁ0-9\s]+$/, message: 'Заголовок: неверный формат поля!' }
                                           ]}>
                                    <Input placeholder="Введите заголовок объявления.." style={{borderRadius: "32px"}} maxLength={40} />
                                </Form.Item>
                                <Form.Item name="text" label="Текст:" required initialValue={selectedAdvertisement?.text} rules={[
                                    { required: true, message: 'Текст: обязательное поле!' },
                                    { type: 'string', min: 10, message: 'Текст: длина должна быть больше или равна 10 символам!' },
                                ]}>
                                    <TextArea placeholder="Введите текст объявления.." rows={7} style={{borderRadius: "14px"}} maxLength={500}
                                              count={{max: 500, show: true}} />
                                </Form.Item>
                                <Form.Item name="filesList" label="Файлы:" getValueFromEvent={normFile}
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
                                    <CustomUpload defaultFileList={selectedAdvertisementFileList}
                                                  onValueChange={(fileList) => {setSelectedAdvertisementFileList(fileList)}} />
                                </Form.Item>
                            </Form>
                        </Modal>

                        <Modal
                            open={isOpenDeleteAdvertisementModal}
                            centered
                            onCancel={() => {
                                setIsOpenDeleteAdvertisementModal(false);
                            }}
                            onOk={() => {
                                httpClient.axios().delete(config.endPoints.deleteAdvertisement
                                    .replace('{advertisementId}', selectedAdvertisement?.id.toString() as string)).then(() => {
                                    notification.success({
                                        message: 'Объявление успешно удалено!'
                                    })
                                    setIsOpenDeleteAdvertisementModal(false);
                                    updateAdvertisementsData();
                                }).catch(() => {
                                    navigate('/error')
                                });
                            }}
                            title="Удаление объявления"
                            width={600}
                            okText="Удалить"
                            okButtonProps={{shape: "round"}}
                            cancelButtonProps={{shape: "round", type: "text"}}
                        >
                            Вы действитель хотите удалить данное объявление?
                        </Modal>
                    </>
                ) : null}
                <Row gutter={[16, 16]}>
                    {getAdvertisements()}
                </Row>
            </Section>
        </div>
    )
};
