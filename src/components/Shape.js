import React, { useState } from "react";
import Canvas from "./Canvas";

function Shape({ data, loading }) {
  const [loadingImage, setLoadingImage] = useState(false);
  const width = 3600,
    height = 2400,
    { key, fill } = data || {};

  function createOffscreenCanvas() {
    const canvas = document.createElement("canvas");
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

  async function draw(context) {
    if (!key) return;
    const [canvasFill, contextFill] = createOffscreenCanvas(),
      [canvasKey, contextKey] = createOffscreenCanvas();
    setLoadingImage(true);
    await Promise.all([
      drawImage(contextFill, fill, "orange"),
      drawImage(contextKey, key, "purple")
    ]);
    drawBackground(context, "white");
    context.drawImage(canvasFill, 0, 0);
    context.drawImage(canvasKey, 0, 0);
    setLoadingImage(false);
  }

  return (
    <Canvas
      width={width}
      height={height}
      loading={loading || loadingImage}
      nodata={data === undefined}
      dependcies={[key, fill]}
    >
      {draw}
    </Canvas>
  );
}

export default Shape;
