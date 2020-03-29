import React, { useEffect } from "react";
import Svg from "./Svg";
import * as d3 from "d3";
import formatDate from "../utils/formatDate";
export default function({
  loading,
  keyframes,
  selectedTime,
  running,
  color,
  selectedName,
  showWordsOfTopic,
  hideWordsOfTopic,
  selectedTopic
}) {
  const width = 600,
    height = 400,
    margin = { top: 30, right: 35, bottom: 20, left: 40 };
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
  const bisect = d3.bisector(d => d[0] * 1000);
  const y = d3
    .scaleBand()
    .domain(d3.range(n + 1))
    .padding(0.1)
    .range([margin.top, ((height - margin.bottom) / n) * (n + 1)]);
  const barSize = y.bandwidth();

  const bars = interPolateData(selectedTime);

  const x = d3
    .scaleLinear()
    .domain([0, d3.max(bars, d => d.heat)])
    .range([margin.left, width - margin.right]);

  const titles = bars.map(d => d.title);
  const id = d => `t-${d.heat}`;
  const colorScale = title =>
    selectedTopic !== null && selectedTopic !== title
      ? "#efefef"
      : color(title);

  color.cur(titles);
  useEffect(() => {
    // 保存上一帧的颜色
    color.pre(titles);

    // 绘制坐标轴
    const axis = d3
      .axisTop(x)
      .ticks(width / 160)
      .tickSizeOuter(0)
      .tickSizeInner(-barSize * (n + 1 + y.padding()));

    const g = d3.select("#bar-axis").call(axis);
    g.select(".tick:first-of-type text").remove();
    g.selectAll(".tick:not(:first-of-type) line").attr("stroke", "white");
    g.select(".domain").remove();
  });

  function interPolateData(time) {
    const len = keyframes.length,
      i = bisect.left(keyframes, time, 0, len - 1),
      a = keyframes[i];
    if (!i) return a[1].map(d => ({ ...d, y: y(d.rank) }));
    const b = keyframes[i - 1],
      t = (time / 1000 - a[0]) / (b[0] - a[0]);
    return a[1].map(d => {
      const { heat, rank } = b[1].find(({ title }) => d.title === title) || {
        heat: d.heat,
        rank: n
      };
      return {
        ...d,
        y: y(d.rank) * (1 - t) + y(rank) * t,
        heat: d.heat * (1 - t) + heat * t
      };
    });
  }

  const introduction = (
    <div>
      <p>这里是一个动态的条形图。用于直观展现知乎热搜的热度随着时间的变化。</p>
      <p>你可以在任意时刻，点击任意一个条。用于高亮对应的热搜数据以及回答中的关键词。</p>
    </div>
  );

  return (
    <Svg
      viewBox={[0, 0, width, height]}
      loading={loading}
      onClick={hideWordsOfTopic}
      title="动态条形图"
      introduction={introduction}
    >
      {bars.map(d => (
        <g
          transform={`translate(${margin.left}, ${running ? d.y : y(d.rank)})`}
          key={d.title}
        >
          <rect
            width={x(d.heat) - x(0)}
            height={barSize}
            fill={colorScale(d.title)}
            cursor="pointer"
            fillOpacity={0.7}
            onClick={e => {
              showWordsOfTopic(d.title);
              e.stopPropagation();
            }}
          >
            <title>{d.title}</title>
          </rect>
        </g>
      ))}
      <g id="bar-axis" transform={`translate(${0}, ${margin.top})`}></g>
      {bars.map(d => (
        <g
          transform={`translate(${margin.left}, ${running ? d.y : y(d.rank)})`}
          key={d.title}
        >
          <text
            dx="8"
            dy="1.1em"
            clipPath={`url(#${id(d)})`}
            fontWeight="bold"
            fontSize="13"
            cursor="pointer"
            onClick={e => {
              showWordsOfTopic(d.title);
              e.stopPropagation();
            }}
          >
            {d.title}
            <title>{d.title}</title>
          </text>
          <text
            dx="8"
            y={barSize}
            dy="-0.33em"
            clipPath={`url(#${id(d)})`}
            fontSize="10"
            fill="currentColor"
          >
            {d.heat | 0}
          </text>
          <defs>
            <clipPath id={id(d)}>
              <rect
                x="0"
                y="0"
                width={Math.max(x(d.heat) - x(0) - 8, 0)}
                // width={x(d.heat) - x(0) - 8}
                height={barSize}
              />
            </clipPath>
          </defs>
        </g>
      ))}
      <g
        transform={`translate(${width - margin.right}, ${height - 40})`}
        textAnchor="end"
        fill="#777"
      >
        <text fontSize={35} fontWeight="bold">
          {selectedName}
        </text>
        <text fontSize={15} dy="1.5em">
          {formatDate(new Date(selectedTime))}
        </text>
      </g>
    </Svg>
  );
}
