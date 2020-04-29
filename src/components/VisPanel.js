import React, { useEffect } from "react";
import { connect } from "dva";
import styled from "styled-components";
import TalkPanel from "./TalkPanel";
import NcovPanel from "./NcovPanel";
import { Tabs } from "antd";

const { TabPane } = Tabs;
const Container = styled.div`
  position: relative;
`;

const An = styled.div`
  position: absolute;
  top: -56px;
`;

function VisPanel({
  getTime,
  timeTicks,
  timeRange,
  selectedTime,
  selectedRegion,
}) {
  console.log(timeTicks, timeRange, selectedTime, selectedRegion);
  useEffect(() => {
    getTime();
  }, []);
  return (
    <Container>
      <An id="vis" />
      <h1>可视化</h1>
      <Tabs defaultActiveKey="1">
        <TabPane tab="疫情数据" key="1">
          <NcovPanel />
        </TabPane>
        <TabPane tab="舆论新闻" key="2">
          <TalkPanel />
        </TabPane>
      </Tabs>
    </Container>
  );
}

export default connect(({ global }) => ({ ...global }), {
  getTime: () => ({ type: "global/getTime" }),
})(VisPanel);
