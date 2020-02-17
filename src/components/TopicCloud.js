import React from "react";
import styled from "styled-components";
import { connect } from "dva";
import { Radio } from "antd";
import WordCloud from "./WordCloud";
import indexOf from "../utils/indexOf";

const { Group } = Radio;
const Container = styled.div`
  margin-right: 2em;
`;
const Title = styled.h3`
  display: inline-block;
`;
const Box = styled.div`
  outline: 1px solid black;
  width: ${props => props.width}px;
  height: ${props => props.height}px;
`;

const Row = styled.div`
  display: flex;
  align-items: flex-end;
`;

const RadioGroup = styled(Group)`
  margin-left: 2em;
  margin-bottom: 0.5em;
`;

function TopicCloud({
  words = [],
  selectedPlatform,
  setSelectedPlatform,
  selectedWords,
  toggleWords
}) {
  const width = 800,
    height = 350;

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
      <Row>
        <Title>热搜词云</Title>
        <RadioGroup
          value={selectedPlatform}
          onChange={e => setSelectedPlatform(e.target.value)}
        >
          <Radio value={"weibo"}>微博</Radio>
          <Radio value={"zhihu"}>知乎</Radio>
        </RadioGroup>
      </Row>
      <Box width={width} height={height}>
        <WordCloud
          width={width}
          height={height}
          words={words}
          onClick={toggleWords}
        />
      </Box>
    </Container>
  );
}

export default connect(
  ({ global }) => ({
    selectedPlatform: global.selectedPlatform,
    selectedWords: global.selectedWords
  }),
  {
    setSelectedPlatform: value => ({
      type: "global/setSelectedPlatform",
      payload: { value }
    }),
    toggleWords: item => ({
      type: "global/toggleWords",
      payload: { item }
    })
  }
)(TopicCloud);
