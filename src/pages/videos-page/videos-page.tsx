import React, {useContext, useEffect, useState} from "react";

import "./videos-page.scss";
import {App, Button, Form, Input, InputNumber, List, Modal, Spin, Typography, UploadFile} from "antd";
import {AuthContext} from "../../shared/ui/auth-context/auth-context";
import {VideoInfo} from "../../shared/model/video-info";
import {VideoBlock} from "../../shared/ui/blocks/video-block/video-block";
import {httpClient} from "../../shared/api/http-client";
import {config} from "../../shared/config";
import {useNavigate} from "react-router-dom";
import {UserAuthorityType} from "../../shared/model/user-authority";
import {IconPlus} from "@tabler/icons-react";
import TextArea from "antd/lib/input/TextArea";

const {Paragraph} = Typography;

export const VideosPage = (): JSX.Element => {
    const authContext = useContext(AuthContext);
    const navigate = useNavigate();
    const { notification } = App.useApp();

    const [videosInfoData, setVideosInfoData] = useState<VideoInfo[]>([]);
    const [isOpenCreateVideoModal, setIsOpenCreateVideoModal] = useState<boolean>(false);

    const [createVideoForm] = Form.useForm<{ title: string; videoPreviewImgUrl: string,
        videoUrl: string, videoDuration: number }>();

    useEffect(() => {
        updateVideosData();
    }, []);

    const updateVideosData = () => {
        httpClient.axios().get<VideoInfo[]>(config.endPoints.getAllVideosInfoUrl).then((response) => {
            setVideosInfoData(response.data);
        }).catch(() => {
            navigate("/error");
        });
    }

    return (
        <div className="videos-page">
            <div style={{textAlign: "center"}}>
                <Paragraph style={{fontSize: "18pt"}}>Видеосюжеты</Paragraph>
            </div>
            {authContext?.userInfo.authorities?.filter((authorityInfo) =>
                authorityInfo.authority === UserAuthorityType.ADMIN).length ? (
                <>
                    <Button style={{minHeight: '45px', width: "100%", marginBottom: "10px"}} color="primary" variant="outlined"
                            icon={<IconPlus />} onClick={() => {setIsOpenCreateVideoModal(true);}}>
                        Добавить видеосюжет
                    </Button>

                    <Modal
                        open={isOpenCreateVideoModal}
                        centered
                        onCancel={() => {
                            setIsOpenCreateVideoModal(false);
                            createVideoForm.resetFields(["title", "videoPreviewImgUrl", "videoUrl", "videoDuration"]);
                        }}
                        onOk={() => {
                            createVideoForm.validateFields().then((fields) => {
                                httpClient.axios().post(config.endPoints.createVideo, {
                                    title: fields?.title, videoPreviewImgUrl: fields?.videoPreviewImgUrl,
                                    videoUrl: fields?.videoUrl, videoDuration: fields?.videoDuration
                                }).then(() => {
                                    notification.success({
                                        message: 'Видеосюжет успешно добавлен!'
                                    })
                                    setIsOpenCreateVideoModal(false);
                                    createVideoForm.resetFields(["title", "videoPreviewImgUrl", "videoUrl", "videoDuration"]);
                                    updateVideosData();
                                }).catch(() => {
                                    navigate('/error')
                                });
                            }).catch(() => {})
                        }}
                        title="Добавить видеосюжет"
                        width={600}
                        okText="Добавить"
                        okButtonProps={{shape: "round"}}
                        cancelButtonProps={{shape: "round", type: "text"}}
                    >
                        <Form
                            form={createVideoForm}
                            layout="vertical"
                        >
                            <Form.Item name="title" label="Заголовок:" required rules={[
                                { required: true, message: 'Заголовок: обязательное поле!' },
                                { type: 'string', min: 10, message: 'Заголовок: длина должна быть больше или равна 10 символам!' },
                            ]}>
                                <Input placeholder="Введите название видеосюжета.." style={{borderRadius: "32px"}} maxLength={100} />
                            </Form.Item>
                            <Form.Item name="videoPreviewImgUrl" label="Превью для видеосюжета:" required rules={[
                                { required: true, message: 'Превью для видеосюжета: обязательное поле!' },
                                { type: 'string', min: 10, message: 'Превью для видеосюжета: длина должна быть больше или равна 10 символам!' },
                                { type: 'url' },
                            ]}>
                                <Input placeholder="Введите ссылка для превью.." style={{borderRadius: "32px"}}/>
                            </Form.Item>
                            <Form.Item name="videoDuration" label="Длительность видеосюжета (в формате xx:xx:xx):" required rules={[
                                { required: true, message: 'Длительность видеосюжета: обязательное поле!' },
                                {
                                    pattern: /\b(?:[01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]\b/,
                                    message: 'Длительность видеосюжета: неверный форма! Введите значение в формате xx:xx:xx'
                                }
                            ]}>
                                <Input placeholder="Введите длительность (пример - 00:12:03)" style={{borderRadius: "32px"}} />
                            </Form.Item>
                            <Form.Item name="videoUrl" label="Ссылка на видеосюжет:" required rules={[
                                { required: true, message: 'Ссылка на видеосюжет: обязательное поле!' },
                                { type: 'string', min: 10, message: 'Ссылка на видеосюжет: длина должна быть больше или равна 10 символам!' },
                                { type: 'url' },
                                () => ({
                                    validator(_, value) {
                                        const isGoogleDrive = (value as string).includes('drive.google.com/file/d');
                                        if (!value || isGoogleDrive) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('Можно добавлять видео только с  Google Drive!'));
                                    },
                                })
                            ]}>
                                <Input placeholder="Введите ссылку на видеосюжет.." style={{borderRadius: "32px"}} />
                            </Form.Item>
                        </Form>
                    </Modal>
                </>
            ) : null}
            <List
                grid={{
                    gutter: [16, 16],
                    xs: 1,
                    sm: 1,
                    md: 2,
                    lg: 2,
                    xl: 3,
                    xxl: 4,
                }}
                dataSource={videosInfoData}
                renderItem={(videoInfo, index) => (
                    <List.Item>
                        <VideoBlock
                            title={videoInfo.title}
                            videoPreviewImgUrl={videoInfo.videoPreviewImgUrl}
                            videoUrl={videoInfo.videoUrl}
                            videoDuration={videoInfo.videoDuration}
                            id={videoInfo.id}
                        />
                    </List.Item>
                )}
            />
        </div>
    )
};
