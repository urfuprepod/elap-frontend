import React from "react";

import "./not-found-page.scss";
import {Result} from "antd";

export const NotFoundPage = (): JSX.Element => {
  return <div className="not-found-page">
    <Result
        status="error"
        title="Ошибка!"
        subTitle="Такой страницы не существует!"
    />
  </div>;
};
