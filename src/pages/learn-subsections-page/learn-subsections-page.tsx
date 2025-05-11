import React, {useContext, useEffect, useState} from "react";

import "./learn-subsections-page.scss";
import {AuthContext} from "../../shared/ui/auth-context/auth-context";
import {useNavigate, useParams} from "react-router-dom";
import {Card, Col, Flex, Row, Spin, Typography} from "antd";
import {LearnSectionCard} from "../../shared/model/learn-section-card";
import {LearnSubsectionCard} from "../../shared/model/learn-subsection-card";
import {httpClient} from "../../shared/api/http-client";
import {config} from "../../shared/config";
import Logo from "../../media/logo.svg";
import LogoUrfu from "../../media/logo_urfu.svg";
import {Footer} from "../../shared/ui/footer/footer";

const {Paragraph} = Typography;

export const LearnSubsectionsPage = (): JSX.Element => {
    const { sectionId } = useParams();
    const navigate = useNavigate();

    const [currentSection, setCurrentSection] = useState<LearnSectionCard | null>(null);
    const [learnSubsectionsCardData, setLearnSubsectionsCardData] = useState<LearnSubsectionCard[]>([]);

    useEffect(() => {
        if (sectionId) {
            httpClient.axios().get<LearnSectionCard[]>(config.endPoints.getLearnSectionCardsUrl).then((response) => {
                const filteredSection = response.data.filter((item) => item.id === parseInt(sectionId));
                setCurrentSection(filteredSection.length ? filteredSection[0] : null);
            }).catch(() => {
                navigate("/error");
            });
            httpClient.axios().get<LearnSubsectionCard[]>(config.endPoints.getLearnSubsectionCardsUrl
                .replace('{sectionId}', sectionId)).then((response) => {
               setLearnSubsectionsCardData(response.data);
            }).catch(() => {
                navigate("/error");
            });
        }
    }, [sectionId]);

    const getLearnSubsectionCards = () => {
        const result: JSX.Element[] = [];

        learnSubsectionsCardData.forEach((learnSubsectionCard) => {
            result.push(
                <Col xs={24} sm={12} md={12} lg={12} xl={8} xxl={8}>
                    <Card style={{backgroundColor: "#d8b2ed", cursor: "pointer", height: "100px",
                        display: "flex", justifyContent: "center", alignItems: "center"}} hoverable bordered={false}
                          onClick={() => {navigate(`/learn/${sectionId}/${learnSubsectionCard.id}`);}}
                    >
                        {learnSubsectionCard.text}
                    </Card>
                </Col>
            );
        });

        return result;
    };

    return (
        <div className="learn-subsections-page">
            <div style={{textAlign: "center"}}>
                <Paragraph style={{fontSize: "18pt"}}>{currentSection ? currentSection.text : ''}</Paragraph>
            </div>
            <Flex style={{height: '100%'}} justify="center" align="center">
                <Row gutter={[16, 16]}>
                    {getLearnSubsectionCards()}
                </Row>
            </Flex>
            <Footer />
        </div>
    )
};
