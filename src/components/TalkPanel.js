import React, { useEffect, useRef, useState } from "react";
import useAnimation from "../hook/useAnimation";
import styled from "styled-components";
import { connect } from "dva";
import moment from "moment";
import { Row, Col, Select, message, TreeSelect, DatePicker } from "antd";
import regions from "../assets/data/region_options.json";

import Timeline from "./Timeline";
import BarRace from "./BarRace";
import StoryTelling from "./StoryTelling";
import Shape from "./Shape";
import Piechart from "./Piechart";
import mc from "../utils/memorizedColor";
import rc from "../utils/randomColor";
import * as d3 from "d3";

import newsImage from "../assets/images/hots.jpg";

const { Option } = Select;
message.config({
  maxCount: 1,
});

const Container = styled.div`
  position: relative;
  margin-bottom: 4em;
  padding: 0 10px;
`;

const An = styled.div`
  position: absolute;
  top: -56px;
`;

const Control = styled.div`
  display: flex;
  margin: 0.5em 0 1em 0;

  @media (max-width: 700px) {
    flex-direction: column;
  }
`;

const NewsImage = styled.img`
  width: 370px;
  border-radius: 8px;
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

const MyRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 2em;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

function TalkPanel({
  dataByName,
  dataByDate,
  dataByRegion,
  getData,
  loadingHots,
  loadingNcov,
  timeByName,
  getTime,
  selectedTime,
  setSelectedTime,
  updateDataByTime,
  getWords,
  selectedWords,
  setSelectedWords,
  wordsByTime,
  setSelectedCountries,
  getCountryData,
  dateRange: totalTimeRange,
  total,
  widthData,
  selectedDate,
  setSelectedDate,
  getNewsData,
  newsByRegion,
}) {

  const [running, setRunning] = useState(false); // 用户是否点击播放
  const [pause, setPause] = useState(false); // 是否应为 loading data 而暂停
  const [selectedTopic, setSelectedTopic] = useState(null);
  const { requestAnimation, pauseAnimation, setFrame } = useAnimation(step);
  const [selectedRegion, setSelectedRegion] = useState("湖北");

  const barColor = useRef(
    mc([...d3.schemeTableau10, "#634294", "#d54087"], 10)
  );
  const wordColor = useRef(rc(d3.schemeTableau10));

  const selectedName = "zhihu";
  const namevalues = dataByName.get(selectedName);
  const { listKeyframes, cloudsKeyframes } = namevalues || {};

  const hotTimeRange = timeByName.get(selectedName);
  const hour = 12,
    ticks = d3.timeHour
      .every(hour) // 每隔 12 小时获取一下数据
      .range(totalTimeRange[0], totalTimeRange[1])
      .map((d) => d.getTime()),
    totalDuration = ticks.length * 5000,
    interpolateInterval = hour * 60 * 60 * 50; // 1小时 0.75秒

  const timeScale = d3
      .scaleLinear()
      .domain([0, totalDuration])
      .range(totalTimeRange || [0, 0]),
    duration = timeScale.invert(selectedTime);

  const newsByDate = newsByRegion.get(selectedRegion);
  const news = newsByDate && newsByDate.get(selectedDate);
  const { words, tags } = news || {};
  const shapeProps = {
    data: words,
    // loading: loadingNews || loadingNcov,
    selectedDate,
    selectedRegion,
  };

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
    loading: loadingHots,
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

  const pieProps = {
    // loading: loadingNews || loadingNcov,
    data: tags,
    selectedDate,
    selectedRegion,
  };


  if (running && loadingHots && !pause) {
    stopAnimation();
    setPause(true);
  }

  if (pause && !loadingHots && !running) {
    startAnimation();
    setPause(false);
  }

  // function disabledDate(current) {
  //   if (range.length === 0) return true;
  //   return current < moment(range[0]) || current > moment(range[1]);
  // }

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
    if (duration >= totalDuration) {
      const start = totalTimeRange[0],
        startDuartion = timeScale.invert(start);
      requestAnimation(startDuartion);
    } else {
      requestAnimation(duration);
    }
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

  function handleCountryDataChange(keys) {
    if (keys.length >= 30) {
      alert("不能超过 30 个国家");
      return;
    }
    const newKeys = [];
    for (let k of keys) {
      if (widthData.has(k)) newKeys.push(k);
      else getCountryData(k, dataByDate, dataByRegion, total, "hots");
    }
    setSelectedCountries("hots", newKeys);
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
    // 如果有日期数据且 news 数据为空的话就请求
    if (
      news === undefined &&
      selectedDate !== "" &&
      selectedRegion !== "中国"
    ) {
      getNewsData(selectedRegion, `${selectedDate}`);
    }

    // 获得时间范围
    if (!hotTimeRange) {
      getTime(selectedName);
      return;
    }

    const index = search(selectedTime),
      tick = hotTimeRange[index];
    if (tick.request) return;
    requestData(index);
  }, [getData, getTime, selectedName, hotTimeRange, selectedTime, getNewsData]);

  return (
    <Container>
      <An id="hots" />
      {/* <h1>人们都在讨论些什么？</h1> */}
      {/* <MyRow>
        <Intro>
          <p>这里是和舆论相关的可视化，用来探索全国人们在讨论什么？</p>
          <p>
            首先上面是一个动态的<b>条形图</b>和<b>词云</b>，分别反映的是：
            <b>知乎热榜前10的话题的热度变化情况</b>和
            <b>当前热门话题下回答中的热词变化情况</b>
            。点击播放按钮动画开始播放动画，在
            <b>条形图中</b>
            将鼠标移动到任意一条热门话题上会显示完整的话题；点击任意一条热门话题，在
            <b>词云</b>
            显示这一条热门话题对应回答的热词。
          </p>
          <p>
            当你发现了一些有趣的话题，并且想找寻它们和疫情的关系的时候，就可以使用下面的
            <b>堆叠面积图</b>
            ，该图反映的是：
            <b>各个地区每天确诊、治愈或死亡的总人数随着时间的变化</b>。
          </p>
          <p>
            <b>堆叠面积图中</b>
            ，其中每一种颜色的“带子”代表一个地区，该“带子”越宽，表示该地区当天相应类别（确诊、治愈或者死亡）总人数越大。在这里你不仅能看各个省份（湖北省、山东省等）和各个直辖市（北京市、上海市）的相应类别总人数的变化情况，还可以通过
            <b>级别下拉框</b>
            来选择不同的级别，从而查看各个分区（华中地区、华南地区等），甚至全国相应类别总人数的变化情况。
          </p>
          <p>
            在<b>堆叠面积图</b>中，如果你对某个地区特别感兴趣，可以<b>单击</b>
            该地区的名字，进入只显示该地区情况的<b>普通面积图</b>。并且可以通过
            <b>双击空白</b>部分返回。
          </p>
        </Intro>
        <NewsImage src={newsImage} />
      </MyRow> */}
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
          {/* <Control>
            <div>
              <span>
                <b>级别</b>
              </span>
              &ensp;
              <Select
                value={selectedLevel}
                onChange={(value) => {
                  setSelectedLevel(value);
                  setFocus("");
                }}
              >
                {levels.map((d) => (
                  <Option key={d.key}>{d.name}</Option>
                ))}
              </Select>
              &ensp;&ensp;
              <span>
                <b>种类</b>
              </span>
              &ensp;
              <Select
                value={selectedType}
                onChange={(value) => setSelectedType(value)}
              >
                {types.map((d) => (
                  <Option key={d.key}>{d.name}</Option>
                ))}
              </Select>
              {selectedLevel === "top" && (
                <>
                  &ensp;&ensp;
                  <span>
                    <b>查看的国家</b>
                  </span>
                  &ensp;
                  <Select
                    mode="tags"
                    value={selectedCountries}
                    onChange={handleCountryDataChange}
                    style={{
                      minWidth: 200,
                    }}
                  >
                    {countries.map((d) => (
                      <Option key={d}>{d}</Option>
                    ))}
                  </Select>
                </>
              )}
            </div>
          </Control> */}
          {/* <Areachart {...areaPros} /> */}

          <Shape {...shapeProps} />
        </Col>
      </Row>
    </Container>
  );
}

export default connect(
  ({ hots, loading, ncov, news }) => ({
    ...hots,
    selectedDate: ncov.selectedDate,
    newsByRegion: news.newsByRegion,
    loadingHots: loading.models.hots,
    loadingNcov: loading.models.ncov,
    dataByDate: ncov.dataByDate,
    dataByRegion: ncov.dataByRegion,
    dateRange: ncov.range,
    widthData: ncov.widthData,
    total: ncov.total,
    selectedCountries: ncov.selectedCountries.hots,
    selectedTime: ncov.selectedTime,
    countries: ncov.countries,
  }),
  {
    getNewsData: (region, date) => ({
      type: "news/getNewsData",
      payload: { region, date },
    }),
    getCountryData: (country, dataByDate, dataByRegion, total, name) => ({
      type: "ncov/getCountryData",
      payload: { country, dataByDate, dataByRegion, total, name },
    }),
    setSelectedCountries: (name, keys) => ({
      type: "ncov/setSelectedCountries",
      payload: {
        keys,
        name,
      },
    }),
    setSelectedTime: (time) => ({
      type: "ncov/setSelectedTime",
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
    setSelectedDate: (time) => ({
      type: "ncov/setSelectedDate",
      payload: time,
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
)(TalkPanel);
