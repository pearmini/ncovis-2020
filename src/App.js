import React from "react";
import "antd/dist/antd.css";
import styled from "styled-components";

import IntroductionPanel from "./components/IntroductionPanel";
import HotsPanel from "./components/HotsPanel";
import StoryPanel from "./components/StoryPanel";
import NewsPanel from "./components/NewsPanel";

const Layout = styled.div`
  /* background: #f9f9f9; */
`;
const Logo = styled.div`
  color: white;
  font-size: 25px;
  font-weight: bold;
  color: white;
`;

const HeaderWrapper = styled.div`
  height: 56px;
  background: black;
  line-height: 56px;
`;
const Header = styled.header`
  margin: 0 auto;
  max-width: 1200px;
  background: black;
  width: 90%;
`;

const Content = styled.div`
  margin: 0 auto;
  width: 90%;
  max-width: 1200px;
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
        <IntroductionPanel />
        <HotsPanel />
        <NewsPanel />
        <StoryPanel />
      </Content>
    </Layout>
  );
}

export default App;
