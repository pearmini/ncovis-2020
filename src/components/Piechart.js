import React from "react";
import Svg from "./Svg";
import * as d3 from "d3";
export default function({ loading }) {
  const width = 600,
    height = 400,
    margin = { top: 30, right: 30, bottom: 30, left: 50 };
  const data = [
    { name: "<5", value: 19912018 },
    { name: "5-9", value: 20501982 },
    { name: "10-14", value: 20679786 },
    { name: "15-19", value: 21354481 },
    { name: "20-24", value: 22604232 },
    { name: "25-29", value: 21698010 },
    { name: "30-34", value: 21183639 },
    { name: "35-39", value: 19855782 },
    { name: "40-44", value: 20796128 },
    { name: "45-49", value: 21370368 },
    { name: "50-54", value: 22525490 },
    { name: "55-59", value: 21001947 }
  ];

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
