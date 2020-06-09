import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useWindowSize } from "react-use";
import { connect } from "dva";
import { Tabs } from "antd";

import chinaURL from "../../assets/images/china.png";
import zhihuURL from "../../assets/images/zhihu.png";

const { TabPane } = Tabs;

const Container = styled.div`
  padding: 56px 0;
  position: relative;
  height: ${(props) => props.height}px;
  width: 100%;
  justify-content: space-around;
  align-items: center;
  display: flex;
  flex-direction: column;
`;

const An = styled.div`
  position: absolute;
  top: -56px;
`;

const Title = styled.h1`
  margin-top: 1em;
  font-size: 60px;
  font-weight: bold;

  @media (max-width: 992px) {
    font-size: 40px;
  }

  @media (max-width: 768px) {
    font-size: 40px;
  }

  @media (max-width: 576px) {
    font-size: 25px;
  }
`;

const Row = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;

  @media (max-width: 768px) {
    flex-direction: column;
    height: 50%;
  }
`;

const China = styled.img`
  width: 50%;
  @media (max-width: 768px) {
    height: 50%;
    width: initial;
  }
`;

const Zhihu = styled.img`
  width: 50%;
  @media (max-width: 768px) {
    height: 50%;
    width: initial;
  }
`;

const Time = styled.div`
  margin: 1em auto;
  color: #bfbfbf;
  font-size: 11px;
  display: flex;
  flex-direction: row-reverse;
`;

const Box = styled.div`
  background: white;
  border-radius: 8px;
  padding: 0.5em 1em;
  width: 500px;
  max-width: 100%;
`;

const CardContainer = styled.div`
  display: flex;
  margin-top: 1em;
  justify-content: space-around;
`;

const Card = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Change = styled.div`
  color: #999999;
  line-height: 22px;
  font-size: 12px;
  & span {
    margin-left: 2px;
    color: ${(props) => props.color};
  }
  @media (max-width: 600px) {
    font-size: 10px;
  }
`;

const Value = styled.div`
  font-size: 19px;
  color: ${(props) => props.color};
  font-weight: bold;

  @media (max-width: 700px) {
    font-size: 14px;
  }

  @media (max-width: 600px) {
    font-size: 12px;
  }
`;

const Name = styled.div`
  font-weight: bold;
  color: #444444;

  @media (max-width: 700px) {
    font-size: 10px;
  }
`;

const DashBoard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

function Overview({ overview, getOverview }) {
  const { height } = useWindowSize();
  const [tab, setTab] = useState("全球");
  const { data, time } = overview;
  const formate = (time) => {
    const date = new Date(time);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  const colorByName = {
    累计确诊: "#F9345e",
    累计死亡: "#6236ff",
    累计治愈: "#1cb142",
    现存确诊: "#fa6400",
  };

  useEffect(() => {
    getOverview();
  }, [getOverview]);

  return (
    <Container height={height}>
      <An id="overview" />
      <DashBoard>
        <Title>COVID-19 舆论新闻可视化</Title>
        <Tabs
          onChange={setTab}
          activeKey={tab}
          style={{ width: 500, maxWidth: "100%" }}
        >
          {data.map((d) => (
            <TabPane tab={d.name} key={d.name}>
              <Box>
                <CardContainer>
                  {d.data.map(({ name, value, change }) => (
                    <Card key={name}>
                      <Change color={colorByName[name]}>
                        {change >= 0 ? "新增" : "减少"}
                        <span>
                          {change >= 0 ? "+" : "-"}
                          {Math.abs(change)}
                        </span>
                      </Change>
                      <Value color={colorByName[name]}>{value}</Value>
                      <Name>{d.name + name}</Name>
                    </Card>
                  ))}
                </CardContainer>
                <Time>{`截至${formate(time)}, ${
                  d.name === "全国" ? "全国累计（含港澳台地区）" : "全球数据"
                }`}</Time>
              </Box>
            </TabPane>
          ))}
        </Tabs>
      </DashBoard>
      <Row>
        <Zhihu src={zhihuURL} />
        <China src={chinaURL} />
      </Row>
    </Container>
  );
}

export default connect(
  ({ overview, loading }) => ({
    overview,
    loading: loading.models.overview,
  }),
  {
    getOverview: () => ({ type: "overview/getData" }),
  }
)(Overview);
