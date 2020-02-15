import React from "react";
import styled from "styled-components";
import { connect } from "dva";
import WordCloud from "./WordCloud";
import Select from "./Select";
const Title = styled.h3``;
const Row = styled.div`
  display: flex;
  align-items: flex-end;
`;
const Box = styled.div`
  border: 1px solid black;
  height: 350px;
  width: 800px;
`;
const Container = styled.div`
  margin-right: 2em;
`;
function ShapeWordle({ words }) {
  return (
    <Container>
      <Row>
        <Title>新闻词云</Title>
        <Select type="region" label="选择关心的区域" />
      </Row>
      <Box>
        <WordCloud words={words} height={350} width={800} />
      </Box>
    </Container>
  );
}

export default connect(({ hot }) => ({
  words: hot.words
}))(ShapeWordle);
