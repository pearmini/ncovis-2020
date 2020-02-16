import React, { useEffect } from "react";
import TopicCloud from "./TopicCloud";
import Hot from "./Hot";
import styled from "styled-components";
import { connect } from "dva";

const Row = styled.section`
  display: flex;
`;
function HotPanel({ selectedPlatform, getHotData }) {
  useEffect(() => {
    getHotData(selectedPlatform);
  }, [selectedPlatform, getHotData]);
  return (
    <Row>
      <TopicCloud />
      <Hot />
    </Row>
  );
}

export default connect(
  ({ global }) => ({
    selectedPlatform: global.selectedPlatform
  }),
  {
    getHotData: key => ({ type: "hot/getData", payload: { key } })
  }
)(HotPanel);
