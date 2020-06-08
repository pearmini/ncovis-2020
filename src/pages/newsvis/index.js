import React, { useEffect } from "react";
import styled from "styled-components";
import { connect } from "dva";
import moment from "moment";
import { Row, Col, TreeSelect, DatePicker } from "antd";

import Shape from "./banner/Shape";
import Piechart from "./banner/Piechart";
import formatDate from "../../utils/formatDate";
import regions from "../../assets/data/region_options.json";

const Container = styled.div`
  position: relative;
  margin-bottom: 4em;
  padding: 0 10px;
`;

const Control = styled.div`
  display: flex;
  margin: 0.5em 0 1em 0;

  @media (max-width: 700px) {
    flex-direction: column;
  }
`;

function News({
  selectedTime,
  setSelectedTime,
  getNewsData,
  newsByRegion,
  selectedRegion,
  setSelectedRegion,
  loadingNews,
}) {
  const selectedDate = formatDate(new Date(selectedTime));
  const setSelectedDate = (date) => setSelectedTime(new Date(date).getTime());
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

  // function disabledDate(current) {
  //   if (range.length === 0) return true;
  //   return current < moment(range[0]) || current > moment(range[1]);
  // }
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
          <span>
            <b>日期</b>
          </span>
          &ensp;
          <DatePicker
            value={selectedDate === "" ? null : moment(selectedDate)}
            onChange={(date, string) => {
              setSelectedDate(string);
            }}
            // disabledDate={disabledDate}
            showTody={false}
          />
        </div>
      </Control>
      <Row gutter={[16, 16]}>
        <Col span={12} md={12}>
          <Piechart {...pieProps} />
        </Col>
        <Col span={12}>
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
