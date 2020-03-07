import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { connect } from "dva";
import { Radio, Row, Col, Select } from "antd";

import Timeline from "./Timeline";
import BarRace from "../components/BarRace";
import StoryTelling from "../components/StoryTelling";
import Areachart from "../components/Areachart";
import mc from "../utils/memorizedColor";
import * as d3 from "d3";

const { Option } = Select;
const { Group } = Radio;

const Container = styled.div`
  position: relative;
`;

const RadioGroup = styled(Group)`
  margin-bottom: 0.5em;
`;

const An = styled.div`
  position: absolute;
  top: -56px;
`;

const Control = styled.div`
  display: flex;
  margin-bottom: 0.5em;

  @media (max-width: 700px) {
    flex-direction: column;
  }
`;

function HotsPanel({
  dataByName,
  dataByDate,
  range,
  selectedTime,
  setSelectedTime,
  getData,
  loading
}) {
  const names = [
      { name: "微博", value: "weibo" },
      { name: "知乎", value: "zhihu" }
    ],
    levels = [
      { name: "全国", key: "top" },
      { name: "分区", key: "second" },
      { name: "省份", key: "third" }
    ],
    types = [
      { name: "确诊", key: "confirmed" },
      { name: "治愈", key: "cured" },
      { name: "死亡", key: "dead" }
    ];

  const [running, setRunning] = useState(false);
  const [selectedName, setSelectedName] = useState(names[0].value);
  const [selectedLevel, setSelectedLevel] = useState("third");
  const [selectedType, setSelectedType] = useState("confirmed");
  const color = useRef(mc(d3.schemeSet3, 10));
  const namevalues = dataByName.get(selectedName);
  const { listKeyframes, wordsKeyframes } = namevalues || {};
  const timeAt = d3
    .scaleLinear()
    .domain([0, 30000])
    .range(range || [0, 0]);

  const barsProps = {
    width: 600,
    height: 400,
    keyframes: listKeyframes,
    selectedTime,
    color: color.current,
    running,
    loading
  };

  const storyProps = {
    width: 600,
    height: 400,
    keyframes: wordsKeyframes,
    selectedTime,
    color: color.current,
    loading,
    running
  };

  const timeProps = {
    time: timeAt,
    selectedTime,
    running,
    setRunning,
    setSelectedTime
  };

  const areaPros = {
    loading,
    dataByDate,
    selectedTime,
    setSelectedTime,
    selectedType,
    selectedLevel,
    range
  };

  useEffect(() => {
    getData();
  }, [getData]);

  return (
    <Container>
      <An id="hots" />
      <h1>人们在网络上都在讨论些啥？</h1>
      <p>这里是通过词云和条形图的方式对各大平台的热搜数据进行可视化。</p>
      <span>选择一个社交平台</span>&ensp;
      <RadioGroup
        value={selectedName}
        onChange={e => setSelectedName(e.target.value)}
      >
        {names.map(d => (
          <Radio key={d.value} value={d.value}>
            {d.name}
          </Radio>
        ))}
      </RadioGroup>
      <Row gutter={[16, 16]}>
        <Col span={24} md={12}>
          <StoryTelling {...storyProps} />
        </Col>
        <Col span={24} md={12}>
          <BarRace {...barsProps} />
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Control>
            <div>
              <span>级别</span>&ensp;
              <Select
                value={selectedLevel}
                onChange={value => setSelectedLevel(value)}
              >
                {levels.map(d => (
                  <Option key={d.key}>{d.name}</Option>
                ))}
              </Select>
              &ensp;&ensp;
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
          <Areachart {...areaPros} />
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Timeline {...timeProps} />
        </Col>
      </Row>
    </Container>
  );
}

export default connect(
  ({ hots, loading, news }) => ({
    ...hots,
    loading: loading.models.hots || loading.models.news,
    dataByDate: news.dataByDate
  }),
  {
    getData: () => ({ type: "hots/getData" }),
    setSelectedName: name => ({
      type: "hots/setSelectedName",
      payload: name
    }),
    setSelectedTime: time => ({
      type: "hots/setSelectedTime",
      payload: time
    })
  }
)(HotsPanel);
