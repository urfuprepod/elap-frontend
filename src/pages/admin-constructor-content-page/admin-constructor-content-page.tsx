import React, { useContext, useEffect, useRef, useState } from "react";

import "./admin-constructor-content-page.scss";
import {
  App,
  Button,
  Card,
  Col,
  Empty,
  Flex,
  Form,
  Input,
  Modal,
  Row,
  Spin,
  Typography,
} from "antd";
import { httpClient } from "../../shared/api/http-client";
import { config } from "../../shared/config";
// @ts-ignore
import Highlighter from "react-highlight-words";
import { IconEdit, IconPlus, IconTrash } from "@tabler/icons-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AudioBlockData,
  BlockInfo,
  BlockType,
  ImageBlockData,
  LinkBlockData,
  TextBlockData,
  VideoBlockData,
} from "../../shared/model/block";
import { LearnSubsectionCard } from "../../shared/model/learn-subsection-card";
import { TextBlock } from "../../shared/ui/blocks/text-block/text-block";
import { AudioBlock } from "../../shared/ui/blocks/audio-block/audio-block";
import { LinkBlock } from "../../shared/ui/blocks/link-block/link-block";
import { ImageBlock } from "../../shared/ui/blocks/image-block/image-block";
import { VideoBlock } from "../../shared/ui/blocks/video-block/video-block";
import { AuthContext } from "../../shared/ui/auth-context/auth-context";
import { Editor } from "@tinymce/tinymce-react";

const { Paragraph } = Typography;

