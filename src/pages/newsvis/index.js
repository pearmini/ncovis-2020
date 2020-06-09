import React, { useEffect } from "react";
import styled from "styled-components";
import { connect } from "dva";
import { Row, Col, Select } from "antd";

import Shape from "./banner/Shape";
import Piechart from "./banner/Piechart";
import regionTree from "../../assets/data/region_options.json";
import { filter } from "../../utils/tree";

const { Option } = Select;

const Container = styled.div`
  position: relative;
  margin-bottom: 4em;
  padding: 0 10px;
`;

const Control = styled.div`
  display: flex;
  margin: 0.5em 0 1em 0;
`;

function News({
  getNewsData,
  newsByRegion,
  selectedRegion: defaultRegion,
  setSelectedRegion,
  loadingNews,
  selectedDate,
}) {
  const regionList = filter(regionTree, (d) => d.depth === 2).map(
    (d) => d.title
  );
  const regionSet = new Set(regionList);
  const selectedRegion = regionSet.has(defaultRegion) ? defaultRegion : "湖北";
  const newsByDate = newsByRegion.get(selectedRegion);
  const news = newsByDate && newsByDate.get(selectedDate);
  const { words, tags } = news || {};

  const shapeProps = {
    data: words,
    loading: loadingNews,
    selectedDate,
    selectedRegion,
  };

  const pieProps = {
    loading: loadingNews,
    data: tags,
    selectedDate,
    selectedRegion,
  };

  useEffect(() => {
    // 如果有日期数据且 news 数据为空的话就请求
    if (
      news === undefined &&
      selectedDate !== "" &&
      selectedRegion !== "中国"
    ) {
      getNewsData(selectedRegion, `${selectedDate}`);
    }
  }, [getNewsData, selectedDate, selectedRegion, news]);

  return (
    <Container>
      <Control>
        <div>
          <span>
            <b>地区</b>
          </span>
          &ensp;
          <Select
            style={{ width: 120 }}
            onChange={setSelectedRegion}
            value={selectedRegion}
          >
            {regionList.map((d) => (
              <Option key={d} value={d}>
                {d}
              </Option>
            ))}
          </Select>
        </div>
      </Control>
      <Row gutter={[16, 16]}>
        <Col md={6} span={24}>
          <Piechart {...pieProps} />
        </Col>
        <Col md={18} span={24}>
          <Shape {...shapeProps} />
        </Col>
      </Row>
    </Container>
  );
}

export default connect(
  ({ loading, news }) => ({
    ...news,
    loadingNews: loading.models.news,
  }),
  {
    getNewsData: (region, date) => ({
      type: "news/getNewsData",
      payload: { region, date },
    }),
  }
)(News);
