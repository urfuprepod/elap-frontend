export enum BlockType {
    Text = "text",
    Video = "video",
    Link = "link",
    Audio = "audio",
    Image = "image"
};

export type TextBlockData = {
    data: string;
};

export type VideoBlockData = {
    title: string;
    videoDuration: string;
    videoPreviewImgUrl: string;
    videoUrl: string;
};

export type LinkBlockData = {
    url: string;
    text: string;
};

export type AudioBlockData = {
    url: string;
};

export type ImageBlockData = {
    url: string;
};

export type BlockInfo = {
    id: number;
    type: BlockType;
    data: TextBlockData | VideoBlockData | LinkBlockData | AudioBlockData | ImageBlockData;
};
