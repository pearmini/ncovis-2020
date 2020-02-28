import React, { useEffect } from "react";
import Svg from "./Svg";
import * as d3 from "d3";
export default function({ data, width, height, margin, color, loading }) {
  const y = d3.scaleLinear(
    [0, d3.max(data, d => d.value)],
    [height - margin.bottom, margin.top]
  );

  const x = d3.scaleTime(
    d3.extent(data, d => d.date),
    [margin.left, width - margin.right]
  );

  const line = d3
    .line()
    .defined(d => d.value !== "")
    .x(d => x(d.date))
    .y(d => y(d.value));

  const yAxis = g =>
    g
      .call(d3.axisLeft(y))
      .call(g => g.select(".domain").remove())
      .call(g =>
        g
          .select(".tick:last-of-type text")
          .clone()
          .attr("x", 3)
          .attr("text-anchor", "start")
          .attr("font-weight", "bold")
          .text(data.y)
      );

  const xAxis = g =>
    g
      .call(
        d3
          .axisBottom(x)
          .ticks(width / 50)
          .tickSizeOuter(0)
      )
      .call(g => g.selectAll("text").attr("transform", `rotate(-15)`));

  useEffect(() => {
    d3.select(".yAxis").call(yAxis);
    d3.select(".xAxis").call(xAxis);
  }, [data]);

  return (
    <Svg viewBox={[0, 0, width, height]} loading={loading} nodata={true}>
      <path d={line(data)} fill="none" strokeWidth={2} stroke={color} />
      <g className="yAxis" transform={`translate(${margin.left}, 0)`}></g>
      <g
        className="xAxis"
        transform={`translate(0, ${height - margin.bottom})`}
      ></g>
    </Svg>
  );
}
