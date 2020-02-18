import React from "react";
import styled from "styled-components";
import { connect } from "dva";
import WordCloud from "./WordCloud";
import indexOf from "../utils/indexOf";

const Container = styled.div`
  margin-right: 2em;
`;
const Title = styled.h3`
  display: inline-block;
`;

function TopicCloud({ words = [], selectedWords, toggleWords }) {
  const width = 800,
    height = 360;

  if (selectedWords.length === 0) {
    words.forEach(item => (item.disabled = false));
  } else {
    words.forEach(word => {
      const index = indexOf(
        selectedWords,
        word,
        (a, b) => a.index === b.index && a.text === b.text
      );
      word.disabled = index === -1 ? true : false;
    });
  }
  return (
    <Container>
      <Title>热搜词云</Title>
      <WordCloud
        width={width}
        height={height}
        words={words}
        onClick={toggleWords}
      />
    </Container>
  );
}

export default connect(
  ({ global }) => ({
    selectedPlatform: global.selectedPlatform,
    selectedWords: global.selectedWords
  }),
  {
    toggleWords: item => ({
      type: "global/toggleWords",
      payload: { item }
    })
  }
)(TopicCloud);
