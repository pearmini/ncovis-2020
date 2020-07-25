import React, { useEffect, useState } from "react";
import { connect } from "dva";
import styled from "styled-components";
import { Tabs } from "antd";
import moment from "moment";
import { DatePicker } from "antd";
import * as d3 from "d3";

import formatDate from "../../utils/formatDate";
import Ncov from "../ncovis";
import Hot from "../hotsvis";
import News from "../newsvis";
import visImage from "../../assets/images/hots.jpg";
import useAnimation from "../../hooks/useAnimation";

const { TabPane } = Tabs;
const Container = styled.div`
  position: relative;
`;

const An = styled.div`
  position: absolute;
  top: -56px;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 2em;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Intro = styled.div`
  width: 60%;
  & ul {
    padding-left: 2em;
  }
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const VisImage = styled.img`
  width: 360px;
  border-radius: 8px;
`;

const Control = styled.div`
  display: flex;
  margin: 0.5em 0 1em 1em;
`;

function VisPanel({
  getTime,
  timeRange,
  selectedTime,
  selectedRegion,
  setSelectedRegion,
  setSelectedTime,
}) {
  const [running, setRunning] = useState(false); // 用户是否点击播放

  const { requestAnimation, pauseAnimation, setFrame } = useAnimation(step);
  const selectedDate = formatDate(new Date(selectedTime));
  const setSelectedDate = (date) => setSelectedTime(new Date(date).getTime());
  const hour = 12,
    ticks = d3.timeHour
      .every(hour) // 每隔 12 小时获取一下数据
      .range(timeRange[0], timeRange[1])
      .map((d) => d.getTime()),
    totalDuration = ticks.length * 5000,
    interpolateInterval = hour * 60 * 60 * 50; // 1小时 0.75秒

  const timeScale = d3
      .scaleLinear()
      .domain([0, totalDuration])
      .range(timeRange || [0, 0]),
    duration = timeScale.invert(selectedTime);

  const ncovProps = {
    selectedRegion,
    setSelectedRegion,
    selectedTime,
    setSelectedTime,
  };

  const hotProps = {
    selectedTime,
    setSelectedTime,
    running,
    totalDuration,
    totalTimeRange: timeRange,
    timeScale,
    duration,
    interpolateInterval,
    setRunning,
    requestAnimation,
    setFrame,
    stopAnimation,
  };

  const newsPros = {
    selectedRegion,
    setSelectedRegion,
    selectedDate,
  };

  function step(duration) {
    // 不能超过最大的时间
    const t = Math.min(timeScale(duration), timeRange[1]);
    setSelectedTime(t);
    if (duration > totalDuration) {
      setRunning(false);
      return false;
    }
  }

  function disabledDate(current) {
    if (timeRange.length === 0) return true;
    const [start, end] = timeRange;
    return current < moment(start) || current > moment(end);
  }

  function stopAnimation() {
    if (!running) return;
    setRunning(false);
    setSelectedTime(selectedTime + 1); // 防止出现过渡效果
    pauseAnimation();
  }

  useEffect(() => {
    getTime();
  }, [getTime]);
  return (
    <Container>
      <An id="vis" />
      <h1>可视化</h1>
      <Row>
        <Intro>
          <p>
            这里是疫情数据和舆论新闻数据的可视化。你可以先疫情数据出发，找到一些感兴趣的日期，然后去舆论新闻数据可视化看看当时人们在讨论什么、新闻在报道什么；当然你也可以先寻找感兴趣的话题和新闻，然后在去看看当时的疫情发展到什么地步了。
          </p>
          <p>
            在<b>疫情数据</b>
            面板，我们提供了全球各个国家、中国各个分区和省份确诊、治愈和死亡的总人数和每天变化人数。你可以这个面板探索各个地区确诊、治愈和死亡人数总的变化趋势，或者探索每天的增加或减少趋势，从而了解该地区疫情的总体的发展情况。
          </p>
          <p>
            在<b>舆论新闻</b>面板，一方面我们提供了<b>知乎的热榜</b>
            前10以及对应回答关键词的可视化，另一方面我们提供了<b>中国新闻网</b>
            各个地区报道新闻关键词的可视化。你可以找到一些和疫情相关的话题和新闻，然后结合疫情数据去找原因。
          </p>
          <p>
            对于每一种可视化图表，你都可以点击<b>左上角的问号</b>
            了解更多的使用方法。
          </p>
        </Intro>
        <VisImage src={visImage} />
      </Row>
      <Tabs
        defaultActiveKey="1"
        onTabClick={(key) => +key === 2 && stopAnimation()}
      >
        <TabPane tab="舆论新闻" key="1">
          <Control>
            <div>
              <span>
                <b>日期</b>
              </span>
              &ensp;
              <DatePicker
                value={selectedDate === "" ? null : moment(selectedDate)}
                onChange={(_, string) => {
                  setSelectedDate(string);
                }}
                disabledDate={disabledDate}
                showTody={false}
              />
            </div>
          </Control>
          <Hot {...hotProps} />
          <News {...newsPros} />
        </TabPane>
        <TabPane tab="疫情数据" key="2">
          <Ncov {...ncovProps} />
        </TabPane>
      </Tabs>
    </Container>
  );
}

export default connect(({ common }) => ({ ...common }), {
  getTime: () => ({ type: "common/getTime" }),
  setSelectedRegion: (region) => ({
    type: "common/setSelectedRegion",
    payload: region,
  }),
  setSelectedTime: (time) => ({
    type: "common/setSelectedTime",
    payload: time,
  }),
})(VisPanel);
