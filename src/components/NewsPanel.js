import React, { useEffect } from "react";
import styled from "styled-components";
import { TreeSelect, Row, Col } from "antd";
import { connect } from "dva";

import LineChart from "./LineChart";
import ShapeWordle from "./ShapeWordle";
import Heatmap from "./Heatmap";
import Svg from "./Svg";

const Container = styled.div``;

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
    <Container>
      <h1>各个地区都在发生啥？</h1>
      <span>这里对各个地区对新闻数据和疫情数据进行了可视化。</span>
      <StyledTreeSelect
        showSearch
        value={selectedRegion}
        treeData={regionOptions}
        dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
        treeDefaultExpandAll
        onChange={setSelectedRegion}
      />
      <br />
      <br />
      <Row gutter={[16, 16]}>
        <Col md={12} span={24}>
          <h2>新闻数据可视化</h2>
          <p>这里是对各个地区对新闻的可视化。</p>
          <Svg viewBox={[0, 0, 600, 420]}></Svg>
        </Col>
        <Col md={12} span={24}>
          <h2>疫情数据可视化</h2>
          <p>这是对各个地区对疫情数据对可视化。</p>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Svg viewBox={[0, 0, 600, 200]}></Svg>
            </Col>
            <Col span={24}>
              <Svg viewBox={[0, 0, 600, 200]}></Svg>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
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
