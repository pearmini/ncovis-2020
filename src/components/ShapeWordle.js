import React from "react";
import styled from "styled-components";
import { connect } from "dva";

import WordCloud from "./WordCloud";

const Title = styled.h3``;
const Container = styled.div`
  margin-right: 2em;
`;

function ShapeWordle({ words }) {
  const width = 800,
    height = 360;

  return (
    <Container>
      <Title>新闻词云</Title>
      <WordCloud words={words} width={width} height={height} />
    </Container>
  );
}

export default connect(({ news }) => ({
  words: news.words
}))(ShapeWordle);
