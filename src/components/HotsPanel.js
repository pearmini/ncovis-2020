import React, { useEffect, useRef, useState } from "react";
import useAnimation from "../hook/useAnimation";
import styled from "styled-components";
import { connect } from "dva";
import { Row, Col, Select } from "antd";

import Timeline from "./Timeline";
import BarRace from "../components/BarRace";
import StoryTelling from "../components/StoryTelling";
import Areachart from "../components/Areachart";
import mc from "../utils/memorizedColor";
import rc from "../utils/randomColor";
import * as d3 from "d3";

const { Option } = Select;

const Container = styled.div`
  position: relative;
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
  updateDataByTime,
  getWords,
  selectedWords,
  setSelectedWords,
  wordsByTime
}) {
  const levels = [
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
  const [running, setRunning] = useState(false); // 用户是否点击播放
  const [pause, setPause] = useState(false); // 是否应为 loading data 而暂停
  const [selectedLevel, setSelectedLevel] = useState("third");
  const [selectedType, setSelectedType] = useState("confirmed");
  const [selectedTopic, setSelectedTopic] = useState(null);
  const { requestAnimation, pauseAnimation, setFrame } = useAnimation(step);

  const barColor = useRef(
    mc([...d3.schemeTableau10, "#634294", "#d54087"], 10)
  );
  const wordColor = useRef(rc(d3.schemeCategory10));

  const selectedName = "zhihu";
  const namevalues = dataByName.get(selectedName);
  const { listKeyframes, cloudsKeyframes } = namevalues || {};

  const hotTimeRange = timeByName.get(selectedName);
  const totalTimeRange = d3.extent(
      Array.from(dataByDate).map(([date]) => new Date(date).getTime())
    ),
    ticks = d3.timeHour
      .every(12) // 每隔 12 小时获取一下数据
      .range(totalTimeRange[0], totalTimeRange[1])
      .map(d => d.getTime()),
    totalDuration = ticks.length * 4000; // 1小时 0.75秒

  const timeScale = d3
      .scaleLinear()
      .domain([0, totalDuration])
      .range(totalTimeRange || [0, 0]),
    duration = timeScale.invert(selectedTime);

  const barsProps = {
    width: 600,
    height: 400,
    keyframes: listKeyframes,
    selectedTime,
    color: barColor.current,
    running,
    loading: loadingHots,
    selectedName: "知乎",
    showWordsOfTopic,
    hideWordsOfTopic: () => setSelectedTopic(null),
    selectedTopic
  };

  const storyProps = {
    width: 600,
    height: 400,
    keyframes: cloudsKeyframes,
    selectedWords,
    selectedTopic,
    selectedTime,
    color: barColor.current(selectedTopic),
    colorScale: wordColor.current,
    loading: loadingHots,
    running: running || pause,
    selectedName: "知乎"
  };

  const timeProps = {
    selectedTime,
    running,
    toggleAnimation,
    changeValue,
    range: totalTimeRange || [0, 0],
    finish: duration >= totalDuration
  };

  const areaPros = {
    loading: loadingNews,
    dataByDate,
    selectedTime,
    setSelectedTime,
    selectedType,
    selectedLevel,
    focus,
    setFocus
  };

  if (running && loadingHots && !pause) {
    stopAnimation();
    setPause(true);
  }

  if (pause && !loadingHots && !running) {
    startAnimation();
    setPause(false);
  }

  function step(duration) {
    // 不能超过最大的时间
    const t = Math.min(timeScale(duration), totalTimeRange[1]);
    setSelectedTime(t);
    if (duration > totalDuration) {
      setRunning(false);
      return false;
    }
  }

  function startAnimation() {
    if (running) return;
    if (selectedTopic !== null) setSelectedTopic(null);
    setRunning(true);
    requestAnimation(duration >= totalDuration ? 0 : duration);
  }

  function stopAnimation() {
    if (!running) return;
    setRunning(false);
    setSelectedTime(selectedTime + 1); // 防止出现过渡效果
    pauseAnimation();
  }

  function toggleAnimation() {
    if (running) stopAnimation();
    else startAnimation();
  }

  function changeValue(value) {
    const validValue = Math.max(
      totalTimeRange[0],
      Math.min(value, totalTimeRange[1])
    );
    setFrame(timeScale.invert(validValue));
    setSelectedTime(validValue);
  }

  function showWordsOfTopic(title) {
    setSelectedTopic(title);
    stopAnimation();
    const bisect = d3.bisector(d => d.time);
    const i = bisect.left(hotTimeRange, selectedTime),
      time = hotTimeRange[i].time / 1000,
      words = wordsByTime.get(time);
    if (words) {
      const sw = words.find(d => d.title === title);
      const w = sw ? sw.keywords : [];
      setSelectedWords(w);
    } else getWords(selectedName, time, title);
  }

  useEffect(() => {
    // 获得时间范围
    if (!hotTimeRange) {
      getTime(selectedName);
      return;
    }

    // 请求数据
    const limit = 10;
    const bisectStart = d3.bisector(d => d.time);

    const index = bisectStart.left(hotTimeRange, selectedTime),
      tick = hotTimeRange[index],
      nextIndex = Math.min(hotTimeRange.length - 1, index + limit),
      nextTick = hotTimeRange[nextIndex];

    const lo = d3.bisectLeft(ticks, tick.time),
      hi = d3.bisectLeft(ticks, nextTick.time),
      subTicks = ticks.slice(lo, hi + 1); // 这需要 -1 让前后两个时刻有重复

    if (tick.request) return;

    getData({
      ticks: subTicks,
      name: selectedName,
      from: (tick.time / 1000) | 0,
      limit
    });

    const newHotTimeRange = hotTimeRange.map((d, i) => ({
      ...d,
      request: i >= index && i < nextIndex ? true : false
    }));
    updateDataByTime(selectedName, newHotTimeRange);
  }, [getData, getTime, selectedName, hotTimeRange, selectedTime]);

  return (
    <Container>
      <An id="hots" />
      <h1>人们在网络上都在讨论些啥？</h1>
      <p>这里是通过词云和条形图的方式对各大平台的热搜数据进行可视化。</p>
      <Row gutter={[16, 16]}>
        <Col span={24} md={12}>
          <BarRace {...barsProps} />
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
    setSelectedWords: words => ({
      type: "hots/setSelectedWords",
      payload: words
    }),
    getWords: (name, time, title) => ({
      type: "hots/getWords",
      payload: {
        name,
        time,
        title
      }
    }),
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
