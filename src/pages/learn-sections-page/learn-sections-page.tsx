import React, {useContext, useEffect, useState} from "react";
import {Card, Col, Flex, Row, Spin, Typography} from 'antd';

import "./learn-sections-page.scss";
import {useNavigate} from "react-router-dom";
import {LearnSectionCard} from "../../shared/model/learn-section-card";
import {httpClient} from "../../shared/api/http-client";
import {config} from "../../shared/config";
import {Footer} from "../../shared/ui/footer/footer";
import {MetrikaCounter} from "react-metrika";

const {Paragraph} = Typography;

export const LearnSectionsPage = (): JSX.Element => {
  const navigate = useNavigate();
  const [learnSectionCardsData, setLearnSectionCardsData] = useState<LearnSectionCard[]>([]);

  useEffect(() => {
      httpClient.axios().get<LearnSectionCard[]>(config.endPoints.getLearnSectionCardsUrl).then((response) => {
         setLearnSectionCardsData(response.data);
      }).catch(() => {
          navigate("/error");
      });
  }, []);

  const getLearnCards = () => {
    const result: JSX.Element[] = [];

      learnSectionCardsData.forEach((learnSectionCard) => {
      result.push(
          <Col xs={24} sm={12} md={12} lg={12} xl={8} xxl={8}>
            <Card style={{backgroundColor: "#d8b2ed", cursor: "pointer", height: "100px",
              display: "flex", justifyContent: "center", alignItems: "center"}} hoverable bordered={false}
                  onClick={() => {navigate(`/learn/${learnSectionCard.id}`);}}
            >
              {learnSectionCard.text}
            </Card>
          </Col>
      );
    });

    return result;
  };

  return (
      <div className="learn-page">
          <div style={{textAlign: "center"}}>
              <Paragraph style={{fontSize: "18pt"}}>Обучение</Paragraph>
          </div>
          <Flex style={{height: '100%'}} justify="center" align="center">
              <Row gutter={[16, 16]}>
                  {getLearnCards()}
              </Row>
          </Flex>

          <Footer />

          <MetrikaCounter
              id={99048221}
              options={{
                  trackHash: true
              }}
          />
      </div>
  );
};
