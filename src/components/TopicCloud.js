import React from "react";
import styled from "styled-components";
import { connect } from "dva";
import { Radio } from "antd";
import WordCloud from "./WordCloud";

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

function TopicCloud({ words, selectedPlatform, setSelectedPlatform }) {
  const width = 800,
    height = 350;

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
        <WordCloud width={width} height={height} words={words} />
      </Box>
    </Container>
  );
}

export default connect(
  ({ hot, global }) => ({
    words: hot.words,
    selectedPlatform: global.selectedPlatform
  }),
  {
    setSelectedPlatform: value => ({
      type: "global/setSelectedPlatform",
      payload: { value }
    })
  }
)(TopicCloud);
