import React, { useEffect } from "react";
import { connect } from "dva";
import styled from "styled-components";
import TalkPanel from "./TalkPanel";
import NcovPanel from "./NcovPanel";
import { Tabs } from "antd";

const { TabPane } = Tabs;
const Container = styled.div``;
// const An = styled.div`
//   position: absolute;
//   top: -56px;
// `;

// const MyRow = styled.div`
//   display: flex;
//   justify-content: space-between;
//   align-items: center;
//   width: 100%;

//   @media (max-width: 768px) {
//     flex-direction: column;
//   }
// `;
// import newsImage from "../assets/images/news.jpg";
// const Intro = styled.div`
//   width: 60%;
//   & ul {
//     padding-left: 2em;
//   }
//   @media (max-width: 768px) {
//     width: 100%;
//   }
// `;

// const NewsImage = styled.img`
//   width: 370px;
//   border-radius: 8px;
// `;

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

{
  /* <h1>全国各地新闻都在报道些什么?</h1>
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
      </MyRow> */
}

export default connect()(VisPanel);
