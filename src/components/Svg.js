import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import Card from "./Card";
import download, { serialize, rasterize } from "../utils/download";
import * as d3 from "d3";

// 背景颜色必须要写成内联样式的形式
const StyledSvg = styled.svg.attrs(props => ({
  style: {
    background: "white"
  }
}))``;

function Svg({ width, height, children, filename, id, style, ...rest }) {
  const ref = useRef(null);
  function onDownloadSvg() {
    const blob = serialize(ref.current);
    download(blob);
  }

  function onDownloadPng() {
    rasterize(ref.current).then(download);
  }

  useEffect(() => {
    const svg = d3.select(ref.current);
    
    // 初始化
    svg.select(".chart").remove();
    const props = {
      svg,
      width,
      height,
      ...rest
    };
    children && children(props);
  }, [children, width, height, rest]);

  const props = {
    onDownloadPng,
    onDownloadSvg
  };

  return (
    <Card {...props} id={id} style={style}>
      <StyledSvg ref={ref} viewBox={[0, 0, width, height]}></StyledSvg>
    </Card>
  );
}

export default Svg;
