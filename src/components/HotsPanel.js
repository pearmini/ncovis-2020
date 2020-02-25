import React, { useEffect } from "react";
import styled from "styled-components";
import { connect } from "dva";
import * as d3 from "d3";
import { Radio, Row, Col } from "antd";

import Timeline from "./Timeline";
import Svg from "./Svg";

import clouds from "../utils/vis/clouds";
import bars from "../utils/vis/bars";

const { Group } = Radio;

const Container = styled.div``;

const RadioGroup = styled(Group)`
  margin-bottom: 0.5em;
`;

function computeBar({ data }, colorScale, minRange = 0, maxRange = 100) {
  data.forEach(item => (item.reading = parseInt(item.reading)));
  const domain = d3.extent(
    data.filter(item => item.reading !== 0),
    d => d.reading
  );
  const scale = d3
    .scaleLinear()
    .domain(domain)
    .range([minRange, maxRange]);
  return data.map((item, index) => ({
    ...item,
    index,
    words: item.words.map(word => ({ ...word, index })),
    width: scale(item.reading),
    color: colorScale(index)
  }));
}

function computeWords({ data }, colorScale) {
  return data.reduce((total, cur, index) => {
    const currentWords = cur.words.map(item => ({
      ...item,
      index,
      fill: colorScale(index)
    }));
    return [...total, ...currentWords];
  }, []);
}

function computeRange({ data }) {
  return d3.extent(data, item => item.time);
}

function computeData(hot, platform, time) {
  const defaultValue = {
    words: [],
    list: []
  };
  try {
    if (!hot) return defaultValue;
    const platformData = hot.find(item => item.platform === platform);
    const timeData = platformData.data.find((item, index) => {
      const startTime =
        index === 0 ? item.time - 1 : platformData.data[index - 1].time;
      const endTime = item.time;
      return startTime < time && time <= endTime;
    });

    const colorScale = d3.scaleOrdinal(d3.schemeTableau10);
    const words = timeData ? computeWords(timeData, colorScale) : [];
    const list = timeData ? computeBar(timeData, colorScale, 10, 150) : [];
    const range = computeRange(platformData);
    return {
      words,
      list,
      range
    };
  } catch (e) {
    console.error(e);
    return defaultValue;
  }
}

function VisPanel({
  selectedPlatform,
  setSelectedPlatform,
  selectedTime,
  getHotData,

  hot
}) {
  // 对数据进行计算：布局，颜色等

  const { words, range } = computeData(hot, selectedPlatform, selectedTime);
  const barsProps = {
    width: 600,
    height: 400
  };

  const cloudsProps = {
    width: 600,
    height: 400
  };
  useEffect(() => {
    getHotData();
  }, [getHotData]);
  return (
    <Container id="hots">
      <h1>人们在网络上都在讨论些啥？</h1>
      <p>这里是通过词云和条形图的方式对各大平台的热搜数据进行可视化。</p>
      <span>选择一个社交平台</span>&ensp;
      <RadioGroup
        value={selectedPlatform}
        onChange={e => setSelectedPlatform(e.target.value)}
      >
        <Radio value={"weibo"}>微博</Radio>
        <Radio value={"zhihu"}>知乎</Radio>
      </RadioGroup>
      <Row gutter={[16, 16]}>
        <Col span={24} md={12}>
          <Svg {...cloudsProps}>{clouds}</Svg>
        </Col>
        <Col span={24} md={12}>
          <Svg {...barsProps}>{bars}</Svg>
        </Col>
      </Row>
      <Timeline range={range} />
    </Container>
  );
}

export default connect(
  ({ global, hot }) => ({
    selectedPlatform: global.selectedPlatform,
    regionOptions: global.regionOptions,
    selectedTime: global.selectedTime,
    hot: hot,
    selectedRegion: global.selectedRegion
  }),
  {
    getHotData: () => ({ type: "hot/getData" }),
    setSelectedRegion: value => ({
      type: "global/setSelectedRegion",
      payload: { value }
    }),
    setSelectedPlatform: value => ({
      type: "global/setSelectedPlatform",
      payload: { value }
    })
  }
)(VisPanel);
