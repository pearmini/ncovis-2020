import React, { useRef, useEffect } from "react";
import styled from "styled-components";
import Card from "./Card";
import download from "../utils/download";

const Canvas = styled.canvas`
  width: 100%;
  height: 100%;
`;

export default function ({
  loading,
  nodata,
  style,
  className,
  id,
  dependcies = [],
  children,
  width,
  height,
  filename = "words",
  introduction,
  title,
  hasZoom = true,
  ...rest
}) {
  const ratio = 4;
  function onDownload() {
    const canvas = ref.current;
    canvas.toBlob((blob) => {
      download(blob, filename);
    });
  }

  const ref = useRef(null);

  const cardProps = {
    onDownload,
    id,
    style,
    className,
    loading,
    nodata,
    introduction,
    title,
  };

  const canvasProps = {
    ref,
    width: width * ratio,
    height: height * ratio,
    hasZoom,
    ...rest,
  };

  useEffect(() => {
    const canvas = ref.current;
    const context = canvas.getContext("2d");
    context.restore();
    context.save();
    context.scale(ratio, ratio);
    children && children(context);
  // eslint-disable-next-line
  }, [...dependcies, children]);

  return (
    <Card {...cardProps}>
      <Canvas {...canvasProps}></Canvas>
    </Card>
  );
}
