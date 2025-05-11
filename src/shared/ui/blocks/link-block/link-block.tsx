import React from 'react';
import './link-block.scss';

type LinkBlockProps = {
    url: string;
    text: string;
};

export const LinkBlock = (props: LinkBlockProps): JSX.Element => {
    return (
        <div className="link-block">
            <a href={props.url} target="_blank" rel="noreferrer">{props.text}</a>
        </div>
    );
}
