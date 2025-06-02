import React, {useEffect, useState} from "react";
import {Card, Col, Collapse, CollapseProps, Flex, Image, Row, Typography} from 'antd';
import HeroImg from 'media/hero1.webp';

import "./main-page.scss";
import {Section} from "../../shared/ui/section/section";
import {Advertisement} from "../../shared/model/advertisement";
import {httpClient} from "../../shared/api/http-client";
import {config} from "../../shared/config";
import {FileList} from "../../shared/ui/file-list/file-list";
import {FaqItem} from "../../shared/model/faq-item";
import {Footer} from "../../shared/ui/footer/footer";
import {MetrikaCounter, MetrikaCounters} from "react-metrika";
import { formatDate } from "shared/methods";

const {Paragraph, Text } = Typography;

export const MainPage = (): JSX.Element => {
  const [lastAdvertisementsData, setLastAdvertisementsData] = useState<Advertisement[]>([]);
  const [faqItemsData, setFaqItemsData] = useState<CollapseProps['items']>([]);



  useEffect(() => {
    httpClient.axios().get<Advertisement[]>(config.endPoints.getLastAdvertisementsUrl).then((response) => {
      setLastAdvertisementsData(response.data);
    }).catch(() => {
      setLastAdvertisementsData([]);
    });
    httpClient.axios().get<FaqItem[]>(config.endPoints.getAllFaqItems).then((response) => {
      if (response.data.length) {
        const faqItemsTempData: CollapseProps['items'] = [];
        response.data.forEach((faqItem, index) => {
          faqItemsTempData.push({
            key: index,
            label: faqItem.question,
            children: <p>{faqItem.answer}</p>,
          });
        });
        setFaqItemsData(faqItemsTempData);
      }
    });
  }, []);

  const getAdvertisements = () => {
    const result: JSX.Element[] = [];

    if (lastAdvertisementsData.length) {
      lastAdvertisementsData.forEach((item) => {
        result.push(
            <Col xs={24} sm={24} md={24} lg={24}
                 xl={lastAdvertisementsData.length === 1 ? 24 : (lastAdvertisementsData.length === 2 ? 12 : 8)}
                 xxl={lastAdvertisementsData.length === 1 ? 24 : (lastAdvertisementsData.length === 2 ? 12 : 8)}>
              <Card style={{backgroundColor: "#d8b2ed", height: "100%"}} bordered={false}>
                <Paragraph style={{fontSize: "12pt", fontWeight: "bold"}}>
                  {item.title}
                </Paragraph>
                <Paragraph>
                  {item.text}
                </Paragraph>
                { item?.files?.length ? <FileList link="main" files={item.files} /> : null }
                <Flex justify="space-between" align="center" style={{marginTop: "10px"}}>
                  <Text italic>{formatDate(`${item.date}`)}</Text>
                </Flex>
              </Card>
            </Col>
        )
      });
    } else {
      result.push(
          <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
            <Card style={{backgroundColor: "#d8b2ed", height: "100%", display: "flex",
              justifyContent: "center", alignItems: "center"}} bordered={false}>
              <Paragraph style={{fontSize: "12pt", fontWeight: "bold", marginBottom: "0"}}>
                Пока нет никаких объявлений
              </Paragraph>
            </Card>
          </Col>
      )
    }

    return result;
  };

  return <div className="main-page">
    <div className="hero-section">
      <Row>
        <Col xs={24} sm={24} md={24} lg={24} xl={14} xxl={13} className="hero-text">
          <Flex justify="center" align="center" vertical gap={15}>
            <Paragraph className="row-1">
              Электронная
            </Paragraph>
            <Paragraph className="row-2">
              ЛАБОРАТОРИЯ
            </Paragraph>
            <Paragraph className="row-3" italic>
              академического
            </Paragraph>
            <Paragraph className="row-4" italic>
              письма
            </Paragraph>
          </Flex>
        </Col>
        <Col xs={0} sm={0} md={0} lg={0} xl={1} xxl={2} />
        <Col xs={0} sm={0} md={0} lg={0} xl={9} xxl={9}>
          <Flex align="center" justify="center">
            <Image
                preview={false}
                src={HeroImg}
                className="hero-img"
            />
          </Flex>
        </Col>
      </Row>
    </div>
    <Section title="Объявления" additionalUrl="/advertisements" additionalText="Посмотреть все">
      <Row gutter={[16, 16]}>
        {getAdvertisements()}
      </Row>
    </Section>
    <br />
    <br />
    <br />
    <Section title="FAQ">
      <Collapse size="middle" accordion items={faqItemsData} />
    </Section>
    <br />
    <br />
    <Footer />

    <MetrikaCounters
        ids={[99048196, 99048266]}
        options={{
          trackHash: true,
          webvisor: true
        }}
    />
  </div>;
};
