import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import { useWindowSize } from "react-use";
import chinaURL from "../assets/images/china.png";
import zhihuURL from "../assets/images/zhihu.png";
import weiboURL from "../assets/images/weibo.png";

const Container = styled.div`
  margin: 1em 0;
  position: relative;
  height: ${props => props.height}px;
  /* background: ${props => props.theme.header}; */
  width: 100%;
  justify-content: center;
  align-items: center;
  display: flex;
`;

const An = styled.div`
  position: absolute;
  top: -56px;
`;

const TitleTop = styled.h1`
  font-size: 60px;
  font-weight: bold;
  margin-bottom: 0px;
  /* color: ${props => props.theme.font}; */
`;

const Title = styled.h1`
  font-size: 60px;
  font-weight: bold;
  /* color: ${props => props.theme.font}; */
`;

const Intro = styled.p`
  /* color: ${props => props.theme.font}; */
`;

const Row = styled.div`
  display: flex;
`;

const Dashbord = styled.div`
  flex: 1;
`;

const CardContainer = styled.div`
  display: flex;
`;

const ImageContaienr = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex: 1.5;
  width: 100%;
  height: 100%;
`;

const China = styled.img`
  height: 50%;
`;

const Zhihu = styled.img`
  width: 50%;
`;

const Weibo = styled.img`
  width: 50%;
`;

const ScrollButton = styled.button``;

function Card() {
  return <p>hello</p>;
}

function Introduction() {
  const { height } = useWindowSize();
  const scrolling = useRef(false); // 是否在滚动中
  const pre = useRef(0); // 上一次的 scrollY
  const data = [
    {
      name: "确诊",
      value: 10,
      color: "red"
    },
    {
      name: "确诊",
      value: 10,
      color: "red"
    },
    {
      name: "确诊",
      value: 10,
      color: "red"
    }
  ];

  useEffect(() => {
    // 如果在 scrollTo 的途中被打断，可能导致 scrolling 不能被设置为 false，
    // 这样就会暂时失去切换效果
    // 这里的根本原因是无法监听 scroll 停止的事件
    const handler = e => {
      const { scrollY } = window,
        h = height - 56;
      const step = scrollY - pre.current;
      if (scrollY === 0 || scrollY >= h) scrolling.current = false;
      if (scrolling.current) {
        pre.current = scrollY;
        return;
      }
      if (step < 0 && scrollY < h) {
        window.scrollTo(0, 0);
        scrolling.current = true;
      } else if (0 < scrollY && scrollY < h) {
        window.scrollTo(0, h);
        scrolling.current = true;
      }

      pre.current = scrollY;
    };

    // 这里不能监听 sroll 事件，否者点击 a 的产生的滚动也会被监听
    window.addEventListener("wheel", handler);
    return () => window.removeEventListener("wheel", handler);
  });

  return (
    <Container height={height}>
      <An id="introduction" />
      <Dashbord>
        <div>
          <TitleTop>人们在讨论什么</TitleTop>
          <Title>新闻在报道什么</Title>
        </div>
        {/* <Intro>
          在疫情期间，我们爬取了微博和知乎以及中国新闻网的数据。
          旨在探索，随着疫情确诊、治愈和死亡人数的变化，人们在讨论什么，新闻在报道什么？
        </Intro>
        <CardContainer>
          {data.map(({ color, name, value }) => (
            <Card color={color} name={name} value={value} />
          ))}
        </CardContainer> */}
      </Dashbord>
      {/* <ImageContaienr>
        <China src={chinaURL} />
        <Row>
          <Zhihu src={zhihuURL} />
          <Weibo src={weiboURL} />
        </Row>
      </ImageContaienr> */}
      {/* <ScrollButton /> */}
    </Container>
  );
}
export default Introduction;
