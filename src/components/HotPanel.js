import React, { useEffect } from "react";
import styled from "styled-components";
import { connect } from "dva";
import * as d3 from "d3";

import TopicCloud from "./TopicCloud";
import Hot from "./Hot";

const Row = styled.section`
  display: flex;
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

function computeData(hot, platform, time) {
  const defaultValue = {
    words: [],
    list: []
  };
  try {
    if (!hot) return defaultValue;
    const platformData = hot.data.find(item => item.platform === platform);
    const timeData = platformData.data.find(item => item.time === time);
    const colorScale = d3.scaleOrdinal(d3.schemeTableau10);
    const words = computeWords(timeData, colorScale);
    const list = computeBar(timeData, colorScale, 10, 150);
    return {
      words,
      list
    };
  } catch (e) {
    console.error(e);
    return defaultValue;
  }
}

function HotPanel({ selectedPlatform, selectedTime, getHotData, hot }) {
  // 对数据进行计算：布局，颜色等
  const { words, list } = computeData(hot, selectedPlatform, selectedTime);
  useEffect(() => {
    getHotData();
  }, [getHotData]);
  return (
    <Row>
      <TopicCloud words={words} />
      <Hot list={list} />
    </Row>
  );
}

export default connect(
  ({ global, hot }) => ({
    selectedPlatform: global.selectedPlatform,
    selectedTime: global.selectedTime,
    hot: hot
  }),
  {
    getHotData: () => ({ type: "hot/getData" })
  }
)(HotPanel);
