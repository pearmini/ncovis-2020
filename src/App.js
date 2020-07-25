import React from "react";
import styled, { ThemeProvider } from "styled-components";

import Header from "./components/Header";
import Footer from "./components/Footer";

import Overview from "./pages/overview";
import Introduction from "./pages/introduction";
import Comment from "./pages/comment";
import Vis from "./pages/vis";


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
        <Overview />
        <Introduction />
        <Vis />
        <Comment />
      </Content>
      <Footer />
    </ThemeProvider>
  );
}

export default App;
