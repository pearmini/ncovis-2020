import React, { useEffect } from "react";
import Svg from "./Svg";
import * as d3 from "d3";
export default function({
  loading,
  dataByDate,
  selectedType = "confirm",
  selectedLevel = "top"
}) {
  const width = 1200,
    height = 300,
    margin = { top: 30, right: 30, bottom: 30, left: 60 };

  const secondLevelSet = new Set([
    "华北地区",
    "西北地区",
    "东北地区",
    "华东地区",
    "华中地区",
    "西南地区",
    "华南地区",
    "港澳台地区"
  ]);

  const data = Array.from(dataByDate).map(([date, data]) => ({
      date: new Date(date),
      ...data
        .filter(({ region }) => {
          if (selectedLevel === "top") {
            return region === "全国";
          } else if (selectedLevel === "second") {
            return secondLevelSet.has(region);
          } else {
            return region !== "全国" && !secondLevelSet.has(region);
          }
        })
        .reduce(
          (obj, { region, data }) => ((obj[region] = data[selectedType]), obj),
          {}
        )
    })),
    [first] = data,
    keys = first ? Object.keys(first).filter(d => d !== "date") : [];

  const series = d3.stack().keys(keys)(data);

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

  const color =
    selectedLevel === "top"
      ? () => "steelblue"
      : d3
          .scaleOrdinal()
          .domain(keys)
          .range(
            d3
              .quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), keys.length)
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
    <Svg
      viewBox={[0, 0, width, height]}
      loading={loading}
      nodata={!data || data.length === 0}
    >
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
