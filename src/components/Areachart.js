import React, { useEffect } from "react";
import Svg from "./Svg";
import * as d3 from "d3";
export default function({ loading }) {
  const width = 1200,
    height = 300,
    margin = { top: 30, right: 30, bottom: 30, left: 60 };
  const data = [
    { date: new Date("2020-2-10"), a: 1, b: 1, c: 1 },
    { date: new Date("2020-2-11"), a: 3, b: 2, c: 5 },
    { date: new Date("2020-2-12"), a: 6, b: 3, c: 3 }
  ];
  const series = d3.stack().keys(["a", "b", "c"])(data);

  const x = d3
    .scaleTime()
    .domain(d3.extent(data, d => d.date))
    .range([margin.left, width - margin.right]);
  const y = d3
    .scaleLinear()
    .domain([0, d3.max(series, d => d3.max(d, d => d[1]))])
    .nice()
    .range([height - margin.bottom, margin.top]);

  const area = d3
    .area()
    .x(d => x(d.data.date))
    .y0(d => y(d[0]))
    .y1(d => y(d[1]));

  const color = d3
    .scaleOrdinal()
    .domain(["a", "b", "c"])
    .range(
      d3
        .quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), data.length)
        .reverse()
    );

  useEffect(() => {
    const xAxis = d3.axisBottom(x);
    const yAxis = g =>
      g.call(d3.axisLeft(y)).call(g => g.select(".domain").remove());
    d3.select(".area-xAxis").call(xAxis);
    d3.select(".area-yAxis").call(yAxis);
  }, [data]);

  return (
    <Svg viewBox={[0, 0, width, height]} loading={loading}>
      {series.map(s => (
        <path key={s.key} fill={color(s.key)} d={area(s)} />
      ))}
      <g
        className="area-xAxis"
        transform={`translate(0, ${height - margin.bottom})`}
      />
      <g className="area-yAxis" transform={`translate(${margin.left}, 0)`} />
    </Svg>
  );
}
