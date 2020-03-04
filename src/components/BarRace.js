import React, { useEffect } from "react";
import Svg from "./Svg";
import * as d3 from "d3";
export default function({ loading, keyframes, selectedTime, running, color }) {
  const width = 600,
    height = 400,
    margin = { top: 30, right: 30, bottom: 30, left: 50 };
  if (keyframes === undefined) {
    return (
      <Svg
        viewBox={[0, 0, width, height]}
        loading={loading}
        nodata={true}
      ></Svg>
    );
  }

  const n = 10;
  const bisect = d3.bisector(d => d[0]);
  const y = d3
    .scaleBand()
    .domain(d3.range(n + 1))
    .padding(0.1)
    .range([margin.top, ((height - margin.bottom) / n) * (n + 1)]);

  const bars = interPolateData(selectedTime);

  const x = d3
    .scaleLinear()
    .domain([0, d3.max(bars, d => d.reading)])
    .range([margin.left, width - margin.right]);

  const titles = bars.map(d => d.title);

  color.cur(titles);

  useEffect(() => {
    // 保存上一帧的颜色
    color.pre(titles);
  });

  function interPolateData(time) {
    const len = keyframes.length,
      i = bisect.left(keyframes, time, 0, len - 1),
      a = keyframes[i];
    if (!i) return a[1].map(d => ({ ...d, y: y(d.rank) }));
    const b = keyframes[i - 1],
      t = (time - a[0]) / (b[0] - a[0]);
    return a[1].map(d => {
      const { reading, rank } = b[1].find(({ title }) => d.title === title) || {
        reading: d.reading,
        rank: n
      };
      return {
        ...d,
        y: y(d.rank) * (1 - t) + y(rank) * t,
        reading: d.reading * (1 - t) + reading * t
      };
    });
  }

  return (
    <Svg viewBox={[0, 0, width, height]} loading={loading}>
      {bars.map(d => (
        <rect
          key={d.title}
          x={margin.left}
          y={running ? d.y : y(d.rank)}
          width={running ? x(d.reading) - x(0) : x(d.reading) - x(0)}
          height={y.bandwidth()}
          fill={color(d.title)}
        />
      ))}
      }
    </Svg>
  );
}
