import React, { useEffect } from "react";
import styled from "styled-components";
import { connect } from "dva";
import { Radio, Row, Col } from "antd";

import Timeline from "./Timeline";
import Svg from "./Svg";

import clouds from "../utils/vis/clouds";
import bars from "../utils/vis/bars";

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
  selectedPlatform,
  setSelectedPlatform,
  selectedTime,
  getHotData,
  hots
}) {
  const platformvalues = hots && hots.get(selectedPlatform);
  const { words, list, range } = platformvalues || {};

  const barsProps = {
    width: 600,
    height: 400,
    list,
    selectedTime
  };

  const cloudsProps = {
    width: 600,
    height: 400,
    words,
    selectedTime
  };

  const timeProps = {
    range,
    total: 10000,
    selectedTime
  };

  useEffect(() => {
    getHotData();
  }, [getHotData]);

  return (
    <Container>
      <An id="hots" />
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
      <Timeline {...timeProps} />
    </Container>
  );
}

export default connect(
  ({ global, hots }) => ({
    selectedPlatform: global.selectedPlatform,
    selectedTime: global.selectedTime,
    regionOptions: global.regionOptions,
    hots
  }),
  {
    getHotData: () => ({ type: "hots/getData" }),
    setSelectedPlatform: value => ({
      type: "globals/setSelectedPlatform",
      payload: { value }
    })
  }
)(HotsPanel);
