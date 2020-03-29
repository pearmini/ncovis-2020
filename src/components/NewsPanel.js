import React, { useEffect, useState } from "react";
import moment from "moment";
import { connect } from "dva";
import { TreeSelect, DatePicker, Row, Col, Select } from "antd";
import styled from "styled-components";
import regions from "../assets/data/region_options.json";

import Shape from "./Shape";
import Piechart from "./Piechart";
import DateMap from "./DateMap";

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
  newsByRegion,
  getNewsData,
  getData,
  loading,
  range
}) {
  const [selectedRegion, setSelectedRegion] = useState("湖北");
  const [selectedType, setSelectedType] = useState("confirmed");
  const types = [
    { name: "确诊", key: "confirmed" },
    { name: "治愈", key: "cured" },
    { name: "死亡", key: "dead" }
  ];
  const newsByDate = newsByRegion.get(selectedRegion);
  const news = newsByDate && newsByDate.get(selectedDate);
  const { words, tags } = news || {};
  const shapeProps = {
    data: words,
    loading,
    selectedDate,
    selectedRegion
  };

  const pieProps = {
    loading,
    data: tags,
    selectedDate,
    selectedRegion
  };

  const treeProps = {
    regions,
    range,
    selectedRegion,
    selectedDate,
    setSelectedDate,
    setSelectedRegion,
    selectedType,
    loading,
    dataByRegion
  };

  function disabledDate(current) {
    if (range.length === 0) return true;
    return current < moment(range[0]) || current > moment(range[1]);
  }

  useEffect(() => {
    // 请求所有的数据
    if (!dataByRegion.size) {
      console.log("request data...");
      getData();
    }
    // 如果有日期数据且 news 数据为空的话就请求
    if (news === undefined && selectedDate !== "") {
      console.log(`request data:${selectedRegion}, ${selectedDate}`);
      getNewsData(selectedRegion, `${selectedDate}`);
    }
  }, [getData, selectedDate, selectedRegion, getNewsData]);
  return (
    <Container>
      <An id="news" />
      <h1>全国各地都在报道些啥?</h1>
      <p>这里对全国各地新闻报道对内容和疫情相关的数据进行简单的可视化</p>
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
            value={selectedDate === "" ? null : moment(selectedDate)}
            onChange={(date, string) => {
              setSelectedDate(string);
            }}
            disabledDate={disabledDate}
            showTody={false}
          />
        </div>
        &emsp;
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
      <Row>
        <Col span={24}>
          <DateMap {...treeProps} />
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col span={24} md={12}>
          <Shape {...shapeProps} />
        </Col>
        <Col span={24} md={12}>
          <Piechart {...pieProps} />
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
    getNewsData: (region, date) => ({
      type: "news/getNewsData",
      payload: { region, date }
    }),
    getData: () => ({ type: "news/getData" })
  }
)(NewsPanel);
