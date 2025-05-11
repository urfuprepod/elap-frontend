import React from 'react';
import './image-block.scss';
import { Image } from 'antd';

type ImageBlockProps = {
    srcUrl: string;
};

export const ImageBlock = (props: ImageBlockProps): JSX.Element => {
    return props.srcUrl && !props.srcUrl.includes("drive.google.com") ? (
        <Image
            width={600}
            className="image-block"
            src={props.srcUrl}
        />
    ) : <iframe
        className="image-block"
        src={props.srcUrl}
        height={400}
        width={600}
    />;
}
