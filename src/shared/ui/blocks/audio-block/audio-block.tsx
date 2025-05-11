import React from 'react';
import './audio-block.scss';

type AudioBlockProps = {
    srcUrl: string;
};

export const AudioBlock = (props: AudioBlockProps): JSX.Element => {
    return (
        <iframe
            className="audio-block"
            src={props.srcUrl}
            width="650"
            height="120"
        />
    );
}
