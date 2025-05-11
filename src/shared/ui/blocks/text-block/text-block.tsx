import React from "react";
import "./text-block.scss";
import parse from "html-react-parser";

type TextBlockProps = {
  data: string;
};

export const TextBlock = (props: TextBlockProps): JSX.Element => {
  return <div className="text-block">{parse(props.data)}</div>;
};
