import React from "react";
import Svg from "./Svg";
import * as d3 from "d3";
export default function({ loading, selectedRegion, selectedDate, data = [] }) {
  const width = 600,
    height = 400,
    margin = { top: 50, right: 35, bottom: 40, left: 40 },
    legendHeight = 25;

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

  data.sort((a, b) => b.count - a.count);
  const names = data.map(d => d.name);
  const pie = d3
    .pie()
    .sort(null)
    .value(d => d.count);

  const color =
    data.length === 1
      ? () => "#61d4b3"
      : d3
          .scaleOrdinal()
          .domain(names)
          .range(
            d3
              .quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), data.length)
              .reverse()
          );

  const text = d => ((((d.endAngle - d.startAngle) / Math.PI) * 50) | 0) + "%";
  const arcs = pie(data);
  const introduction = (
    <div>
      <h3>作用</h3>
      <p>展示该地区，该日期不同种类的新闻报道数量的占比。</p>
      <h3>说明</h3>
      <p>目前只有省份和直辖市的数据，同时数据可能出现缺失的情况。</p>
      <h3>交互</h3>
      <p>无</p>
    </div>
  );
  return (
    <Svg
      viewBox={[0, 0, width, height]}
      loading={loading}
      nodata={data.length === 0}
      introduction={introduction}
      title="饼状图"
    >
      {data.length && (
        <g
          transform={`translate(${width - margin.right}, ${height -
            margin.bottom})`}
          textAnchor="end"
          fill="#777"
        >
          <text fontSize={35} fontWeight="bold">
            {selectedRegion}
          </text>
          <text fontSize={15} dy="1.5em">
            {selectedDate}
          </text>
        </g>
      )}
      <g transform={`translate(${margin.left}, ${margin.top})`}>
        {names.map((d, index) => (
          <g key={d} transform={`translate(${0}, ${legendHeight * index})`}>
            <circle fill={color(d)} r={5}></circle>
            <text fill="currentColor" dx={10} dy="0.31em">
              {d}
            </text>
          </g>
        ))}
      </g>
      <g transform={`translate(${width / 2 + 30}, ${height / 2})`}>
        {arcs.map(a => (
          <path key={a.data.name} d={arc(a)} fill={color(a.data.name)} />
        ))}
        {arcs.map(a => (
          <g
            key={a.data.name}
            transform={`translate(${arc.centroid(a)})`}
            textAnchor="middle"
          >
            <text fill="currentColor" fontSize={11}>
              {text(a)}
            </text>
          </g>
        ))}
      </g>
    </Svg>
  );
}
