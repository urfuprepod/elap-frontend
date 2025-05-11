import React from 'react';
import {Typography} from "antd";
import './section.scss';
import {useNavigate} from "react-router-dom";

const { Text } = Typography;


export const Section = ({title, additionalUrl, additionalText, className, children}:
                            { title: string, additionalUrl?: string, additionalText?: string,
                                className?:string, children: React.ReactNode }): JSX.Element => {
    const navigate = useNavigate();

  return(
      <div className={`section ${className}`}>
          <div className="section-header">
              <Text strong className="section-title">{title}</Text>
              {additionalUrl && additionalText ? <a onClick={() => {navigate(additionalUrl)}}>{additionalText}</a> : null}
          </div>
          <div className="section-content">{children}</div>
      </div>
  );
};
