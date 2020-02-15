import React from "react";
import Select from "./Select";
import styled from "styled-components";
import { connect } from "dva";
import WordCloud from "./WordCloud";

const Container = styled.div`
  margin-right: 2em;
`;
const Title = styled.h3`
  display: inline-block;
`;
const Box = styled.div`
  border: 1px solid black;
  width: ${props => props.width}px;
  height: ${props => props.height}px;
`;

const Row = styled.div`
  display: flex;
  align-items: flex-end;
`;

function TopicCloud({ words }) {
  const width = 800,
    height = 350;

  return (
    <Container>
      <Row>
        <Title>热搜词云</Title>
        <Select type="platform" />
      </Row>
      <Box width={width} height={height}>
        <WordCloud width={width} height={height} words={words} />
      </Box>
    </Container>
  );
}

export default connect(({ hot }) => ({
  words: hot.words
}))(TopicCloud);
