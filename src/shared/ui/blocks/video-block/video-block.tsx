import React, {useContext, useRef, useState} from 'react';
import './video-block.scss';
import {App, Button, Card, Flex, Form, Input, Modal} from "antd";
import {VideoInfo} from "../../../model/video-info";
import {UserAuthorityType} from "../../../model/user-authority";
import {IconEdit, IconTrash} from "@tabler/icons-react";
import {AuthContext} from "../../auth-context/auth-context";
import {httpClient} from "../../../api/http-client";
import {config} from "../../../config";
import {useLocation, useNavigate} from "react-router-dom";

type VideoBlockProps = {
    title: string;
    videoPreviewImgUrl: string;
    videoUrl: string;
    videoDuration: string;
    id: number;
};

export const VideoBlock = (props: VideoBlockProps): JSX.Element => {
    const authContext = useContext(AuthContext);
    const { notification } = App.useApp();
    const navigate = useNavigate();
    let location = useLocation();
    const [isOpenVideoViewingModal, setIsOpenVideoViewingModal] = useState<boolean>(false);
    const [isOpenEditVideoModal, setIsOpenEditVideoModal] = useState<boolean>(false);
    const [isOpenDeleteVideoModal, setIsOpenDeleteVideoModal] = useState<boolean>(false);
    const [currentVideoInfo, setCurrentVideoInfo] = useState<VideoInfo | null>(null);

    const [editVideoForm] = Form.useForm<{ title: string; videoPreviewImgUrl: string,
        videoUrl: string, videoDuration: number }>();

    return (
        <div className="video-block" key={props.id}>
           
            <Card
                hoverable
                className="video-block-container"
                style={{backgroundImage: `url(${props.videoPreviewImgUrl})`}}
                bordered={false}
                onClick={() => {
                    setIsOpenVideoViewingModal(true);
                    setCurrentVideoInfo(props);
                }}
            >
                <div className="video-time-info">
                    <span>{props.videoDuration}</span>
                </div>
            </Card>
            <Flex justify="space-between" align="center">
                <span className="video-block-title">{props.title}</span>
                {authContext?.userInfo.authorities?.filter((authorityInfo) =>
                    authorityInfo.authority === UserAuthorityType.ADMIN).length &&  location.pathname === '/admin/videos' ? (
                    <Flex justify="letf" align="center">
                        <Button type="text" icon={<IconEdit />} onClick={() => {
                            setIsOpenEditVideoModal(true);
                        }} />
                        <Button type="text" icon={<IconTrash />} onClick={() => {
                            setIsOpenDeleteVideoModal(true);
                        }} />
                    </Flex>
                ) : null}
            </Flex>

            <Modal
                centered
                open={isOpenVideoViewingModal}
                onCancel={() => {
                    setIsOpenVideoViewingModal(false);
                    setCurrentVideoInfo(null);
                }}
                title={currentVideoInfo?.title}
                width={1050}
                footer={[]}
                className="video-viewing-modal"
            >
                <iframe
                    style={{border: "none", borderRadius: "8px"}}
                    src={currentVideoInfo?.videoUrl}
                    allowFullScreen height="600px"
                    width="1000px"
                />
            </Modal>

            <Modal
                open={isOpenEditVideoModal}
                centered
                onCancel={() => {
                    setIsOpenEditVideoModal(false);
                    editVideoForm.resetFields(["title", "videoPreviewImgUrl", "videoUrl", "videoDuration"]);
                }}
                onOk={() => {
                    const editVideo = editVideoForm.getFieldsValue();
                    httpClient.axios().put(config.endPoints.editVideo
                        .replace('{videoId}', props.id.toString() as string), {
                        title: editVideo?.title, videoPreviewImgUrl: editVideo?.videoPreviewImgUrl,
                        videoUrl: editVideo?.videoUrl, videoDuration: editVideo?.videoDuration
                    }).then(() => {
                        notification.success({
                            message: 'Видеосюжет успешно измненен!'
                        })
                        setIsOpenEditVideoModal(false);
                        editVideoForm.resetFields(["title", "videoPreviewImgUrl", "videoUrl", "videoDuration"]);
                        setTimeout(() => {
                            window.location.reload();
                        }, 1500);
                    }).catch(() => {
                        navigate('/error')
                    });
                }}
                title="Изменить видеосюжет"
                width={600}
                okText="Сохранить"
                okButtonProps={{shape: "round"}}
                cancelButtonProps={{shape: "round", type: "text"}}
            >
                <Form
                    form={editVideoForm}
                    layout="vertical"
                >
                    <Form.Item name="title" label="Заголовок:" required initialValue={props.title} rules={[
                        { required: true, message: 'Заголовок: обязательное поле!' },
                        { type: 'string', min: 10, message: 'Заголовок: длина должна быть больше или равна 10 символам!' },
                    ]}>
                        <Input placeholder="Введите название видеосюжета.." style={{borderRadius: "32px"}}/>
                    </Form.Item>
                    <Form.Item name="videoPreviewImgUrl" label="Превью для видеосюжета:" required
                               initialValue={props.videoPreviewImgUrl} rules={[
                        { required: true, message: 'Превью для видеосюжета: обязательное поле!' },
                        { type: 'string', min: 10, message: 'Превью для видеосюжета: длина должна быть больше или равна 10 символам!' },
                        { type: 'url' },
                    ]}>
                        <Input placeholder="Введите ссылка для превью.." style={{borderRadius: "32px"}}/>
                    </Form.Item>
                    <Form.Item name="videoDuration" label="Длительность видеосюжета (в формате xx:xx:xx):" required
                    initialValue={props.videoDuration} rules={[
                        { required: true, message: 'Длительность видеосюжета: обязательное поле!' },
                        {
                            pattern: /\b(?:[01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]\b/,
                            message: 'Длительность видеосюжета: неверный форма! Введите значение в формате xx:xx:xx'
                        }
                    ]}>
                        <Input placeholder="Введите длительность (пример - 00:12:03)" style={{borderRadius: "32px"}} />
                    </Form.Item>
                    <Form.Item name="videoUrl" label="Ссылка на видеосюжет:" required initialValue={props.videoUrl} rules={[
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

            <Modal
                open={isOpenDeleteVideoModal}
                centered
                onCancel={() => {
                    setIsOpenDeleteVideoModal(false);
                }}
                onOk={() => {
                    httpClient.axios().delete(config.endPoints.deleteVideo
                        .replace('{videoId}', props.id.toString() as string)).then(() => {
                        notification.success({
                            message: 'Видеосюжет успешно удален!'
                        })
                        setIsOpenDeleteVideoModal(false);
                        setTimeout(() => {
                            window.location.reload();
                        }, 1500);
                    }).catch(() => {
                        navigate('/error')
                    });
                }}
                title="Удаление видеосюжета"
                width={600}
                okText="Удалить"
                okButtonProps={{shape: "round"}}
                cancelButtonProps={{shape: "round", type: "text"}}
            >
                Вы действитель хотите удалить данный видеосюжет?
            </Modal>
        </div>
    );
}
