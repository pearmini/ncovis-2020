import React from "react";
import { connect } from "dva";
import { TreeSelect, DatePicker, Row, Col, Select } from "antd";
import styled from "styled-components";
import Svg from "./Svg";

const { Option } = Select;
const Container = styled.div``;

const Control = styled.div`
  display: flex;
  margin-bottom: 0.5em;

  @media (max-width: 700px) {
    flex-direction: column;
  }
`;

function NewsPanel({ selectedRegion, regionOptions, setSelectedRegion }) {
  return (
    <Container id="news">
      <h1>全国各地都在报道些啥?</h1>
      <p>这里对全国各地新闻报道对内容和疫情相关的数据进行简单的可视化</p>

      <Row gutter={[16, 16]}>
        <Col span={24} md={12}>
          <Control>
            <div>
              <span>区域</span>&ensp;
              <TreeSelect
                showSearch
                value={selectedRegion}
                treeData={regionOptions}
                dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
                treeDefaultExpandAll
                onChange={setSelectedRegion}
              />
            </div>
            &emsp;
            <div>
              <span>日期</span>&ensp;
              <DatePicker />
            </div>
          </Control>
          <Svg viewBox={[0, 0, 600, 420]}></Svg>
        </Col>
        <Col span={24} md={12}>
          <Control>
            <div>
              <span>种类</span>&ensp;
              <Select defaultValue="confirm">
                <Option key="confirm">确诊</Option>
                <Option key="cue">治愈</Option>
                <Option key="suspet">疑似</Option>
                <Option key="dead">死亡</Option>
              </Select>
            </div>
          </Control>
          <Row>
            <Svg viewBox={[0, 0, 600, 200]} style={{ marginBottom: 16 }}></Svg>
            <Svg viewBox={[0, 0, 600, 200]}></Svg>
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
    setSelectedRegion: value => ({
      type: "global/setSelectedRegion",
      payload: { value }
    })
  }
)(NewsPanel);
