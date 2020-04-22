import React, { useEffect } from "react";
import { connect } from "dva";
import styled from "styled-components";
import TalkPanel from "./TalkPanel";
import NcovPanel from "./NcovPanel";
import { Tabs } from "antd";

const { TabPane } = Tabs;
const Container = styled.div``;

function VisPanel({}) {

  useEffect(() => {
    // 获得时间范围
    // 获得选择的时间
  });
  return (
    <Container>
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

export default connect()(VisPanel);
