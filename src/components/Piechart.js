import React from "react";
import Svg from "./Svg";
import * as d3 from "d3";
export default function({ loading, all }) {
  const width = 600,
    height = 400,
    margin = { top: 30, right: 30, bottom: 30, left: 50 };
  const data = all ? all.tags : [];
  const arc = d3
    .arc()
    .innerRadius(0)
    .outerRadius(
      Math.min(
        width - margin.left - margin.right,
        height - margin.top - margin.bottom
      ) /
        2 -
        1
    );

  const pie = d3
    .pie()
    .sort(null)
    .value(d => d.value);

  const color = d3
    .scaleOrdinal()
    .domain(data.map(d => d.name))
    .range(
      d3
        .quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), data.length)
        .reverse()
    );

  const arcs = pie(data);
  return (
    <Svg viewBox={[-width / 2, -height / 2, width, height]} loading={loading}>
      {arcs.map(a => (
        <path key={a.data.name} d={arc(a)} fill={color(a.data.name)} />
      ))}
    </Svg>
  );
}
