import React, { useEffect } from "react";
import styled from "styled-components";
import { connect } from "dva";
import WordCloud from "./WordCloud";
import { TreeSelect } from "antd";
const Title = styled.h3``;
const Row = styled.div`
  display: flex;
  align-items: flex-end;
`;
const Box = styled.div`
  outline: 1px solid black;
  height: 350px;
  width: 800px;
`;
const Container = styled.div`
  margin-right: 2em;
`;

const StyledTreeSelect = styled(TreeSelect)`
  width: 100px;
  margin-left: 1em;
  margin-bottom: 0.5em;
`;
function ShapeWordle({
  words,
  regionOptions,
  selectedRegion,
  setSelectedRegion,
  getWords
}) {
  useEffect(() => {
    getWords(selectedRegion);
  }, [getWords, selectedRegion]);

  return (
    <Container>
      <Row>
        <Title>新闻词云</Title>
        <StyledTreeSelect
          showSearch
          value={selectedRegion}
          treeData={regionOptions}
          dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
          treeDefaultExpandAll
          onChange={setSelectedRegion}
        />
      </Row>
      <Box>
        <WordCloud words={words} height={350} width={800} />
      </Box>
    </Container>
  );
}

export default connect(
  ({ global, news }) => ({
    words: news.words,
    regionOptions: global.regionOptions,
    selectedRegion: global.selectedRegion
  }),
  {
    setSelectedRegion: value => ({
      type: "global/setSelectedRegion",
      payload: { value }
    }),
    getWords: region => ({
      type: "news/getWords",
      payload: { region }
    })
  }
)(ShapeWordle);
