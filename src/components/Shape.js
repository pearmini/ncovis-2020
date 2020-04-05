import React, { useState, useRef } from "react";
import Canvas from "./Canvas";
import fontURL from "../assets/fonts/思源柔黑.ttf";

function Shape({ data, loading, selectedDate, selectedRegion }) {
  const width = 900,
    height = 600,
    marginRight = 50,
    marginBottom = 60,
    { keywords, fillingWords } = data || {};

  // 在 edge 没有 FontFace 对象
  const font =
    typeof FontFace === "undefined"
      ? null
      : new FontFace("siyuan", `url(${fontURL})`);
  const fontRef = useRef(font);
  const [loadFont, setLoadingFont] = useState(font === null ? false : true);

  function drawText(context, words, { fillStyle, textAlign, textBaseline }) {
    context.textAlign = textAlign;
    context.textBaseline = textBaseline;
    context.fillStyle = fillStyle;
    for (let word of words) {
      const { name, transX, transY, rotate, fontSize, fillX, fillY } = word;
      context.save();
      context.font = `${fontSize}px siyuan`;
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
    context.font = `bold 50px siyuan`;
    context.fillText(selectedRegion, 0, 0);

    context.font = "normal 25px siyuan";
    context.fillText(selectedDate, 0, 35);
    // date
    context.restore();
  }

  async function draw(context) {
    try {
      if (!keywords || !fillingWords) return;

      // 加载字体
      if (fontRef.current !== null && fontRef.current.status === "unloaded") {
        await fontRef.current.load();
        document.fonts.add(fontRef.current);
        setLoadingFont(false);
      }

      // 绘制背景
      context.fillStyle = "white";
      context.fillRect(0, 0, width, height);

      // 绘制地区和时间信息
      drawLabel(context);

      // 绘制词云
      drawText(context, keywords, {
        fillStyle: "#59569d",
        textAlign: "center",
        textBaseline: "alphabet"
      });

      drawText(context, fillingWords, {
        fillStyle: "#f25292",
        textAlign: "start",
        textBaseline: "middle"
      });
    } catch (e) {
      console.error(e);
      setLoadingFont(false);
    }
  }

  const introduction = (
    <div>
      <h3>作用</h3>
      <p>展示该地区和该日期新闻报道中的关键字。</p>
      <h3>说明</h3>
      <p>目前只有省份和直辖市的数据，同时数据可能出现缺失的情况。</p>
      <h3>交互</h3>
      <p>无</p>
    </div>
  );

  return (
    <Canvas
      width={width}
      height={height}
      loading={loadFont || loading}
      nodata={data === undefined}
      dependcies={[data]}
      introduction={introduction}
      title="Shapewordle"
    >
      {draw}
    </Canvas>
  );
}

export default Shape;
