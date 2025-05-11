import React from 'react';
import {Flex, Typography} from "antd";
import Logo from "../../../media/logo.svg";
import LogoUrfu from "../../../media/logo_urfu.svg";
import './footer.scss';

export const Footer = () => {
    return(
        <div className="footer">
            <Flex justify="center" align="center" gap={10} vertical>
                <Flex justify="center" align="center" gap={20}>
                    <img src={Logo} height={70} width={120} />
                    <span>© 2024</span>
                    <img src={LogoUrfu} height={70} width={120} />
                </Flex>

                <Typography style={{width: "90%"}}>
                    Все права защищены. При использовании материалов сайта обязательна ссылка на сайт Электронной Лаборатории Академического письма. При перепечатывании целых блоков и упражнений необходимо запросить согласие администратора по электронной почте <a href="mailto:e-lab.academic.writing@mail.ru">e-lab.academic.writing@mail.ru</a>.
                </Typography>
            </Flex>
        </div>
    );
}
