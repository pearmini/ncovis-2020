import React, { useEffect } from "react";
import styled from "styled-components";
import * as d3 from "d3";

import Svg from "../../../components/Svg";
import formatDate from "../../../utils/formatDate";

const Container = styled.div`
  cursor: pointer;
`;

export default function ({
  selectedDate,
  setSelectedDate,
  selectedType,
  loading,
  width,
  height,
  show,
  setFocusRegion,
  focusRegion,
  colors,
  all,
  highlightRectColor,
  disabledColor,
  legendWidth,
  legendHeight,
}) {
  const margin = { top: 30, right: 30, bottom: 30, left: 30 };
  const data = all
    .filter((d) => d.region === focusRegion)
    .map((d) => ({
      value: d[selectedType],
      date: new Date(d.date),
    }))
    .filter(({ value }) => !isNaN(value) && value !== "");

  const countDay = (d) => d.getDay(),
    formatDay = (d) => "SMTWTFS"[countDay(d)],
    formatMonth = d3.timeFormat("%b");

  const timeWeek = d3.timeSunday,
    timeMonth = d3.timeMonth,
    timeDay = d3.timeDay,
    [startDate, endDate] = d3.extent(data, (d) => d.date),
    valueExtent = d3.extent(data, (d) => d.value),
    startMonth = timeMonth(startDate),
    endMonth = timeMonth.ceil(endDate),
    totalWeek = timeWeek.count(startMonth, endMonth),
    days = d3.range(7).map((i) => new Date(1995, 0, i)),
    months = d3.timeMonths(startMonth, endMonth),
    padding = 4,
    sw = 8,
    sc = "white";

  const valueByDate = d3.map(data, (d) => formatDate(d.date));
  const dates = timeDay.range(startMonth, endMonth).map((d) => {
    const key = formatDate(d);
    const value = valueByDate.get(key);
    if (value) return value;
    return {
      date: d,
      value: null,
    };
  });

  const cellSize = Math.min(
    (width - margin.left - margin.right) / totalWeek,
    40
  );

  const chartWidth = (cellSize * totalWeek) | 0,
    chartHeight = (cellSize * 7) | 0;

  const special = focusRegion === "湖北" || focusRegion === "华中地区";
  const x = (date) => timeWeek.count(startMonth, date) * cellSize + 0.5,
    y = (date) => countDay(date) * cellSize + 0.5,
    colorScale = special
      ? d3
          .scaleSqrt()
          .interpolate(() => colors.special)
          .domain(valueExtent)
      : d3.scaleSequential(colors[selectedType]).domain(valueExtent),
    color = (value) => {
      if (value === null) return disabledColor;
      return colorScale(value);
    },
    stroke = special
      ? d3
          .scaleSqrt()
          .interpolate(() => colors.special)
          .domain([0, legendWidth])
      : d3.scaleSequential(colors[selectedType]).domain([0, legendWidth]),
    yDay = (d) => (countDay(d) + 0.5) * cellSize,
    isSelect = (date) => formatDate(date) === selectedDate;

  const pathMonth = (t) => {
    const n = 7;
    const d = countDay(t);
    const w = timeWeek.count(startMonth, t);
    return `${
      d === 0
        ? `M${w * cellSize},0`
        : d === n
        ? `M${(w + 1) * cellSize},0`
        : `M${(w + 1) * cellSize},0V${d * cellSize}H${w * cellSize}`
    }V${n * cellSize}`;
  };

  function noData(data) {
    return data.filter(({ value }) => !isNaN(value)).length === 0;
  }

  const introduction = (
    <div>
      <h3>作用</h3>
      <p>反映各个地区每天确诊、治愈或死亡人数相对前一天的变化情况。</p>
      <h3>说明</h3>
      <ul>
        <li>
          因为湖北和华中地区的数据远大于其他地区，所以选择了一种特殊的颜色范围。
        </li>
        <li>变化为 0 的格子不一定真的为 0 ，可能是因为数据缺失。</li>
      </ul>
      <h3>交互方法</h3>
      <ul>
        <li>
          <b>双击</b>空白地方返回。
        </li>
      </ul>
    </div>
  );

  useEffect(() => {
    // 绘制坐标轴
    const scaleLegend = special
      ? d3.scaleSqrt().domain(colorScale.domain()).range([0, legendWidth])
      : d3.scaleLinear().domain(colorScale.domain()).range([0, legendWidth]);

    const legendAxis = d3
      .axisBottom(scaleLegend)
      .ticks(legendWidth / 50)
      .tickSizeOuter(0);

    d3.select(".date-legend").call(legendAxis);
  });

  return (
    <Container onDoubleClick={() => setFocusRegion("")}>
      <Svg
        viewBox={[0, 0, width, height]}
        loading={loading}
        nodata={noData(data)}
        show={show}
        introduction={introduction}
        title="日历热图"
      >
        <g
          transform={`translate(${width - margin.right - legendWidth - 10}, ${
            margin.top
          })`}
        >
          {d3.range(0, legendWidth).map((l) => (
            <line
              className="tree-line"
              key={l}
              x1={l}
              y1={-legendHeight / 2}
              x2={l}
              y2={legendHeight / 2}
              stroke={stroke(l)}
            />
          ))}
          <g
            className="date-legend"
            transform={`translate(0, ${legendHeight / 2})`}
          ></g>
        </g>
        <g
          transform={`translate(${(width - chartWidth) / 2}, ${
            (height - chartHeight) / 2
          })`}
        >
          {data.length !== 0 &&
            months.map((d) => (
              <text fill="currentColor" x={x(d)} dy="-1em" key={d}>
                {formatMonth(d)}
              </text>
            ))}
          {data.length !== 0 &&
            months
              .slice(1, months.length)
              .map((d) => (
                <path
                  d={pathMonth(d)}
                  stroke={sc}
                  strokeWidth={sw}
                  fill="none"
                  key={d}
                />
              ))}
          {dates.map(({ date, value }) => (
            <rect
              key={date}
              x={x(date)}
              y={y(date)}
              width={cellSize - padding}
              height={cellSize - padding}
              fill={color(value)}
              stroke={isSelect(date) ? highlightRectColor : "none"}
              strokeWidth={padding}
              onClick={(e) => {
                if (value !== null) setSelectedDate(formatDate(date));
                e.stopPropagation();
              }}
            >
              <title>{`${formatDate(date)}:${
                value === null ? "暂无数据" : value
              }`}</title>
            </rect>
          ))}
          {data.length !== 0 &&
            days.map((d) => (
              <text
                key={d}
                fill="currentColor"
                x={-cellSize}
                y={yDay(d)}
                dy="0.31em"
              >
                {formatDay(d)}
              </text>
            ))}
        </g>
        {data.length && (
          <g
            transform={`translate(${width - 35}, ${height - 40})`}
            textAnchor="end"
            fill="#777"
          >
            <text fontSize={35} fontWeight="bold">
              {focusRegion}
            </text>
            <text fontSize={15} dy="1.5em">
              {selectedDate}
            </text>
          </g>
        )}
      </Svg>
    </Container>
  );
}
