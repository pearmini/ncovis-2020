import React, { useRef } from "react";
import styled from "styled-components";
import Card from "./Card";
import download, { serialize, rasterize } from "../utils/download";

// 背景颜色必须要写成内联样式的形式
const WhiteSvg = styled.svg.attrs(props => ({
  style: {
    background: "white"
  }
}))``;

export default function({
  style,
  className,
  id,
  loading,
  nodata,
  show = true,
  children,
  ...rest
}) {
  const ref = useRef(null);
  function onDownloadSvg() {
    const blob = serialize(ref.current);
    download(blob);
  }

  function onDownloadPng() {
    rasterize(ref.current).then(download);
  }

  const cardProps = {
    onDownloadPng,
    onDownloadSvg,
    id,
    style,
    className,
    loading,
    nodata,
    show
  };

  return (
    <Card {...cardProps}>
      <WhiteSvg ref={ref} {...rest}>
        {children}
      </WhiteSvg>
    </Card>
  );
}
