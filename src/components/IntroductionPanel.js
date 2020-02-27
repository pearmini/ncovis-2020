import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import { useWindowSize } from "react-use";

const Container = styled.div`
  margin: 1em 0;
  position: relative;
  height: ${props => props.height}px;
  width: 100%;
  justify-content: center;
  align-items: center;
  display: flex;
`;

const An = styled.div`
  position: absolute;
  top: -56px;
`;

const Title = styled.h1`
  font-size: 10vh;
  font-weight: bold;
`;

function Introduction() {
  const { height } = useWindowSize();
  const scrolling = useRef(false); // 是否在滚动中
  const pre = useRef(0); // 上一次的 scrollY

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
      <Title>Introduction</Title>
    </Container>
  );
}
export default Introduction;
