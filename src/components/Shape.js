import React, { useRef, useEffect } from "react";
import Card from "./Card";
import styled from "styled-components";
import download from "../utils/download";
const StyledCanvas = styled.canvas`
  width: 100%;
  height: 100%;
  background: white;
  padding: 10px 0px;
  cursor: pointer;
`;

function Shape({ data, loading, loadingImage, setLoadingImage }) {
  const width = 600,
    height = 400,
    src = data && data.image,
    filename = "shapewordle";

  function downloadImage() {
    const canvas = ref.current;
    canvas.toBlob(blob => {
      download(blob, filename);
    });
  }

  function setupCanvas(canvas) {
    const context = canvas.getContext("2d");
    context.restore();
    context.save();
    context.scale(2, 2);
    context.fillStyle = "#fff";
    context.fillRect(0, 0, width, height);
    return context;
  }

  function drawImage(context, src) {
    const image = new Image();

    // 这里的原理暂时不知
    // 这两行主要是为了解决跨域的问题
    image.src = src + "?time=" + new Date().valueOf();
    image.crossOrigin = "Anonymous";
    setLoadingImage(true);
    image.onload = () => {
      context.drawImage(image, 0, 0, width, height);
      setLoadingImage(false);
    };
  }

  const ref = useRef(null);
  useEffect(() => {
    if (!src) return;
    const canvas = ref.current;
    const context = setupCanvas(canvas);
    drawImage(context, src);
  }, [src]);

  return (
    <Card
      onDownload={() => downloadImage()}
      loading={loading || loadingImage}
      nodata={data === undefined}
    >
      <StyledCanvas
        ref={ref}
        width={width * 2}
        height={height * 2}
      ></StyledCanvas>
    </Card>
  );
}

export default Shape;
