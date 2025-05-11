import React, {useContext, useEffect, useState} from "react";

import "./learn-subsection-content-page.scss";
import {Empty, Flex, Spin, Typography} from "antd";
import {AuthContext} from "../../shared/ui/auth-context/auth-context";
import {useNavigate, useParams} from "react-router-dom";
import {VideoBlock} from "../../shared/ui/blocks/video-block/video-block";
import {TextBlock} from "../../shared/ui/blocks/text-block/text-block";
import {AudioBlock} from "../../shared/ui/blocks/audio-block/audio-block";
import {LinkBlock} from "../../shared/ui/blocks/link-block/link-block";
import {ImageBlock} from "../../shared/ui/blocks/image-block/image-block";
import {LearnSubsectionCard} from "../../shared/model/learn-subsection-card";
import {
    AudioBlockData,
    BlockInfo,
    BlockType,
    ImageBlockData,
    LinkBlockData,
    TextBlockData,
    VideoBlockData
} from "../../shared/model/block";
import {httpClient} from "../../shared/api/http-client";
import {config} from "../../shared/config";
import Logo from "../../media/logo.svg";
import LogoUrfu from "../../media/logo_urfu.svg";
import {Footer} from "../../shared/ui/footer/footer";

const { Paragraph } = Typography;

export const LearnSubsectionContent = (): JSX.Element => {
    const navigate = useNavigate();
    const { sectionId, subsectionId } = useParams();
    const [currentSubsection, setCurrentSubsection] = useState<LearnSubsectionCard | null>(null);
    const [blocksData, setBlocksData] = useState<BlockInfo[]>([]);

    useEffect(() => {
        if (sectionId && subsectionId) {
             if (Number.isInteger(parseInt(subsectionId))) {
                httpClient.axios().get<LearnSubsectionCard[]>(config.endPoints.getLearnSubsectionCardsUrl
                    .replace('{sectionId}', sectionId)).then((response) => {
                    const filteredSubsection = response.data.filter((item) => item.id === parseInt(subsectionId));
                    setCurrentSubsection(filteredSubsection.length ? filteredSubsection[0] : null);
                });
                httpClient.axios().get<BlockInfo[]>(config.endPoints.getLearnSubsectionContentUrl
                    .replace('{sectionId}', sectionId)
                    .replace('{subsectionId}', subsectionId)
                ).then((response) => {
                    setBlocksData(response.data);
                });
            } else {
                navigate('/not-found')
            }
        }
    }, [sectionId, subsectionId]);

    const getBlockRender = (blockInfo: BlockInfo): JSX.Element => {
        switch (blockInfo.type) {
            case BlockType.Text: {
                const data: TextBlockData = blockInfo.data as TextBlockData;
                return <TextBlock
                    data={data.data}
                />
            }
            case BlockType.Audio: {
                const data: AudioBlockData = blockInfo.data as AudioBlockData;
                return <AudioBlock
                    srcUrl={data.url}
                />
            }
            case BlockType.Link: {
                const data: LinkBlockData = blockInfo.data as LinkBlockData;
                return <LinkBlock
                    url={data.url}
                    text={data.text}
                />
            }
            case BlockType.Image: {
                const data: ImageBlockData = blockInfo.data as ImageBlockData;
                return <ImageBlock
                    srcUrl={data.url}
                />
            }
            case BlockType.Video: {
                const data: VideoBlockData = blockInfo.data as VideoBlockData;
                return <VideoBlock
                    title={data.title}
                    videoPreviewImgUrl={data.videoPreviewImgUrl}
                    videoUrl={data.videoUrl}
                    videoDuration={data.videoDuration}
                    id={0}
                />
            }
        }
    }

    const getBlocks = () => {
      const result: JSX.Element[] = [];

      if (blocksData.length > 0) {
          blocksData.forEach((blockData) => {
              result.push(getBlockRender(blockData));
          });
      } else {
          result.push(
              <Flex style={{height: '100%'}} justify="center" align="center">
                  <Empty description="Здесь пока ничего нет" />
              </Flex>
          )
      }

      return result;
    }

    return (
        <div className="learn-subsection-content-page">
            <div style={{textAlign: "center"}}>
                <Paragraph style={{fontSize: "18pt"}}>{currentSubsection?.text}</Paragraph>
            </div>
            {getBlocks()}
            <Footer />
        </div>
    );
}
