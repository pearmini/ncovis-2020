import React, { useEffect, useState } from "react";
import moment from "moment";
import { connect } from "dva";
import { TreeSelect, DatePicker, Row, Col, Select } from "antd";
import styled from "styled-components";
import Svg from "./Svg";
import Canvas from "./Canvas";
import regions from "../assets/data/region_options.json";

import Linechart from "./Linechart";
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
  selectedTime,
  setSelectedTime,
  dataByRegion,
  getData,
  loading
}) {
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedType, setSelectedType] = useState("confirm");
  const types = [
    { name: "确诊", key: "confirm" },
    { name: "治愈", key: "cue" },
    { name: "疑似", key: "suspect" },
    { name: "死亡", key: "dead" }
  ];
  const regionvalues = dataByRegion.get(selectedRegion);
  const datevalues = regionvalues && regionvalues.get(selectedTime);

  const shapeProps = {
    src: datevalues && datevalues.image,
    width: 600,
    height: 400
  };

  const linesProps = {
    width: 600,
    height: 200,
    data: regionvalues
      ? Object.assign(
          Array.from(regionvalues)
            .map(([date, data]) => ({
              date: new Date(date),
              value: data[selectedType]
            }))
            .filter(d => !isNaN(d.value)),
          { y: "人数" }
        )
      : [],
    loading,
    margin: {
      top: 30,
      right: 30,
      bottom: 30,
      left: 50
    },
    color: {
      dead: "black",
      confirm: "red",
      cue: "green",
      suspect: "orange"
    }[selectedType],
    setSelectedDate: setSelectedTime,
    selectedDate: selectedTime,
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
    setSelectedDate: setSelectedTime,
    selectedDate: selectedTime,
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
                value={moment(selectedTime)}
                onChange={(date, string) =>
                  setSelectedTime(new Date(string).getTime())
                }
              />
            </div>
          </Control>
          {/* <Canvas {...shapeProps}>{shape}</Canvas> */}
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
          <Row>
            <Linechart {...linesProps} />
            {/* <Svg {...linesProps}>{lines}</Svg> */}
            {/* <Svg {...heatProps}>{heat}</Svg> */}
          </Row>
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
    setSelectedTime: time => ({
      type: "news/setSelectedTime",
      payload: time
    }),
    getData: () => ({ type: "news/getData" })
  }
)(NewsPanel);
