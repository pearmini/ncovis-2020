import React from "react";
import styled from "styled-components";
import talkImage from "../assets/images/talk.jpg";

const Container = styled.div`
  position: relative;
  margin-bottom: 4em;
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

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Intro = styled.div`
  width: 60%;
  & ul {
    padding: 1em 0 0 2em;
  }
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const TalkImage = styled.img``;

function IntroductionPanel() {
  return (
    <Container>
      <An id="introduction" />
      <h1>介绍</h1>
      <Row>
        <Intro>
          <p>
            <b>nCoVIS</b> 是山东大学{" "}
            <a href="https://vislab.wang/" target="_blank">
              VisLab
            </a>{" "}
            实验室为大众提供的一个在线可视化分析平台，旨在探索在 COVID-19
            疫情出现到现在：
            <ul>
              <li>各地区新闻在报道什么？</li>
              <li>人们在网络上讨论什么？</li>
              <li>上面两者的关系以及对控制疫情有什么指导意义？</li>
            </ul>
          </p>
          <p>
            <b>COVID-19</b> 是人类历史上第一次在高度发达的
            <b>自媒体、全媒体时代</b>
            遇到的高传染性病毒。面对病毒，我们不能只关心患者的患病情况，同时也要关心群众们在讨论什么，防止出现恐慌。
          </p>
          <p>
            在病毒传播初期，武汉曾出现过因为恐慌导致大量常规感冒、发烧患者挤兑医院，在医院造成大规模传染。并且因为恐慌效应在自媒体时代各种社交软件上的二次传播，加剧了人们对病毒的恐惧，促使大量疫情严重地区的人开始向其他地区逃离，进一步加大了空坠疫情的难度。
          </p>
          <p>
            <b>新闻报道控制舆论导向，而舆论反过来也影响新闻报道。</b>
            所以我们除了提供和疫情直接相关的数据可视化以外，还爬取了
            <a target="_blank" href="https://www.chinanews.com/">
              中国新闻网
            </a>
            各地区的新闻数据和
            <a target="_blank" href="https://www.zhihu.com/">
              知乎
            </a>
            的热搜数据，并提供相关的可视化。
          </p>
          <p>
            在可视化技术方面，我们一方面使用了一些常见的可视化技术：面积图、条形图、饼状图等，另一方面使用了我们实验室在去年{" "}
            <b>InfoVis2019</b> 发表的论文所提到的技术
            <a
              target="_blank"
              href="https://vislab.wang/post/shapewordle:-tailoring-wordles-using-shape-aware-archimedean-spirals"
            >
              {" "}
              ShapeWordle{" "}
            </a>
            ，让我们的可视化结果更加生动和有人情味。
          </p>
          <p>
            最后，我们希望这场灾难早点过去，祝愿病人们早日康复，也向奋斗在一线的白衣天使和科学家们致以最崇高的敬意。中国加油，世界加油，那些不能打到我们的，只能让我们更强大！
          </p>
        </Intro>
        <TalkImage src={talkImage} />
      </Row>
    </Container>
  );
}

export default IntroductionPanel;
