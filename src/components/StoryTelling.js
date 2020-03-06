import React from "react";
import Canvas from "./Canvas";
import * as d3 from "d3";
export default function({ loading, selectedTime, keyframes, running }) {
  const width = 1200,
    height = 800;
  if (keyframes === undefined)
    return (
      <Canvas
        width={width}
        height={height}
        loading={loading}
        dependcies={[selectedTime]}
        nodata={keyframes === undefined}
      ></Canvas>
    );
  const interpolateAttrs = new Set([
    "x",
    "y",
    "size",
    "rotate",
    "height",
    "size"
  ]);
  const initWord = word => ({
    ...word,
    size: 0,
    height: 0
  });
  const words = interpolateData(selectedTime);

  function interpolateData(time) {
    const bisect = d3.bisector(d => d[0]).left;
    const i = bisect(keyframes, time, 0, keyframes.length - 1),
      a = keyframes[i];

    if (!i || !running) return a[1];
    const b = keyframes[i - 1],
      t = d3.easeCircleInOut((time - a[0]) / (b[0] - a[0]));

    // 找出消失的
    const disappear = b[1]
      .filter(word => !a[1].find(d => d.word === word.word))
      .map(initWord);
    const all = [...disappear, ...a[1]];
    return all.map(word => {
      const pre = b[1].find(d => d.word === word.word) || initWord(word);
      return Object.keys(word).reduce((obj, key) => {
        if (interpolateAttrs.has(key)) {
          obj[key] = word[key] * (1 - t) + pre[key] * t;
        } else {
          obj[key] = word[key];
        }
        return obj;
      }, {});
    });
  }

  function draw(context) {
    context.fillStyle = "white";
    context.fillRect(0, 0, width, height);
    for (let word of words) {
      context.save();
      context.fillStyle = word.color;
      if (word.angle === 0) {
        context.translate(word.x, word.y);
        context.font = `${word.size}px 微软雅黑`;
      } else {
        context.translate(word.x, word.y - word.height);
        context.rotate((Math.PI * word.angle) / 180);
        context.font = `${word.size}px 微软雅黑`;
      }
      context.fillText(word.word, 0, 0);
      context.restore();
    }
  }

  return (
    <Canvas
      width={width}
      height={height}
      dependcies={[selectedTime]}
      loading={loading}
      nodata={words.length === 0}
    >
      {draw}
    </Canvas>
  );
}
