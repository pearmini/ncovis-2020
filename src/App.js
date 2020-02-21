import React from "react";
import "antd/dist/antd.css";
import styled from "styled-components";

import IntroductionPanel from "./components/IntroductionPanel";
import HotPanel from "./components/HotPanel";
import CommentPanel from "./components/CommentPanel";
import NewsPanel from "./components/NewsPanel";

const Layout = styled.div`
  /* background: #f0f8ea; */
`;
const Logo = styled.div`
  color: white;
  font-size: 25px;
  font-weight: bold;
  color: #ebebd3;
`;

const HeaderWrapper = styled.div`
  height: 56px;
  background: #e54b4b;
  line-height: 56px;
`;
const Header = styled.header`
  margin: 0 auto;
  max-width: 1200px;
  background: #e54b4b;
  width: 90%;
`;

const Content = styled.section`
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
        <HotPanel />
        <NewsPanel />
        <CommentPanel />
      </Content>
    </Layout>
  );
}

export default App;
