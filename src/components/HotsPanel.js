import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { connect } from "dva";
import { Radio, Row, Col } from "antd";

import Timeline from "./Timeline";
import Svg from "./Svg";

import clouds from "../utils/vis/clouds";
import bars from "../utils/vis/bars";
import * as d3 from "d3";

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

function HotsPanel({
  dataByName,
  range,
  selectedTime,
  setSelectedTime,
  getData
}) {
  const timeAt = d3
    .scaleLinear()
    .domain([0, 10000])
    .range(range || [0, 0]);
  const names = [
    { name: "微博", value: "weibo" },
    { name: "知乎", value: "zhihu" }
  ];

  const [running, setRunning] = useState(false);
  const [selectedName, setSelectedName] = useState(names[0].value);

  const transition = useRef(new Map());
  const colors = useRef(d3.schemeTableau10.map(d => [d, undefined]));

  const data = dataByName.get(selectedName);
  const { getWordsByTime, getListByTime } = data || {};

  const barsProps = {
    width: 600,
    height: 400,
    list: getListByTime && getListByTime(selectedTime),
    currentTime: timeAt.invert(selectedTime),
    colors: colors.current,
    transition: transition.current,
    running,
    margin: {
      left: 20,
      right: 30,
      top: 30,
      bottom: 30
    }
  };

  const cloudsProps = {
    width: 600,
    height: 400,
    colors: colors.current,
    words: getWordsByTime && getWordsByTime(selectedTime)
  };

  const timeProps = {
    time: timeAt,
    selectedTime,
    running,
    setRunning,
    setSelectedTime,
    transition: transition.current
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
          <Svg {...cloudsProps}>{clouds}</Svg>
        </Col>
        <Col span={24} md={12}>
          <Svg {...barsProps}>{bars}</Svg>
        </Col>
      </Row>
      <Timeline {...timeProps} />
    </Container>
  );
}

export default connect(({ hots }) => ({ ...hots }), {
  getData: () => ({ type: "hots/getData" }),
  setSelectedName: name => ({
    type: "hots/setSelectedName",
    payload: name
  }),
  setSelectedTime: time => ({
    type: "hots/setSelectedTime",
    payload: time
  })
})(HotsPanel);
