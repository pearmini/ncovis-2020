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
  const bisect = d3.bisector(d => d[0]);
  const y = d3
    .scaleBand()
    .domain(d3.range(n + 1))
    .padding(0.1)
    .range([margin.top, ((height - margin.bottom) / n) * (n + 1)]);
  const barSize = y.bandwidth();
  const bars = interpolate(keyframes, selectedTime);

  const x = d3
    .scaleLinear()
    .domain([0, d3.max(bars, d => d.value)])
    .range([margin.left, width - margin.right]);

  const names = bars.map(d => d.name);
  const id = d => `t-${d.value}`;
  const colorScale = name =>
    selectedTopic !== null && selectedTopic !== name ? "#efefef" : color(name);

  const introduction = (
    <div>
      <h3>作用</h3>
      <p>反映知乎热榜前10的话题的热度变化情况。</p>
      <h3>说明</h3>
      <p>目前只有 2020-02-27 之后的数据。前面的数据会尽快补上。</p>
      <h3>交互</h3>
      <ul>
        <li>
          <b>单击</b>任意热搜话题，旁边的词云会只展示当前话题下回答中的热词。
        </li>
        <li>
          <b>鼠标移动到</b>任意热搜话题上面，会显示完整的标题。
        </li>
      </ul>
    </div>
  );

  color.cur(names);

  function interpolate(data, time) {
    const i = bisect.left(data, time, 0, data.length - 1),
      a = data[i];
    if (!i || !running) return a[1].map(d => ({ ...d, y: y(d.rank) }));
    const b = data[i - 1],
      t = (time - a[0]) / (b[0] - a[0]);

    return a[1].map(d => {
      const { value, rank } = b[1].find(({ name }) => d.name === name) || {
        value: d.value,
        rank: n
      };
      return {
        ...d,
        y: y(d.rank) * (1 - t) + y(rank) * t,
        value: d.value * (1 - t) + value * t
      };
    });
  }

  useEffect(() => {
    // 保存上一帧的颜色
    color.pre(names);

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
          key={d.name}
        >
          <rect
            width={x(d.value) - x(0)}
            height={barSize}
            fill={colorScale(d.name)}
            cursor="pointer"
            fillOpacity={0.7}
            onClick={e => {
              showWordsOfTopic(d.name);
              e.stopPropagation();
            }}
          >
            <title>{d.name}</title>
          </rect>
        </g>
      ))}
      <g id="bar-axis" transform={`translate(${0}, ${margin.top})`}></g>
      {bars.map(d => (
        <g
          transform={`translate(${margin.left}, ${running ? d.y : y(d.rank)})`}
          key={d.name}
        >
          <text
            dx="8"
            dy="1.1em"
            clipPath={`url(#${id(d)})`}
            fontWeight="bold"
            fontSize="13"
            cursor="pointer"
            onClick={e => {
              showWordsOfTopic(d.name);
              e.stopPropagation();
            }}
          >
            {d.name}
            <title>{d.name}</title>
          </text>
          <text
            dx="8"
            y={barSize}
            dy="-0.33em"
            clipPath={`url(#${id(d)})`}
            fontSize="10"
            fill="currentColor"
          >
            {d.value | 0}
          </text>
          <defs>
            <clipPath id={id(d)}>
              <rect
                x="0"
                y="0"
                width={Math.max(x(d.value) - x(0) - 8, 0)}
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