export const AdminConstructorContentPage = (): JSX.Element => {
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();
  const { notification } = App.useApp();

  const [isOpenAddVideoModal, setIsOpenAddVideoModal] =
    useState<boolean>(false);
  const [isOpenEditVideoModal, setIsOpenEditVideoModal] =
    useState<boolean>(false);
  const [isOpenAddImageModal, setIsOpenAddImageModal] =
    useState<boolean>(false);
  const [isOpenEditImageModal, setIsOpenEditImageModal] =
    useState<boolean>(false);
  const [isOpenAddAudioModal, setIsOpenAddAudioModal] =
    useState<boolean>(false);
  const [isOpenEditAudioModal, setIsOpenEditAudioModal] =
    useState<boolean>(false);
  const [isOpenAddTextModal, setIsOpenAddTextModal] = useState<boolean>(false);
  const [isOpenEditTextModal, setIsOpenEditTextModal] =
    useState<boolean>(false);
  const [
    isOpenDeleteSubsectionBlockModal,
    setIsOpenDeleteSubsectionBlockModal,
  ] = useState<boolean>(false);
  const { sectionId, subsectionId } = useParams();
  const [currentSubsection, setCurrentSubsection] =
    useState<LearnSubsectionCard | null>(null);
  const [blocksData, setBlocksData] = useState<BlockInfo[]>([]);
  const [selectedSubsectionBlock, setSelectedSubsectionBlock] =
    useState<BlockInfo | null>(null);
  const editorRef = useRef<any>();

  const [addVideoForm] = Form.useForm<{
    title: string;
    videoPreviewImgUrl: string;
    videoUrl: string;
    videoDuration: number;
  }>();
  const [editVideoForm] = Form.useForm<{
    title: string;
    videoPreviewImgUrl: string;
    videoUrl: string;
    videoDuration: number;
  }>();
  const [addImageForm] = Form.useForm<{ url: string }>();
  const [editImageForm] = Form.useForm<{ url: string }>();
  const [addAudioForm] = Form.useForm<{ url: string }>();
  const [editAudioForm] = Form.useForm<{ url: string }>();

  useEffect(() => {
    updateBlocksData();
  }, [sectionId, subsectionId]);

  const updateBlocksData = () => {
    if (sectionId && subsectionId) {
      if (Number.isInteger(parseInt(subsectionId))) {
        httpClient
          .axios()
          .get<LearnSubsectionCard[]>(
            config.endPoints.getLearnSubsectionCardsUrl.replace(
              "{sectionId}",
              sectionId
            )
          )
          .then((response) => {
            const filteredSubsection = response.data.filter(
              (item) => item.id === parseInt(subsectionId)
            );
            setCurrentSubsection(
              filteredSubsection.length ? filteredSubsection[0] : null
            );
          });
        httpClient
          .axios()
          .get<BlockInfo[]>(
            config.endPoints.getLearnSubsectionContentUrl
              .replace("{sectionId}", sectionId)
              .replace("{subsectionId}", subsectionId)
          )
          .then((response) => {
            setBlocksData(response.data);
          });
      } else {
        navigate("/not-found");
      }
    }
  };

  const getBlockRender = (blockInfo: BlockInfo): JSX.Element => {
    switch (blockInfo.type) {
      case BlockType.Text: {
        const data: TextBlockData = JSON.parse(
          blockInfo.data as unknown as string
        ) as TextBlockData;

        return <TextBlock data={data.data} />;
      }
      case BlockType.Audio: {
        const data: AudioBlockData = JSON.parse(
          blockInfo.data as unknown as string
        ) as AudioBlockData;
        return <AudioBlock srcUrl={data.url} />;
      }
      case BlockType.Link: {
        const data: LinkBlockData = blockInfo.data as LinkBlockData;
        return <LinkBlock url={data.url} text={data.text} />;
      }
      case BlockType.Image: {
        const data: ImageBlockData = JSON.parse(
          blockInfo.data as unknown as string
        ) as ImageBlockData;
        return <ImageBlock srcUrl={data.url} />;
      }
      case BlockType.Video: {
        const data: VideoBlockData = JSON.parse(
          blockInfo.data as unknown as string
        ) as VideoBlockData;
        return (
          <VideoBlock
            title={data.title}
            videoPreviewImgUrl={data.videoPreviewImgUrl}
            videoUrl={data.videoUrl}
            videoDuration={data.videoDuration}
            id={0}
          />
        );
      }
    }
  };

  const getBlocks = () => {
    const result: JSX.Element[] = [];

    if (blocksData.length > 0) {
      blocksData.forEach((blockData) => {
        result.push(
          <Card
            extra={
              <Flex justify="left" align="center">
                <Button
                  type="text"
                  icon={<IconEdit />}
                  onClick={() => {
                    setSelectedSubsectionBlock(blockData);
                    if (blockData.type === BlockType.Video) {
                      setIsOpenEditVideoModal(true);
                    } else if (blockData.type === BlockType.Image) {
                      setIsOpenEditImageModal(true);
                    } else if (blockData.type === BlockType.Audio) {
                      setIsOpenEditAudioModal(true);
                    } else {
                      setIsOpenEditTextModal(true);
                    }
                  }}
                />
                <Button
                  type="text"
                  icon={<IconTrash />}
                  onClick={() => {
                    setSelectedSubsectionBlock(blockData);
                    setIsOpenDeleteSubsectionBlockModal(true);
                  }}
                  danger
                />
              </Flex>
            }
          >
            {getBlockRender(blockData)}
          </Card>
        );
      });
    } else {
      result.push(
        <Flex style={{ height: "100%" }} justify="center" align="center">
          <Empty description="Здесь пока ничего нет" />
        </Flex>
      );
    }

    return result;
  };

  return (
    <div className="admin-constructor-content-page">
      {authContext ? (
        <>
          <div style={{ textAlign: "center" }}>
            <Paragraph style={{ fontSize: "18pt" }}>
              Конструктор подраздела '{currentSubsection?.text}'
            </Paragraph>
          </div>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={24} md={24} lg={24} xl={6} xxl={6}>
              <Button
                style={{ minHeight: "45px", width: "100%" }}
                color="primary"
                variant="outlined"
                icon={<IconPlus />}
                onClick={() => {
                  setIsOpenAddTextModal(true);
                }}
              >
                Добавить текст
              </Button>
            </Col>
            <Col xs={24} sm={24} md={24} lg={24} xl={6} xxl={6}>
              <Button
                style={{ minHeight: "45px", width: "100%" }}
                color="primary"
                variant="outlined"
                icon={<IconPlus />}
                onClick={() => {
                  setIsOpenAddAudioModal(true);
                }}
              >
                Добавить аудио
              </Button>
            </Col>
            <Col xs={24} sm={24} md={24} lg={24} xl={6} xxl={6}>
              <Button
                style={{ minHeight: "45px", width: "100%" }}
                color="primary"
                variant="outlined"
                icon={<IconPlus />}
                onClick={() => {
                  setIsOpenAddVideoModal(true);
                }}
              >
                Добавить видео
              </Button>
            </Col>
            <Col xs={24} sm={24} md={24} lg={24} xl={6} xxl={6}>
              <Button
                style={{ minHeight: "45px", width: "100%" }}
                color="primary"
                variant="outlined"
                icon={<IconPlus />}
                onClick={() => {
                  setIsOpenAddImageModal(true);
                }}
              >
                Добавить изображение
              </Button>
            </Col>
          </Row>
          {getBlocks()}

          <Modal
            open={isOpenAddVideoModal}
            centered
            onCancel={() => {
              setIsOpenAddVideoModal(false);
              addVideoForm.resetFields([
                "title",
                "videoPreviewImgUrl",
                "videoUrl",
                "videoDuration",
              ]);
            }}
            onOk={() => {
              if (sectionId && subsectionId) {
                addVideoForm
                  .validateFields()
                  .then((fields) => {
                    httpClient
                      .axios()
                      .post(
                        config.endPoints.addSubsectionContent
                          .replace("{sectionId}", sectionId.toString())
                          .replace("{subsectionId}", subsectionId.toString()),
                        [
                          {
                            type: "video",
                            data: {
                              title: fields?.title,
                              videoPreviewImgUrl: fields?.videoPreviewImgUrl,
                              videoUrl: fields?.videoUrl,
                              videoDuration: fields?.videoDuration,
                            },
                          },
                        ]
                      )
                      .then(() => {
                        notification.success({
                          message: "Видео успешно добавлено!",
                        });
                        setIsOpenAddVideoModal(false);
                        addVideoForm.resetFields([
                          "title",
                          "videoPreviewImgUrl",
                          "videoUrl",
                          "videoDuration",
                        ]);
                        updateBlocksData();
                      })
                      .catch(() => {
                        navigate("/error");
                      });
                  })
                  .catch(() => {});
              }
            }}
            title="Добавить видео"
            width={600}
            okText="Добавить"
            okButtonProps={{ shape: "round" }}
            cancelButtonProps={{ shape: "round", type: "text" }}
          >
            <Form form={addVideoForm} layout="vertical">
              <Form.Item
                name="title"
                label="Заголовок:"
                rules={[
                  { required: true, message: "Заголовок: обязательное поле!" },
                  {
                    type: "string",
                    min: 10,
                    message:
                      "Заголовок: длина должна быть больше или равна 10 символам!",
                  },
                ]}
                required
              >
                <Input
                  placeholder="Введите название видеосюжета.."
                  style={{ borderRadius: "32px" }}
                  maxLength={100}
                />
              </Form.Item>
              <Form.Item
                name="videoPreviewImgUrl"
                label="Превью для видеосюжета:"
                required
                rules={[
                  {
                    required: true,
                    message: "Превью для видеосюжета: обязательное поле!",
                  },
                  {
                    type: "string",
                    min: 10,
                    message:
                      "Превью для видеосюжета: длина должна быть больше или равна 10 символам!",
                  },
                  { type: "url" },
                ]}
              >
                <Input
                  placeholder="Введите ссылку для превью.."
                  style={{ borderRadius: "32px" }}
                />
              </Form.Item>
              <Form.Item
                name="videoDuration"
                label="Длительность видеосюжета (в формате xx:xx:xx):"
                required
                rules={[
                  {
                    required: true,
                    message: "Длительность видеосюжета: обязательное поле!",
                  },
                  {
                    pattern: /\b(?:[01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]\b/,
                    message:
                      "Длительность видеосюжета: неверный форма! Введите значение в формате xx:xx:xx",
                  },
                ]}
              >
                <Input
                  placeholder="Введите длительность (пример - 00:12:03)"
                  style={{ borderRadius: "32px" }}
                />
              </Form.Item>
              <Form.Item
                name="videoUrl"
                label="Ссылка на видеосюжет:"
                required
                rules={[
                  {
                    required: true,
                    message: "Ссылка на видеосюжет: обязательное поле!",
                  },
                  {
                    type: "string",
                    min: 10,
                    message:
                      "Ссылка на видеосюжет: длина должна быть больше или равна 10 символам!",
                  },
                  { type: "url" },
                  () => ({
                    validator(_, value) {
                      const isGoogleDrive = (value as string).includes(
                        "drive.google.com/file/d"
                      );
                      if (!value || isGoogleDrive) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error(
                          "Можно добавлять видео только с  Google Drive!"
                        )
                      );
                    },
                  }),
                ]}
              >
                <Input
                  placeholder="Введите ссылку на видеосюжет.."
                  style={{ borderRadius: "32px" }}
                />
              </Form.Item>
            </Form>
          </Modal>

          <Modal
            open={isOpenEditVideoModal}
            centered
            onCancel={() => {
              setIsOpenEditVideoModal(false);
              editVideoForm.resetFields([
                "title",
                "videoPreviewImgUrl",
                "videoUrl",
                "videoDuration",
              ]);
            }}
            onOk={() => {
              if (sectionId && subsectionId && selectedSubsectionBlock) {
                editVideoForm
                  .validateFields()
                  .then((fields) => {
                    httpClient
                      .axios()
                      .put(
                        config.endPoints.editSubsectionContent
                          .replace("{sectionId}", sectionId.toString())
                          .replace("{subsectionId}", subsectionId.toString())
                          .replace(
                            "{subsectionBlockId}",
                            selectedSubsectionBlock.id.toString()
                          ),
                        {
                          type: "video",
                          data: {
                            title: fields?.title,
                            videoPreviewImgUrl: fields?.videoPreviewImgUrl,
                            videoUrl: fields?.videoUrl,
                            videoDuration: fields?.videoDuration,
                          },
                        }
                      )
                      .then(() => {
                        notification.success({
                          message: "Видео успешно изменено!",
                        });
                        setIsOpenEditVideoModal(false);
                        editVideoForm.resetFields([
                          "title",
                          "videoPreviewImgUrl",
                          "videoUrl",
                          "videoDuration",
                        ]);
                        updateBlocksData();
                      })
                      .catch(() => {
                        navigate("/error");
                      });
                  })
                  .catch(() => {});
              }
            }}
            title="Изменить видео"
            width={600}
            okText="Сохранить"
            okButtonProps={{ shape: "round" }}
            cancelButtonProps={{ shape: "round", type: "text" }}
          >
            <Form form={editVideoForm} layout="vertical">
              <Form.Item
                name="title"
                label="Заголовок:"
                initialValue={
                  (selectedSubsectionBlock?.data as VideoBlockData)?.title
                }
                required
                rules={[
                  { required: true, message: "Заголовок: обязательное поле!" },
                  {
                    type: "string",
                    min: 10,
                    message:
                      "Заголовок: длина должна быть больше или равна 10 символам!",
                  },
                ]}
              >
                <Input
                  placeholder="Введите название видеосюжета.."
                  style={{ borderRadius: "32px" }}
                  maxLength={100}
                />
              </Form.Item>
              <Form.Item
                name="videoPreviewImgUrl"
                label="Превью для видеосюжета:"
                initialValue={
                  (selectedSubsectionBlock?.data as VideoBlockData)
                    ?.videoPreviewImgUrl
                }
                required
                rules={[
                  {
                    required: true,
                    message: "Превью для видеосюжета: обязательное поле!",
                  },
                  {
                    type: "string",
                    min: 10,
                    message:
                      "Превью для видеосюжета: длина должна быть больше или равна 10 символам!",
                  },
                  { type: "url" },
                ]}
              >
                <Input
                  placeholder="Введите ссылка для превью.."
                  style={{ borderRadius: "32px" }}
                />
              </Form.Item>
              <Form.Item
                name="videoDuration"
                label="Длительность видеосюжета (в формате xx:xx:xx):"
                initialValue={
                  (selectedSubsectionBlock?.data as VideoBlockData)
                    ?.videoDuration
                }
                required
                rules={[
                  {
                    required: true,
                    message: "Длительность видеосюжета: обязательное поле!",
                  },
                  {
                    pattern: /\b(?:[01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]\b/,
                    message:
                      "Длительность видеосюжета: неверный форма! Введите значение в формате xx:xx:xx",
                  },
                ]}
              >
                <Input
                  placeholder="Введите длительность (пример - 00:12:03)"
                  style={{ borderRadius: "32px" }}
                />
              </Form.Item>
              <Form.Item
                name="videoUrl"
                label="Ссылка на видеосюжет:"
                initialValue={
                  (selectedSubsectionBlock?.data as VideoBlockData)?.videoUrl
                }
                required
                rules={[
                  {
                    required: true,
                    message: "Ссылка на видеосюжет: обязательное поле!",
                  },
                  {
                    type: "string",
                    min: 10,
                    message:
                      "Ссылка на видеосюжет: длина должна быть больше или равна 10 символам!",
                  },
                  { type: "url" },
                  () => ({
                    validator(_, value) {
                      const isGoogleDrive = (value as string).includes(
                        "drive.google.com/file/d"
                      );
                      if (!value || isGoogleDrive) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error(
                          "Можно добавлять видео только с  Google Drive!"
                        )
                      );
                    },
                  }),
                ]}
              >
                <Input
                  placeholder="Введите ссылку на видеосюжет.."
                  style={{ borderRadius: "32px" }}
                />
              </Form.Item>
            </Form>
          </Modal>

          <Modal
            open={isOpenAddImageModal}
            centered
            onCancel={() => {
              setIsOpenAddImageModal(false);
              addImageForm.resetFields(["url"]);
            }}
            onOk={() => {
              if (sectionId && subsectionId) {
                addImageForm
                  .validateFields()
                  .then((fields) => {
                    httpClient
                      .axios()
                      .post(
                        config.endPoints.addSubsectionContent
                          .replace("{sectionId}", sectionId.toString())
                          .replace("{subsectionId}", subsectionId.toString()),
                        [
                          {
                            type: "image",
                            data: {
                              url: fields.url,
                            },
                          },
                        ]
                      )
                      .then(() => {
                        notification.success({
                          message: "Изображение успешно добавлено!",
                        });
                        setIsOpenAddImageModal(false);
                        addImageForm.resetFields(["url"]);
                        updateBlocksData();
                      })
                      .catch(() => {
                        navigate("/error");
                      });
                  })
                  .catch(() => {});
              }
            }}
            title="Добавить изображение"
            width={600}
            okText="Добавить"
            okButtonProps={{ shape: "round" }}
            cancelButtonProps={{ shape: "round", type: "text" }}
          >
            <Form form={addImageForm} layout="vertical">
              <Form.Item
                name="url"
                label="Ссылка на изображение:"
                required
                rules={[
                  {
                    required: true,
                    message: "Ссылка на изображение: обязательное поле!",
                  },
                  {
                    type: "string",
                    min: 10,
                    message:
                      "Ссылка на изображение: длина должна быть больше или равна 10 символам!",
                  },
                  { type: "url" },
                ]}
              >
                <Input
                  placeholder="Введите ссылку на изображение.."
                  style={{ borderRadius: "32px" }}
                />
              </Form.Item>
            </Form>
          </Modal>

          <Modal
            open={isOpenEditImageModal}
            centered
            onCancel={() => {
              setIsOpenEditImageModal(false);
              editImageForm.resetFields(["url"]);
            }}
            onOk={() => {
              if (sectionId && subsectionId && selectedSubsectionBlock) {
                editImageForm
                  .validateFields()
                  .then((fields) => {
                    httpClient
                      .axios()
                      .put(
                        config.endPoints.editSubsectionContent
                          .replace("{sectionId}", sectionId.toString())
                          .replace("{subsectionId}", subsectionId.toString())
                          .replace(
                            "{subsectionBlockId}",
                            selectedSubsectionBlock.id.toString()
                          ),
                        {
                          type: "image",
                          data: {
                            url: fields.url,
                          },
                        }
                      )
                      .then(() => {
                        notification.success({
                          message: "Изображение успешно изменено!",
                        });
                        setIsOpenEditImageModal(false);
                        editImageForm.resetFields(["url"]);
                        updateBlocksData();
                      })
                      .catch(() => {
                        navigate("/error");
                      });
                  })
                  .catch(() => {});
              }
            }}
            title="Изменить изображение"
            width={600}
            okText="Сохранить"
            okButtonProps={{ shape: "round" }}
            cancelButtonProps={{ shape: "round", type: "text" }}
          >
            <Form form={editImageForm} layout="vertical">
              <Form.Item
                name="url"
                label="Ссылка на изображение:"
                initialValue={
                  (selectedSubsectionBlock?.data as ImageBlockData)?.url
                }
                required
                rules={[
                  {
                    required: true,
                    message: "Ссылка на изображение: обязательное поле!",
                  },
                  {
                    type: "string",
                    min: 10,
                    message:
                      "Ссылка на изображение: длина должна быть больше или равна 10 символам!",
                  },
                  { type: "url" },
                ]}
              >
                <Input
                  placeholder="Введите ссылку на изображение.."
                  style={{ borderRadius: "32px" }}
                />
              </Form.Item>
            </Form>
          </Modal>

          <Modal
            open={isOpenAddAudioModal}
            centered
            onCancel={() => {
              setIsOpenAddAudioModal(false);
              addAudioForm.resetFields(["url"]);
            }}
            onOk={() => {
              if (sectionId && subsectionId) {
                addAudioForm
                  .validateFields()
                  .then((fields) => {
                    httpClient
                      .axios()
                      .post(
                        config.endPoints.addSubsectionContent
                          .replace("{sectionId}", sectionId.toString())
                          .replace("{subsectionId}", subsectionId.toString()),
                        [
                          {
                            type: "audio",
                            data: {
                              url: fields.url,
                            },
                          },
                        ]
                      )
                      .then(() => {
                        notification.success({
                          message: "Аудио успешно добавлено!",
                        });
                        setIsOpenAddAudioModal(false);
                        addAudioForm.resetFields(["url"]);
                        updateBlocksData();
                      })
                      .catch(() => {
                        navigate("/error");
                      });
                  })
                  .catch(() => {});
              }
            }}
            title="Добавить аудио"
            width={600}
            okText="Добавить"
            okButtonProps={{ shape: "round" }}
            cancelButtonProps={{ shape: "round", type: "text" }}
          >
            <Form form={addAudioForm} layout="vertical">
              <Form.Item
                name="url"
                label="Ссылка на аудиозапись:"
                required
                rules={[
                  {
                    required: true,
                    message: "Ссылка на аудиозапись: обязательное поле!",
                  },
                  {
                    type: "string",
                    min: 10,
                    message:
                      "Ссылка на аудиозапись: длина должна быть больше или равна 10 символам!",
                  },
                  { type: "url" },
                ]}
              >
                <Input
                  placeholder="Введите ссылку на аудиозапись.."
                  style={{ borderRadius: "32px" }}
                />
              </Form.Item>
            </Form>
          </Modal>

          <Modal
            open={isOpenEditAudioModal}
            centered
            onCancel={() => {
              setIsOpenEditAudioModal(false);
              editAudioForm.resetFields(["url"]);
            }}
            onOk={() => {
              if (sectionId && subsectionId && selectedSubsectionBlock) {
                editAudioForm
                  .validateFields()
                  .then((fields) => {
                    httpClient
                      .axios()
                      .put(
                        config.endPoints.editSubsectionContent
                          .replace("{sectionId}", sectionId.toString())
                          .replace("{subsectionId}", subsectionId.toString())
                          .replace(
                            "{subsectionBlockId}",
                            selectedSubsectionBlock.id.toString()
                          ),
                        {
                          type: "audio",
                          data: {
                            url: fields.url,
                          },
                        }
                      )
                      .then(() => {
                        notification.success({
                          message: "Аудио успешно изменено!",
                        });
                        setIsOpenEditAudioModal(false);
                        editAudioForm.resetFields(["url"]);
                        updateBlocksData();
                      })
                      .catch(() => {
                        navigate("/error");
                      });
                  })
                  .catch(() => {});
              }
            }}
            title="Изменить аудио"
            width={600}
            okText="Сохранить"
            okButtonProps={{ shape: "round" }}
            cancelButtonProps={{ shape: "round", type: "text" }}
          >
            <Form form={editAudioForm} layout="vertical">
              <Form.Item
                name="url"
                label="Ссылка на аудиозапись:"
                initialValue={
                  (selectedSubsectionBlock?.data as AudioBlockData)?.url
                }
                required
                rules={[
                  {
                    required: true,
                    message: "Ссылка на аудиозапись: обязательное поле!",
                  },
                  {
                    type: "string",
                    min: 10,
                    message:
                      "Ссылка на аудиозапись: длина должна быть больше или равна 10 символам!",
                  },
                  { type: "url" },
                ]}
              >
                <Input
                  placeholder="Введите ссылку на аудиозапись.."
                  style={{ borderRadius: "32px" }}
                />
              </Form.Item>
            </Form>
          </Modal>

          <Modal
            open={isOpenAddTextModal}
            centered
            onCancel={() => {
              setIsOpenAddTextModal(false);
            }}
            onOk={() => {
              if (sectionId && subsectionId) {
                httpClient
                  .axios()
                  .post(
                    config.endPoints.addSubsectionContent
                      .replace("{sectionId}", sectionId.toString())
                      .replace("{subsectionId}", subsectionId.toString()),
                    [
                      {
                        type: "text",
                        data: {
                          data: editorRef.current.getContent(),
                        },
                      },
                    ]
                  )
                  .then(() => {
                    notification.success({
                      message: "Текст успешно добавлен!",
                    });
                    setIsOpenAddTextModal(false);
                    editorRef.current.resetContent();
                    updateBlocksData();
                  })
                  .catch(() => {
                    navigate("/error");
                  });
              }
            }}
            title="Добавить текст"
            width={1000}
            okText="Добавить"
            okButtonProps={{ shape: "round" }}
            cancelButtonProps={{ shape: "round", type: "text" }}
          >
            <Editor
              tinymceScriptSrc="/tinymce/tinymce.min.js"
              licenseKey="gpl"
              onInit={(_evt, editor) => (editorRef.current = editor)}
              initialValue=""
              init={{
                language: "ru",
                height: 600,
                branding: false,
                elementpath: false,
                help_accessibility: false,
                details_initial_state: "expanded",
                details_serialized_state: "collapsed",
                plugins: [
                  "advlist",
                  "autolink",
                  "lists",
                  "charmap",
                  "preview",
                  "link",
                  "anchor",
                  "searchreplace",
                  "visualblocks",
                  "code",
                  "fullscreen",
                  "table",
                  "help",
                  "wordcount",
                  "accordion",
                ],
                menu: {
                  file: { title: "File", items: "" },
                  edit: {
                    title: "Edit",
                    items:
                      "undo redo | cut copy paste pastetext | selectall | searchreplace",
                  },
                  view: {
                    title: "View",
                    items: "visualblocks | spellchecker | preview fullscreen",
                  },
                  insert: {
                    title: "Insert",
                    items: "inserttable | link | accordion | hr | anchor",
                  },
                  format: {
                    title: "Format",
                    items:
                      "bold italic underline strikethrough superscript subscript codeformat | styles blocks fontfamily fontsize align lineheight | forecolor backcolor | language | removeformat",
                  },
                  tools: {
                    title: "Tools",
                    items:
                      "spellchecker spellcheckerlanguage | a11ycheck code wordcount",
                  },
                  table: {
                    title: "Table",
                    items:
                      "inserttable | cell row column | advtablesort | tableprops deletetable",
                  },
                  help: { title: "Help", items: "help" },
                },
                toolbar:
                  "undo redo | blocks | " +
                  "bold italic underline strikethrough | link accordion | forecolor backcolor | alignleft aligncenter " +
                  "alignright alignjustify | bullist numlist outdent indent | " +
                  "removeformat",
              }}
            />
          </Modal>

          <Modal
            open={isOpenEditTextModal}
            centered
            onCancel={() => {
              setIsOpenEditTextModal(false);
            }}
            onOk={() => {
              if (sectionId && subsectionId && selectedSubsectionBlock) {
                httpClient
                  .axios()
                  .put(
                    config.endPoints.editSubsectionContent
                      .replace("{sectionId}", sectionId.toString())
                      .replace("{subsectionId}", subsectionId.toString())
                      .replace(
                        "{subsectionBlockId}",
                        selectedSubsectionBlock.id.toString()
                      ),
                    {
                      type: "text",
                      data: {
                        data: editorRef.current.getContent(),
                      },
                    }
                  )
                  .then(() => {
                    notification.success({
                      message: "Текст успешно изменен!",
                    });
                    setIsOpenEditTextModal(false);
                    editorRef.current.resetContent();
                    updateBlocksData();
                  })
                  .catch(() => {
                    navigate("/error");
                  });
              }
            }}
            title="Изменить текст"
            width={1000}
            okText="Сохранить"
            okButtonProps={{ shape: "round" }}
            cancelButtonProps={{ shape: "round", type: "text" }}
          >
            <Editor
              tinymceScriptSrc="/tinymce/tinymce.min.js"
              licenseKey="gpl"
              onInit={(_evt, editor) => (editorRef.current = editor)}
              initialValue={
                (selectedSubsectionBlock?.data as TextBlockData)?.data
              }
              init={{
                language: "ru",
                height: 600,
                branding: false,
                elementpath: false,
                help_accessibility: false,
                details_initial_state: "expanded",
                details_serialized_state: "collapsed",
                plugins: [
                  "advlist",
                  "autolink",
                  "lists",
                  "charmap",
                  "preview",
                  "link",
                  "anchor",
                  "searchreplace",
                  "visualblocks",
                  "code",
                  "fullscreen",
                  "table",
                  "help",
                  "wordcount",
                  "accordion",
                ],
                menu: {
                  file: { title: "File", items: "" },
                  edit: {
                    title: "Edit",
                    items:
                      "undo redo | cut copy paste pastetext | selectall | searchreplace",
                  },
                  view: {
                    title: "View",
                    items: "visualblocks | spellchecker | preview fullscreen",
                  },
                  insert: {
                    title: "Insert",
                    items: "inserttable | link | accordion | hr | anchor",
                  },
                  format: {
                    title: "Format",
                    items:
                      "bold italic underline strikethrough superscript subscript codeformat | styles blocks fontfamily fontsize align lineheight | forecolor backcolor | language | removeformat",
                  },
                  tools: {
                    title: "Tools",
                    items:
                      "spellchecker spellcheckerlanguage | a11ycheck code wordcount",
                  },
                  table: {
                    title: "Table",
                    items:
                      "inserttable | cell row column | advtablesort | tableprops deletetable",
                  },
                  help: { title: "Help", items: "help" },
                },
                toolbar:
                  "undo redo | blocks | " +
                  "bold italic underline strikethrough | link accordionВ | forecolor backcolor | alignleft aligncenter " +
                  "alignright alignjustify | bullist numlist outdent indent | " +
                  "removeformat",
              }}
            />
          </Modal>

          <Modal
            open={isOpenDeleteSubsectionBlockModal}
            centered
            onCancel={() => {
              setIsOpenDeleteSubsectionBlockModal(false);
              setSelectedSubsectionBlock(null);
            }}
            onOk={() => {
              if (sectionId && subsectionId && selectedSubsectionBlock) {
                httpClient
                  .axios()
                  .delete(
                    config.endPoints.deleteSubsectionContent
                      .replace("{sectionId}", sectionId)
                      .replace("{subsectionId}", subsectionId)
                      .replace(
                        "{subsectionBlockId}",
                        selectedSubsectionBlock.id.toString()
                      )
                  )
                  .then(() => {
                    notification.success({
                      message: "Блок успешно удален!",
                    });
                    setIsOpenDeleteSubsectionBlockModal(false);
                    setSelectedSubsectionBlock(null);
                    updateBlocksData();
                  })
                  .catch(() => {
                    navigate("/error");
                  });
              }
            }}
            title="Удаление блока"
            width={600}
            okText="Удалить"
            okButtonProps={{ shape: "round" }}
            cancelButtonProps={{ shape: "round", type: "text" }}
          >
            <Paragraph>Вы действительно хотите удалить данный блок?</Paragraph>
          </Modal>
        </>
      ) : (
        <Spin tip="Загрузка" size="large" spinning={!authContext} />
      )}
    </div>
  );
};
