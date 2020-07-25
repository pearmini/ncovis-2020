import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { connect } from "dva";
import { Row, Col, message } from "antd";

import Timeline from "./banner/Timeline";
import BarRace from "./banner/BarRace";
import StoryTelling from "./banner/StoryTelling";
import mc from "../../utils/memorizedColor";
import rc from "../../utils/randomColor";
import * as d3 from "d3";

message.config({
  maxCount: 1,
});

const Container = styled.div`
  position: relative;
  padding: 0 10px;
`;

function Hot({
  dataByName,
  getData,
  loadingHots,
  loadingCommon,
  timeByName,
  getTime,
  selectedTime,
  setSelectedTime,
  updateDataByTime,
  getWords,
  selectedWords,
  setSelectedWords,
  wordsByTime,
  totalTimeRange,
  computingLayout,
  running,
  setRunning,
  requestAnimation,
  setFrame,
  timeScale,
  duration,
  interpolateInterval,
  totalDuration,
  stopAnimation,
}) {
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [pause, setPause] = useState(false); // 是否应为 loading data 而暂停
  const barColor = useRef(
    mc([...d3.schemeTableau10, "#634294", "#d54087"], 10)
  );
  const wordColor = useRef(rc(d3.schemeTableau10));

  const selectedName = "zhihu";
  const namevalues = dataByName.get(selectedName);
  const { listKeyframes, cloudsKeyframes } = namevalues || {};

  const hotTimeRange = timeByName.get(selectedName);

  const barsProps = {
    width: 600,
    height: 400,
    keyframes: listKeyframes,
    selectedTime,
    color: barColor.current,
    running,
    loading: loadingHots || loadingCommon || computingLayout,
    selectedName: "知乎",
    showWordsOfTopic,
    hideWordsOfTopic: () => setSelectedTopic(null),
    selectedTopic,
    interpolateInterval,
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
    loading: loadingHots || loadingCommon || computingLayout,
    running: running || pause,
    selectedName: "知乎",
  };

  const timeProps = {
    selectedTime,
    running,
    toggleAnimation,
    changeValue,
    range: totalTimeRange || [0, 0],
    finish: duration >= totalDuration,
    totalDuration,
    duration,
  };

  if (running && loadingHots && !pause) {
    stopAnimation();
    setPause(true);
  }

  if (pause && !loadingHots && !running) {
    startAnimation();
    setPause(false);
  }

  function startAnimation() {
    if (running) return;
    if (selectedTopic !== null) setSelectedTopic(null);
    setRunning(true);
    if (duration >= totalDuration) {
      const start = totalTimeRange[0],
        startDuartion = timeScale.invert(start);
      requestAnimation(startDuartion);
    } else {
      requestAnimation(duration);
    }
  }

  function toggleAnimation() {
    if (running) stopAnimation();
    else startAnimation();
  }

  function changeValue(value) {
    if (!hotTimeRange) return;
    const start = totalTimeRange[0],
      end = hotTimeRange[hotTimeRange.length - 1].time;
    if (value < start || value > end) message.error("该时间段暂时没有数据!!!");
    const validValue = Math.max(start, Math.min(value, end));
    setFrame(timeScale.invert(validValue));
    setSelectedTime(validValue);
  }

  function showWordsOfTopic(title) {
    setSelectedTopic(title);
    stopAnimation();
    const i = search(selectedTime),
      time = hotTimeRange[i].time / 1000,
      words = wordsByTime.get(time);
    if (words) {
      const sw = words.find((d) => d.title === title);
      const w = sw ? sw.keywords : [];
      setSelectedWords(w);
    } else getWords(selectedName, time, title);
  }

  function search(time) {
    const bisect = d3.bisector((d) => d.time);
    const i = bisect.left(hotTimeRange, time);
    return Math.max(0, i - 1);
  }

  function requestData(index) {
    // 一直向后找，找到没有请求的地方
    const limit = 10;
    let i = 1;
    for (i = 1; i < limit && index + i < hotTimeRange.length - 1; i++) {
      const tick = hotTimeRange[index + i];
      if (tick.request) break;
    }

    updateDataByTime({
      name: selectedName,
      from: index,
      to: index + i,
    });

    getData({
      name: selectedName,
      tick: hotTimeRange[index],
      start: hotTimeRange[0].time,
      limit: i,
      interval: interpolateInterval,
    });
  }

  useEffect(() => {
    // 获得时间范围
    if (!hotTimeRange) {
      getTime(selectedName);
      return;
    }

    const index = search(selectedTime),
      tick = hotTimeRange[index];
    if (tick.request) return;
    requestData(index);

    // eslint-disable-next-line
  }, [getTime, selectedName, hotTimeRange, selectedTime]);

  return (
    <Container>
      <Row gutter={[16, 16]}>
        <Col span={24} md={12}>
          <BarRace {...barsProps} />
        </Col>
        <Col span={24} md={12}>
          <StoryTelling {...storyProps} />
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
  ({ hots, loading }) => ({
    ...hots,
    loadingHots: loading.models.hots,
    loadingCommon: loading.models.common,
  }),
  {
    setSelectedTime: (time) => ({
      type: "common/setSelectedTime",
      payload: time,
    }),
    setSelectedWords: (words) => ({
      type: "hots/setSelectedWords",
      payload: words,
    }),
    getWords: (name, time, title) => ({
      type: "hots/getWords",
      payload: {
        name,
        time,
        title,
      },
    }),
    getData: (options) => ({
      type: "hots/getData",
      payload: options,
    }),
    setSelectedName: (name) => ({
      type: "hots/setSelectedName",
      payload: name,
    }),
    getTime: (name) => ({ type: "hots/getTime", payload: { name } }),
    updateDataByTime: (options) => ({
      type: "hots/updateDataByTime",
      payload: options,
    }),
  }
)(Hot);
