import React from "react";
import "antd/dist/antd.css";
import styled, { ThemeProvider } from "styled-components";

import OverviewPanel from "./components/OverviewPanel";
import IntroductionPanel from "./components/IntroductionPanel";
import HotsPanel from "./components/HotsPanel";
import NewsPanel from "./components/NewsPanel";
import DiscoveryPanel from "./components/DiscoveryPanel";
import Header from "./components/Header";
import Footer from "./components/Footer";

const Content = styled.div`
  margin: 0 auto;
  width: 90%;
  max-width: 1200px;
`;

function App() {
  const theme = {
    header: "black",
    content: "#f9f9f9",
    font: "white",
  };
  return (
    <ThemeProvider theme={theme}>
      <Header />
      <Content>
        <OverviewPanel />
        <IntroductionPanel />
        {/* <HotsPanel /> */}
        <NewsPanel />
        <DiscoveryPanel />
      </Content>
      <Footer />
    </ThemeProvider>
  );
}

export default App;
