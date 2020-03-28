import React from "react";
import Canvas from "./Canvas";

function Shape({ data, loading, selectedDate, selectedRegion }) {
  const width = 900,
    height = 600,
    marginRight = 50,
    marginBottom = 60,
    { keywords, fillingWords } = data || {};

  function drawText(context, words, { fillStyle, textAlign, textBaseline }) {
    context.textAlign = textAlign;
    context.textBaseline = textBaseline;
    context.fillStyle = fillStyle;
    for (let word of words) {
      const { name, transX, transY, rotate, fontSize, fillX, fillY } = word;
      context.save();
      context.font = `${fontSize}px 微软雅黑`;
      context.translate(transX, transY);
      context.rotate(rotate);
      context.fillText(name, fillX, fillY);
      context.restore();
    }
  }

  function drawLabel(context) {
    context.save();
    // region
    context.translate(width - marginRight, height - marginBottom);
    context.fillStyle = "#777";
    context.textAlign = "end";
    context.textBaseline = "bottom";
    context.font = `bold 50px 微软雅黑`;
    context.fillText(selectedRegion, 0, 0);

    context.font = "normal 25px 微软雅黑";
    context.fillText(selectedDate, 0, 35);
    // date
    context.restore();
  }

  function draw(context) {
    if (!keywords || !fillingWords) return;
    context.fillStyle = "white";
    context.fillRect(0, 0, width, height);

    // 绘制地区和时间信息
    drawLabel(context);

    // 绘制词云
    drawText(context, keywords, {
      fillStyle: "#665c84",
      textAlign: "center",
      textBaseline: "alphabet"
    });
    drawText(context, fillingWords, {
      fillStyle: "#ff7657",
      textAlign: "start",
      textBaseline: "middle"
    });
  }

  return (
    <Canvas
      width={width}
      height={height}
      loading={loading}
      nodata={data === undefined}
      dependcies={[data]}
    >
      {draw}
    </Canvas>
  );
}

export default Shape;
