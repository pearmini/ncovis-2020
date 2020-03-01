import React, { useEffect, useState } from "react";
import moment from "moment";
import { connect } from "dva";
import { TreeSelect, DatePicker, Row, Col, Select } from "antd";
import styled from "styled-components";
import regions from "../assets/data/region_options.json";

import Linechart from "./Linechart";
import Shape from "./Shape";
import TreeMatrix from "./TreeMatrix";
import HeatMap from "./HeatMap";

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
  selectedDate,
  setSelectedDate,
  dataByRegion,
  getData,
  loading,
  range
}) {
  const [selectedRegion, setSelectedRegion] = useState("全国");
  const [selectedType, setSelectedType] = useState("confirm");
  const [loadingImage, setLoadingImage] = useState(false);
  const types = [
    { name: "确诊", key: "confirm" },
    { name: "治愈", key: "cue" },
    { name: "疑似", key: "suspect" },
    { name: "死亡", key: "dead" }
  ];
  const dataByDate = dataByRegion.get(selectedRegion);
  const data = dataByDate && dataByDate.get(selectedDate);

  const shapeProps = {
    data,
    loading,
    loadingImage,
    setLoadingImage
  };

  const linesProps = {
    dataByDate,
    loading,
    setSelectedDate,
    selectedDate,
    selectedType,
    style: {
      marginBottom: 16
    }
  };

  const heatProps = {
    selectedType,
    setSelectedDate,
    selectedDate,
    dataByDate,
    loading
  };

  function disabledDate(current) {
    if (range.length === 0) return true;
    return current < moment(range[0]) || current > moment(range[1]);
  }

  useEffect(() => {
    getData();
  }, [getData]);
  return (
    <Container>
      <An id="news" />
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
                treeData={regions}
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
                onChange={(date, string) =>
                  setSelectedDate(new Date(string).getTime())
                }
                disabledDate={disabledDate}
                showTody={false}
              />
            </div>
          </Control>
          <Shape {...shapeProps} />
        </Col>
        <Col span={24} md={12}>
          <Control>
            <div>
              <span>种类</span>&ensp;
              <Select
                value={selectedType}
                onChange={value => setSelectedType(value)}
              >
                {types.map(d => (
                  <Option key={d.key}>{d.name}</Option>
                ))}
              </Select>
            </div>
          </Control>
          <TreeMatrix />
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Linechart {...linesProps} />
        </Col>
      </Row>
    </Container>
  );
}
export default connect(
  ({ news, loading }) => ({
    ...news,
    loading: loading.models.news
  }),
  {
    setSelectedDate: time => ({
      type: "news/setSelectedDate",
      payload: time
    }),
    getData: () => ({ type: "news/getData" })
  }
)(NewsPanel);
