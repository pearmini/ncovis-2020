import React from "react";
import styled from "styled-components";
import { Drawer, Button } from "antd";
import { connect } from "dva";
import { schemeTableau10 } from "d3";
import str2num from "../../utils/str2num";

const Container = styled.div`
  position: relative;
  margin: 1em 0 2em 0;
`;

const An = styled.div`
  position: absolute;
  top: -56px;
`;

const MyRow = styled.div`
  display: flex;
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
  height: 160px;
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

const Image = styled.div`
  height: 160px;
  background: black;
  width: 300px;
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
  width: 70%;
  display: flex;
  justify-content: space-between;

  @media (max-width: 700px) {
    width: 100%;
  }
`;

function Card({ title, des, url, createTime, author, isTop, reading }) {
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
          <Image />
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
      <MyRow>
        <p>
          这里你可以通过投稿提出问题，或者回答问题；也可以看别人提出的问题和回答的问题。
        </p>
        <VoteButton type="primary" onClick={() => setOpen(true)}>
          我要投稿
        </VoteButton>
      </MyRow>
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
        hello world
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
