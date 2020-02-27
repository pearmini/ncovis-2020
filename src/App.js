import React from "react";
import "antd/dist/antd.css";
import styled from "styled-components";

import IntroductionPanel from "./components/IntroductionPanel";
import HotsPanel from "./components/HotsPanel";
import StoryPanel from "./components/StoryPanel";
import NewsPanel from "./components/NewsPanel";
import Header from "./components/Header";
import DiscoveryPanel from "./components/DiscoveryPanel";

const Layout = styled.div`
  background: #f9f9f9;
`;

const Content = styled.div`
  margin: 0 auto;
  width: 90%;
  max-width: 1200px;
`;

function App() {
  return (
    <Layout>
      <Header />
      <Content>
        <IntroductionPanel />
        <HotsPanel />
        <NewsPanel />
        <StoryPanel />
        <DiscoveryPanel />
      </Content>
    </Layout>
  );
}

export default App;
