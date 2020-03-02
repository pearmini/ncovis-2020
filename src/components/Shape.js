import React, { useRef, useEffect } from "react";
import Card from "./Card";
import styled from "styled-components";
import download from "../utils/download";
const StyledCanvas = styled.canvas`
  width: 100%;
  height: 100%;
  background: white;
`;

function Shape({ data, loading, loadingImage, setLoadingImage }) {
  const width = 3600,
    height = 2400,
    { key, fill } = data || {},
    filename = "shapewordle";

  function downloadImage() {
    const canvas = ref.current;
    canvas.toBlob(blob => {
      download(blob, filename);
    });
  }

  function setupCanvas(_) {
    const canvas = arguments.length ? _ : document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return [canvas, canvas.getContext("2d")];
  }

  function drawImage(context, src, color) {
    let resolve, reject;
    const promise = new Promise((y, n) => ((resolve = y), (reject = n)));
    const image = new Image();

    // 这里的原理暂时不知
    // 这两行主要是为了解决跨域的问题
    image.src = src + "?time=" + new Date().valueOf();
    image.crossOrigin = "Anonymous";
    image.onerror = reject;
    image.onload = () => {
      context.drawImage(image, 0, 0, width, height);
      context.globalCompositeOperation = "source-atop";
      context.fillStyle = color;
      context.fillRect(0, 0, width, height);
      resolve();
    };
    return promise;
  }

  function drawBackground(context, fill) {
    context.fillStyle = fill;
    context.fillRect(0, 0, width, height);
  }

  const ref = useRef(null);
  useEffect(() => {
    (async () => {
      if (!key) return;
      const [, context] = setupCanvas(ref.current),
        [canvasFill, contextFill] = setupCanvas(),
        [canvasKey, contextKey] = setupCanvas();
      setLoadingImage(true);
      await Promise.all([
        drawImage(contextFill, fill, "orange"),
        drawImage(contextKey, key, "purple")
      ]);
      drawBackground(context, "white");
      context.drawImage(canvasFill, 0, 0);
      context.drawImage(canvasKey, 0, 0);
      setLoadingImage(false);
    })();
  }, [key, fill]);

  return (
    <Card
      onDownload={() => downloadImage()}
      loading={loading || loadingImage}
      nodata={data === undefined}
    >
      <StyledCanvas ref={ref} width={width} height={height}></StyledCanvas>
    </Card>
  );
}

export default Shape;
