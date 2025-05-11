import React from "react";

import "./error-page.scss";
import {Result} from "antd";

export const ErrorPage = (): JSX.Element => {
  return (
    <div className="error-page">
        <Result
            status="error"
            title="Ошибка!"
            subTitle="Упс! У нас технические неполадки. Мы делаем все возможное, несмотря на то, что у нас лапки. Обновите сайт чуть позже."
        />
    </div>
  );
};
