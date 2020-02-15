import React from "react";
import "antd/dist/antd.css";
import styled from "styled-components";

import LineChart from "./components/LineChart";
import ShapeWordle from "./components/ShapeWordle";
import TopicCloud from "./components/TopicCloud";
import Timeline from "./components/Timeline";
import Hot from "./components/Hot";
import Heatmap from "./components/Heatmap";

const Layout = styled.div``;
const Logo = styled.div`
  color: white;
  font-size: 25px;
  font-weight: bold;
`;
const HeaderWrapper = styled.div`
  height: 56px;
  background: black;
  line-height: 56px;
`;
const Header = styled.header`
  margin: 0 auto;
  max-width: 1300px;
  width: 95%;
`;

const Content = styled.section`
  margin: 0 auto;
  max-width: 1300px;
  width: 95%;
`;

const Row = styled.div`
  display: flex;
  padding-bottom: 1em;
`;
const Col = styled.div`
  display: flex;
  flex-direction: column;
`;
const Introduction = styled.h2`
  padding: 1em 0;
`;

function App() {
  return (
    <Layout>
      <HeaderWrapper>
        <Header>
          <Logo>nCov 社交媒体可视化</Logo>
        </Header>
      </HeaderWrapper>
      <Content>
        <Introduction>这里主要关心在疫情期间新闻和人们的热烈讨论的话题</Introduction>
        <Row>
          <TopicCloud />
          <Hot />
        </Row>
        <Timeline />
        <Row>
          <ShapeWordle />
          <Col>
            <Heatmap />
            <LineChart />
          </Col>
        </Row>
      </Content>
    </Layout>
  );
}

export default App;
