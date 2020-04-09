import React, { useEffect, useState } from "react";
import moment from "moment";
import { connect } from "dva";
import { TreeSelect, DatePicker, Row, Col, Select } from "antd";
import styled from "styled-components";
import regions from "../assets/data/region_options.json";

import Shape from "./Shape";
import Piechart from "./Piechart";
import DateMap from "./DateMap";
import newsImage from "../assets/images/news.jpg";

import * as d3 from "d3";

const { Option } = Select;
const Container = styled.div`
  position: relative;
  margin-bottom: 4em;
`;

const Control = styled.div`
  display: flex;
  margin: 2em 0 1em 0;

  @media (max-width: 700px) {
    flex-direction: column;

    & .country {
      margin-top: 1em;
    }
  }
`;

const An = styled.div`
  position: absolute;
  top: -56px;
`;

const MyRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;

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

const NewsImage = styled.img`
  width: 370px;
  border-radius: 8px;
`;

function formTree(nodes) {
  return {
    title: "全球",
    value: "全球",
    children: nodes.map((d) => ({
      title: d,
      value: d,
    })),
  };
}

function NewsPanel({
  selectedDate,
  setSelectedDate,
  dataByRegion,
  dataByDate,
  newsByRegion,
  getNewsData,
  getData,
  loadingNews,
  loadingNcov,
  range,
  countries,
  selectedCountries,
  setSelectedCountries,
  widthData,
  getCountryData,
  total,
}) {
  const [selectedRegion, setSelectedRegion] = useState("湖北");
  const [selectedType, setSelectedType] = useState("confirmed");
  const [selectedRange, setSelectedRange] = useState("china");
  const [treeData, setTreeData] = useState(d3.hierarchy(regions));
  const ranges = [
    { name: "全球", key: "world" },
    { name: "全国", key: "china" },
  ];
  const types = [
    { name: "确诊", key: "confirmed" },
    { name: "治愈", key: "cured" },
    { name: "死亡", key: "dead" },
  ];
  const newsByDate = newsByRegion.get(selectedRegion);
  const news = newsByDate && newsByDate.get(selectedDate);
  const { words, tags } = news || {};
  const shapeProps = {
    data: words,
    loading: loadingNews || loadingNcov,
    selectedDate,
    selectedRegion,
  };

  const pieProps = {
    loading: loadingNews || loadingNcov,
    data: tags,
    selectedDate,
    selectedRegion,
  };

  const dateProps = {
    regions,
    range,
    selectedRegion,
    selectedDate,
    setSelectedDate,
    setSelectedRegion,
    selectedRange,
    selectedType,
    loading: loadingNcov,
    dataByRegion,
    selectedCountries,
    treeData,
    setTreeData,
    handleChangeRange,
  };

  function handleCountryDataChange(keys) {
    if (keys.length >= 30) {
      alert("不能超过 30 个国家");
      return;
    }
    const newKeys = [];
    for (let k of keys) {
      if (widthData.has(k)) newKeys.push(k);
      else getCountryData(k, dataByDate, dataByRegion, total, "news");
    }
    setSelectedCountries("news", newKeys);
    setTreeData(d3.hierarchy(formTree(keys)));
  }

  function handleChangeRange(value) {
    if (value === "world")
      setTreeData(d3.hierarchy(formTree(selectedCountries)));
    else setTreeData(d3.hierarchy(regions));
    setSelectedRange(value);
  }

  function disabledDate(current) {
    if (range.length === 0) return true;
    return current < moment(range[0]) || current > moment(range[1]);
  }

  useEffect(() => {
    // 请求所有的数据
    if (!dataByRegion.size) {
      getData("中国");
      return;
    }
    // 如果有日期数据且 news 数据为空的话就请求
    if (
      news === undefined &&
      selectedDate !== "" &&
      selectedRegion !== "中国"
    ) {
      getNewsData(selectedRegion, `${selectedDate}`);
    }
  }, [getData, selectedDate, selectedRegion, getNewsData]);
  return (
    <Container>
      <An id="news" />
      <h1>全国各地新闻都在报道些什么?</h1>
      <MyRow>
        <Intro>
          <p>这里是和新闻相关的可视化，用来探索全国各地的新闻都在报道什么？</p>
          <p>
            首先我们从和疫情数据直接相关的可视化出发，也就下面第一张图：
            <b>树 + 热力图</b>
            ，该图其反应的是：
            <b>各个地区每天确诊、治愈或死亡人数相对前一天的变化情况</b>。
          </p>
          <p>
            下图中右边是<b>热力图</b>
            ，其中每一个格子代表一个地区，该格子颜色越深，表示该地区当天相对前一天的变化越剧烈。在这里你不仅能看各个省份（湖北省、山东省等）和各个直辖市（北京市、上海市）的变化情况，还可以通过点击下图中右边的
            <b>树</b>
            ，来对区域进行合并，从而查看各个分区（华中地区、华南地区等），甚至全国的变化。
          </p>
          <p>
            从第一张图我们可以找到一些感兴趣的日期和地区，这样我们有两种选择：
          </p>
          <ul>
            <li>
              <b>双击</b>地区的名字进入<b>日历热图</b>
              去查看该地区的变化细节，并且<b>双击</b>空白区域返回。
            </li>
            <li>
              <b>单击</b>热力图中对应的格子 或者通过<b>日期、地区下拉框</b>
              选择该日期和地区，从而查看对应的新闻可视化。
            </li>
          </ul>
          <p>
            新闻可视化由两个图表构成。左边的图表是一个<b>饼状图</b>
            ，用于对该地区和该日期的新闻数据有一个概览：
            <b>不同种类的新闻报道数量的占比</b>。右边的图表就是上面提到的{" "}
            <b>Shapewordle</b> ，用于展现该地区和该日期<b>新闻报道中的关键字</b>
            。其中所有关键词构成的形状是该地区的地理形状，一方面将关键字和地区紧紧地联系在一起，另一方面更加具有美感，从而给人传递一种愉悦感。
          </p>
        </Intro>
        <NewsImage src={newsImage} />
      </MyRow>
      <Control>
        <div>
          <span>
            <b>范围</b>
          </span>
          &ensp;
          <Select value={selectedRange} onChange={handleChangeRange}>
            {ranges.map((d) => (
              <Option key={d.key}>{d.name}</Option>
            ))}
          </Select>
          &emsp;
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
          &emsp;
        </div>
        {selectedRange === "world" && (
          <div className="country">
            <span>
              <b>查看的国家</b>
            </span>
            &ensp;
            <Select
              mode="tags"
              value={selectedCountries}
              onChange={handleCountryDataChange}
              style={{
                minWidth: 250,
              }}
            >
              {countries.map((d) => (
                <Option key={d}>{d}</Option>
              ))}
            </Select>
          </div>
        )}
      </Control>
      <Row>
        <Col span={24}>
          <DateMap {...dateProps} />
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
            disabledDate={disabledDate}
            showTody={false}
          />
        </div>
      </Control>
      <Row gutter={[16, 16]}>
        <Col span={24} md={12}>
          <Piechart {...pieProps} />
        </Col>
        <Col span={24} md={12}>
          <Shape {...shapeProps} />
        </Col>
      </Row>
    </Container>
  );
}
export default connect(
  ({ news, ncov, loading }) => ({
    newsByRegion: news.newsByRegion,
    range: ncov.range,
    total: ncov.total,
    countries: ncov.countries,
    selectedCountries: ncov.selectedCountries.news,
    setSelectedRange: ncov.setSelectedCountries,
    dataByRegion: ncov.dataByRegion,
    dataByDate: ncov.dataByDate,
    selectedDate: ncov.selectedDate,
    widthData: ncov.widthData,
    loadingNews: loading.models.news,
    loadingNcov: loading.models.ncov,
  }),
  {
    getCountryData: (country, dataByDate, dataByRegion, total, name) => ({
      type: "ncov/getCountryData",
      payload: { country, dataByDate, dataByRegion, total, name },
    }),
    setSelectedDate: (time) => ({
      type: "ncov/setSelectedDate",
      payload: time,
    }),
    getNewsData: (region, date) => ({
      type: "news/getNewsData",
      payload: { region, date },
    }),
    getData: (country) => ({ type: "ncov/getData", payload: { country } }),
    setSelectedCountries: (name, keys) => ({
      type: "ncov/setSelectedCountries",
      payload: {
        keys,
        name,
      },
    }),
  }
)(NewsPanel);
