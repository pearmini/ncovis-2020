import React from "react";
import styled from "styled-components";
import { Drawer, Button } from "antd";
import { connect } from "dva";
import { schemeTableau10 } from "d3";
import str2num from "../../utils/str2num";

import newsImage from "../../assets/images/news.jpg";

const Container = styled.div`
  position: relative;
  margin: 1em 0 2em 0;
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

const Wrapper = styled.div`
  position: relative;
`;

const CardContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  background: white;
  padding: 20px;
  margin: 20px 0;
  width: 100%;
  height: 200px;
  cursor: pointer;
  transition: all 0.5s;
  &:hover {
    box-shadow: 0px 0px 10px 2px rgba(0, 0, 0, 0.1);
  }
`;

const VoteButton = styled(Button)``;

const ContentWrapper = styled.div`
  width: 100%;
  height: 140px;
  display: flex;
  justify-content: space-between;
`;

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${(props) => props.color || "black"};
  color: white;
  font-weight: bold;
  font-family: siyuan;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  line-height: 32px;

  @media (max-width: 700px) {
    display: none;
  }
`;

const Image = styled.img`
  height: 100%;
  border-radius: 8px;

  @media (max-width: 700px) {
    display: none;
  }
`;

const Main = styled.div`
  overflow: auto;
  width: 100%;
  padding-left: 20px;
`;

const Sub = styled.div`
  margin-bottom: 1em;
  font-size: 12px;

  & .top {
    display: inline-block;
    background: orange;
    text-align: center;
    color: white;
    width: 40px;
    border-radius: 2px;
  }

  & span {
    margin-right: 10px;
  }
`;

const Left = styled.div`
  width: 60%;
  display: flex;
  justify-content: space-between;

  @media (max-width: 700px) {
    width: 100%;
  }
`;

const Right = styled.div`
  width: 60%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

function Card({
  title,
  des,
  url,
  createTime,
  author,
  isTop,
  reading,
  imageUrl,
}) {
  const avatarColor = () =>
    schemeTableau10[str2num(author) % schemeTableau10.length];
  return (
    <Wrapper>
      <CardContainer
        onClick={() => {
          window.open(url);
        }}
      >
        <ContentWrapper>
          <Left>
            <Avatar color={avatarColor(author)}>{author.slice(0, 1)}</Avatar>
            <Main>
              <h2>{title}</h2>
              <Sub>
                {isTop === 1 && <span className="top">置顶</span>}
                <span>作者：{author}</span>
                <span>阅读：{reading}</span>
                <span>日期：{createTime.toLocaleString()}</span>
              </Sub>
              <p>{des}</p>
            </Main>
          </Left>
          <Right>
            <Image src={imageUrl} />
          </Right>
        </ContentWrapper>
      </CardContainer>
    </Wrapper>
  );
}

function CommentPanel({ list, isOpen, setOpen }) {
  return (
    <Container>
      <An id="story" />
      <h1>发现</h1>
      <Row>
        <Intro>
          <p>
            通过该分析系统你可以短时间内就了解这段时间发生的一些和疫情有关的事。同时能找到很多有意思的现象和问题，比如下面的这些：
          </p>
          <ul>
            <li>
              在疫情发展的过程中，可能是因为人们无聊，出现了哪些奇葩话题?
              <ul>
                <li> 拉屎拉到干净是一种怎样的体验？</li>
                <li>
                  加入有一个按钮，按下去会获得 10 亿元，但是 500
                  年后人类会毁灭，你按吗?
                </li>
              </ul>
            </li>
            <li>
              有哪些热度特别高的超级话题?
              <ul>
                <li>科比去世:该话题的热度超过了4月4号全国哀悼日的热度</li>
                <li>美股熔断</li>
                <li>肖战事件</li>
                <li>塞尔维亚总统哽咽着请求中国援助</li>
                <li>孙杨事件</li>
              </ul>
            </li>
            <li>
              人们对疫情变化的认识的变化情况：蝙蝠 -> 双⻩连 -> 中药 ->
              推测来自于美国
            </li>
            <li>
              中国疫情发展的重要阶段和关键时间点：天津大学宣布研制出口服疫苗 ->
              新冠对中国发展对意义
            </li>
            <li>其他国家的疫情发展情况和关键时间点、关键事件。</li>
          </ul>
          <p>
            下面有一些用该平台分析出的文章。你可以自己去发现问题，也可以回答上面问题中的任何一个。注意问题不用太大，可以很小，
            但是一定要和疫情有关。这里你可以通过投稿提出问题和自己的看法，通过审核的文章我们会放在该网站上。
          </p>
          <VoteButton type="primary" onClick={() => setOpen(true)}>
            我要投稿
          </VoteButton>
        </Intro>
        <VisImage src={newsImage} />
      </Row>
      {list
        .sort((a, b) => b.createTime - a.createTime)
        .map((d) => (
          <Card {...d} key={d.id} />
        ))}
      <Drawer
        title="投稿"
        width={360}
        onClose={() => setOpen(false)}
        visible={isOpen}
        bodyStyle={{ paddingBottom: 80 }}
        style={{ zIndex: 1010 }}
      >
        <p>你需要通过邮件发送以下的信息：</p>
        <ul>
          <li>文章标题</li>
          <li>一小段文章介绍</li>
          <li>文章链接</li>
          <li>笔名</li>
        </ul>
        <p>收件地址为：subairui@icloud.com</p>
        <p>当你发送文章，我们会尽快对其进行审核，请耐心等待！</p>
      </Drawer>
    </Container>
  );
}

export default connect(
  ({ comment }) => ({
    ...comment,
  }),
  {
    setOpen: (value) => ({
      type: "comment/setOpen",
      payload: { value },
    }),
  }
)(CommentPanel);
