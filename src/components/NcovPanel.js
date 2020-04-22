import React, { useEffect, useState } from "react";
import { connect } from "dva";
import { Row, Col, Select } from "antd";
import styled from "styled-components";
import regions from "../assets/data/region_options.json";

import DateMap from "./DateMap";
import Areachart from "./Areachart";
import * as d3 from "d3";
import { formTree } from "../utils/tree";

const { Option } = Select;

const Container = styled.div`
  position: relative;
  margin-bottom: 4em;
  padding: 0 10px;
`;

const Control = styled.div`
  display: flex;
  margin: 1em 0 1em 0;

  @media (max-width: 700px) {
    flex-direction: column;
  }
`;

function NcovPanel({
  selectedDate,
  setSelectedDate,
  dataByRegion,
  dataByDate,
  getData,
  range,
  countries,
  selectedCountries,
  setSelectedCountries,
  widthData,
  getCountryData,
  total,
  selectedTime,
  setSelectedTime,
  loading,
  treeData,
  setTreeData,
}) {
  const [focusRegion, setFocusRegion] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("湖北");
  const [selectedType, setSelectedType] = useState("confirmed");
  const [selectedLevel, setSelectedLevel] = useState("top");
  const [highlightRegions, setHighlightRegions] = useState([]);

  const levels = [
    { name: "国家", key: "top" },
    { name: "分区", key: "second" },
    { name: "省份", key: "third" },
  ];

  const types = [
    { name: "确诊", key: "confirmed" },
    { name: "治愈", key: "cured" },
    { name: "死亡", key: "dead" },
  ];

  const areaPros = {
    loading,
    dataByDate,
    selectedTime,
    setSelectedTime,
    selectedType,
    selectedLevel,
    focusRegion,
    setFocusRegion,
    selectedCountries,
    countries,
    highlightRegions,
    setHighlightRegions,
  };

  const dateProps = {
    regions,
    range,
    selectedRegion,
    setSelectedRegion,
    selectedDate,
    setSelectedDate,
    setSelectedLevel,
    selectedLevel,
    selectedType,
    loading,
    dataByRegion,
    selectedCountries,
    treeData,
    setTreeData,
    handleChangeLevel,
  };

  function handleCountryDataChange(keys) {
    if (keys.length >= 30) {
      alert("不能超过 30 个国家");
      return;
    }
    const newKeys = [];
    for (let k of keys) {
      if (widthData.has(k)) newKeys.push(k);
      else getCountryData(k, dataByDate, dataByRegion, total);
    }
    setSelectedCountries(newKeys);
    setTreeData(d3.hierarchy(formTree(keys)));
  }

  function handleChangeLevel(value, tree) {
    if (value === "top") {
      setTreeData(d3.hierarchy(formTree(selectedCountries)));
    } else if (value === "second") {
      const root =
        tree !== undefined
          ? tree
          : d3.hierarchy(regions).each((d) => {
              d.depth === 1
                ? (d.hideChildren = true)
                : d.depth === 2 && (d.hide = true);
            });
      setTreeData(root);
    } else {
      const root = tree !== undefined ? tree : d3.hierarchy(regions);
      setTreeData(root);
    }
    setSelectedLevel(value);
  }

  useEffect(() => {
    getData("中国");
  }, [getData]);

  return (
    <Container>
      <Control>
        <div>
          <span>
            <b>级别</b>
          </span>
          &ensp;
          <Select
            value={selectedLevel}
            onChange={(value) => handleChangeLevel(value)}
          >
            {levels.map((d) => (
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
        {selectedLevel === "top" && (
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
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Areachart {...areaPros} />
        </Col>
        <Col span={24}>
          <DateMap {...dateProps} />
        </Col>
      </Row>
    </Container>
  );
}
export default connect(
  ({ ncov, loading }) => ({
    loading: loading.models.ncov,
    ...ncov,
  }),
  {
    setTreeData: (data) => ({ type: "ncov/setTreeData", payload: data }),
    getCountryData: (country, dataByDate, dataByRegion, total) => ({
      type: "ncov/getCountryData",
      payload: { country, dataByDate, dataByRegion, total },
    }),
    setSelectedDate: (time) => ({
      type: "ncov/setSelectedDate",
      payload: time,
    }),
    getNewsData: (region, date) => ({
      type: "news/getNewsData",
      payload: { region, date },
    }),
    setSelectedTime: (time) => ({
      type: "ncov/setSelectedTime",
      payload: time,
    }),
    getData: (country) => ({ type: "ncov/getData", payload: { country } }),
    setSelectedCountries: (keys) => ({
      type: "ncov/setSelectedCountries",
      payload: {
        keys,
      },
    }),
  }
)(NcovPanel);
