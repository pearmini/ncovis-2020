import React, { useRef, useEffect } from "react";
import styled from "styled-components";
import Card from "./Card";
import download from "../utils/download";

const Canvas = styled.canvas`
  width: 100%;
  height: 100%;
`;

export default function({
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
  ...rest
}) {
  function onDownload() {
    const canvas = ref.current;
    canvas.toBlob(blob => {
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
    nodata
  };

  const canvasProps = {
    ref,
    width: width * 2,
    height: height * 2,
    ...rest
  };

  useEffect(() => {
    const canvas = ref.current;
    const context = canvas.getContext("2d");
    context.restore();
    context.save();
    context.scale(2, 2);
    children && children(context);
  }, dependcies);

  return (
    <Card {...cardProps}>
      <Canvas {...canvasProps}></Canvas>
    </Card>
  );
}
