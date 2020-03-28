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
  getData,
  loadingHots,
  loadingNews,
  timeByName,
  getTime,
  selectedTime,
  setSelectedTime,
  updateDataByTime
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

  const [focus, setFocus] = useState("");
  const [running, setRunning] = useState(false);
  const [selectedName, setSelectedName] = useState(names[1].value);
  const [selectedLevel, setSelectedLevel] = useState("third");
  const [selectedType, setSelectedType] = useState("confirmed");

  const color = useRef(mc(d3.schemeSet3, 10));
  const namevalues = dataByName.get(selectedName);
  const { listKeyframes, cloudsKeyframes } = namevalues || {};

  // 获得热搜数据和条形图时间的交集
  const hotTimeRange = timeByName.get(selectedName);
  const totalTimeRange = d3.extent(
      Array.from(dataByDate).map(([date]) => new Date(date).getTime())
    ),
    ticks = d3.timeHour
      .every(12) // 每隔 12 小时展现一次
      .range(totalTimeRange[0], totalTimeRange[1])
      .map(d => d.getTime()),
    totalDuration = ticks.length * 1500; // 1小时 0.75秒

  const timeScale = d3
    .scaleLinear()
    .domain([0, totalDuration])
    .range(totalTimeRange || [0, 0]);

  const barsProps = {
    width: 600,
    height: 400,
    keyframes: listKeyframes,
    selectedTime,
    color: color.current,
    running,
    loading: loadingHots
  };

  const storyProps = {
    width: 600,
    height: 400,
    keyframes: cloudsKeyframes,
    selectedTime,
    color: color.current,
    loading: loadingHots,
    running
  };

  const timeProps = {
    time: timeScale,
    selectedTime,
    running,
    setRunning,
    setSelectedTime
  };

  const areaPros = {
    loading: loadingNews,
    dataByDate,
    selectedTime,
    setSelectedTime,
    selectedType,
    selectedLevel,
    focus,
    setFocus,
    running
  };

  useEffect(() => {
    // 获得时间范围
    if (!hotTimeRange) {
      getTime(selectedName);
      return;
    }

    // 请求数据
    const limit = 10,
      forward = 3;
    const bisect = d3.bisector(d => d.time);
    const index = bisect.right(hotTimeRange, selectedTime),
      tick = hotTimeRange[index],
      nextIndex = Math.min(hotTimeRange.length - 1, index + limit),
      nextTick = hotTimeRange[nextIndex];

    const lo = d3.bisectLeft(ticks, tick.time),
      hi = d3.bisectLeft(ticks, nextTick.time);
    const f = ticks.slice(lo, hi);
    
    // 如果离的很近了还是要请求
    if (tick.request) return;
    console.log("request", index);
    console.log(lo, hi, f, index, nextIndex);

    getData({
      ticks: f,
      name: selectedName,
      from: (tick.time / 1000) | 0,
      limit
    });
    for (let i = index; i < hotTimeRange.length && i < index + limit; i++)
      hotTimeRange[i].request = true;
    updateDataByTime(selectedName, hotTimeRange);
  }, [getData, getTime, selectedName, hotTimeRange, selectedTime]);

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
          {/* <BarRace {...barsProps} /> */}
        </Col>
        <Col span={24} md={12}>
          <StoryTelling {...storyProps} />
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Control>
            <div>
              <span>级别</span>&ensp;
              <Select
                value={selectedLevel}
                onChange={value => {
                  setSelectedLevel(value);
                  setFocus("");
                }}
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
    loadingHots: loading.models.hots,
    loadingNews: loading.models.news,
    dataByDate: news.dataByDate
  }),
  {
    getData: options => ({
      type: "hots/getData",
      payload: options
    }),
    setSelectedName: name => ({
      type: "hots/setSelectedName",
      payload: name
    }),
    setSelectedTime: time => ({
      type: "hots/setSelectedTime",
      payload: time
    }),
    getTime: name => ({ type: "hots/getTime", payload: { name } }),
    updateDataByTime: (name, range) => ({
      type: "hots/updateDataByTime",
      payload: { name, range }
    })
  }
)(HotsPanel);
