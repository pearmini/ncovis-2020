import React, { useEffect } from "react";
import styled from "styled-components";
import { TreeSelect } from "antd";
import { connect } from "dva";

import LineChart from "./LineChart";
import ShapeWordle from "./ShapeWordle";
import Heatmap from "./Heatmap";

const Row = styled.div`
  display: flex;
  padding-bottom: 1em;
`;

const Col = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledTreeSelect = styled(TreeSelect)`
  width: 100px;
`;

function NewsPanel({
  getWords,
  selectedRegion,
  regionOptions,
  setSelectedRegion
}) {
  useEffect(() => {
    getWords(selectedRegion);
  }, [getWords, selectedRegion]);
  return (
    <div>
      <StyledTreeSelect
        showSearch
        value={selectedRegion}
        treeData={regionOptions}
        dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
        treeDefaultExpandAll
        onChange={setSelectedRegion}
      />
      <Row>
        <ShapeWordle />
        <Col>
          <Heatmap />
          <LineChart />
        </Col>
      </Row>
    </div>
  );
}

export default connect(
  ({ global }) => ({
    regionOptions: global.regionOptions,
    selectedRegion: global.selectedRegion
  }),
  {
    getWords: region => ({
      type: "news/getWords",
      payload: { region }
    }),
    setSelectedRegion: value => ({
      type: "global/setSelectedRegion",
      payload: { value }
    })
  }
)(NewsPanel);
