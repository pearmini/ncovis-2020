import React from "react";
import Svg from "./Svg";
import * as d3 from "d3";
export default function({ loading, data, selectedTime, running }) {
  const width = 600,
    height = 400,
    margin = { top: 30, right: 30, bottom: 30, left: 50 };
  if (data === undefined) {
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

  const { keyframes, pre } = data || {};
  const bars = interPolateData(selectedTime);

  const x = d3
    .scaleLinear()
    .domain([0, d3.max(bars, d => d.reading)])
    .range([margin.left, width - margin.right]);

  function interPolateData(time) {
    const i = bisect.left(keyframes, time, 0, keyframes.length - 1),
      a = keyframes[i];
    if (i > 0) {
      const b = keyframes[i - 1],
        t = (time - a[0]) / (b[0] - a[0]);
      return a[1].slice(0, n).map(d => {
        const { reading, rank } = pre.get(d);
        return {
          ...d,
          y: y(d.rank) * (1 - t) + y(rank) * t,
          reading: d.reading * (1 - t) + reading * t
        };
      });
    }
    return a[1].slice(0, n).map(d => ({ ...d, y: y(d.rank) }));
  }

  const color = d3
    .scaleOrdinal(d3.schemeCategory10)
    .domain(bars.map(d => d.title));

  return (
    <Svg viewBox={[0, 0, width, height]} loading={loading}>
      {bars.map(d => (
        <rect
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
