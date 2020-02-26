import React, { useEffect } from "react";
import moment from "moment";
import { connect } from "dva";
import { TreeSelect, DatePicker, Row, Col, Select } from "antd";
import styled from "styled-components";
import Svg from "./Svg";
import Canvas from "./Canvas";

import lines from "../utils/vis/lines";
import heat from "../utils/vis/heat";
import shape from "../utils/vis/shape";

const { Option } = Select;
const Container = styled.div`
  position: relative;
`;

const Control = styled.div`
  display: flex;
  margin-bottom: 0.5em;

  @media (max-width: 700px) {
    flex-direction: column;
  }
`;
const An = styled.div`
  position: absolute;
  top: -56px;
`;

function NewsPanel({
  selectedRegion,
  regionOptions,
  setSelectedRegion,
  setSelectedType,
  selectedDate,
  selectedType,
  setSelectedDate,
  data,
  getData,
  loading
}) {
  const regionvalues = data.get(selectedRegion);
  const datevalues = regionvalues && regionvalues.get(selectedDate);

  const shapeProps = {
    src: datevalues && datevalues.image,
    width: 600,
    height: 400
  };

  const linesProps = {
    width: 600,
    height: 200,
    data: regionvalues,
    margin: {
      top: 30,
      right: 30,
      bottom: 30,
      left: 50
    },
    setSelectedDate,
    selectedDate,
    type: selectedType,
    style: { marginBottom: 16 }
  };

  const heatProps = {
    type: selectedType,
    width: 600,
    height: 200,
    margin: {
      top: 30,
      right: 30,
      bottom: 30,
      left: 50
    },
    setSelectedDate,
    selectedDate,
    data: regionvalues
  };

  useEffect(() => {
    getData();
  }, [getData]);
  return (
    <Container>
      <An id="news" />
      <h1>全国各地都在报道些啥?</h1>
      <p>这里对全国各地新闻报道对内容和疫情相关的数据进行简单的可视化</p>
      {loading && "loading"}
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
              <DatePicker
                value={moment(selectedDate)}
                onChange={(date, string) => setSelectedDate(new Date(string))}
              />
            </div>
          </Control>
          <Canvas {...shapeProps}>{shape}</Canvas>
        </Col>
        <Col span={24} md={12}>
          <Control>
            <div>
              <span>种类</span>&ensp;
              <Select
                value={selectedType}
                onChange={value => setSelectedType(value)}
              >
                <Option key="confirm">确诊</Option>
                <Option key="cue">治愈</Option>
                <Option key="suspect">疑似</Option>
                <Option key="dead">死亡</Option>
              </Select>
            </div>
          </Control>
          <Row>
            <Svg {...linesProps}>{lines}</Svg>
            <Svg {...heatProps}>{heat}</Svg>
          </Row>
        </Col>
      </Row>
    </Container>
  );
}
export default connect(
  ({ global, news, loading }) => ({
    regionOptions: global.regionOptions,
    selectedRegion: global.selectedRegion,
    selectedDate: global.selectedDate,
    selectedType: global.selectedType,
    data: news,
    loading: loading.models.news
  }),
  {
    setSelectedRegion: value => ({
      type: "global/setSelectedRegion",
      payload: { value }
    }),
    setSelectedType: type => ({
      type: "global/setSelectedType",
      payload: { type }
    }),
    setSelectedDate: date => ({
      type: "global/setSelectedDate",
      payload: { date }
    }),
    getData: () => ({ type: "news/getData" })
  }
)(NewsPanel);
