import React from "react";

import "./success-register-page.scss";
import {Result} from "antd";

export const SuccessRegisterPage = (): JSX.Element => {
  return (
    <div className="success-register-page">
        <Result
            status="success"
            title="Вы успешно зарегистрировались!"
            subTitle="Ожидайте пока администратор подвердит вашу регистрацию."
        />
    </div>
  );
};
