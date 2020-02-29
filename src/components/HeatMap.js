import React, { useMemo } from "react";
import Svg from "./Svg";
import * as d3 from "d3";
export default function({
  dataByDate,
  selectedDate,
  setSelectedDate,
  selectedType,
  loading
}) {
  const width = 600,
    height = 200,
    margin = { top: 30, right: 30, bottom: 30, left: 50 },
    colors = {
      dead: d3.interpolateBuPu,
      confirm: d3.interpolatePuRd,
      cue: d3.interpolateYlGn,
      suspect: d3.interpolateOrRd
    };

  const data = useMemo(
    () =>
      dataByDate
        ? d3
            .pairs(
              Array.from(dataByDate)
                .map(([date, data]) => ({
                  date: new Date(date),
                  value: data[selectedType]
                }))
                .filter(({ value }) => !isNaN(value) && value !== "")
            )
            .map(([a, b]) => ({
              date: new Date(b.date),
              value: b.value - a.value
            }))
        : [],
    [dataByDate, selectedType]
  );

  const select = data.find(({ date }) => date.getTime() === selectedDate);

  const countDay = d => d.getDay(),
    formatDate = d3.timeFormat("%x"),
    formatDay = d => "SMTWTFS"[countDay(d)],
    formatMonth = d3.timeFormat("%b");

  const timeWeek = d3.timeSunday,
    timeMonth = d3.timeMonth,
    [startDate, endDate] = d3.extent(data, d => d.date),
    valueExtent = d3.extent(data, d => d.value),
    startMonth = timeMonth(startDate),
    endMonth = timeMonth.ceil(endDate),
    totalWeek = timeWeek.count(startMonth, endMonth),
    days = d3.range(7).map(i => new Date(1995, 0, i)),
    months = d3.timeMonths(startMonth, endMonth);

  const cellHeight = (height - margin.bottom - margin.top) / 7,
    cellWidth = (width - margin.left - margin.right) / totalWeek,
    cellSize = Math.min(cellHeight, cellWidth);

  const x = date => timeWeek.count(startMonth, date) * cellSize + 0.5,
    y = date => countDay(date) * cellSize + 0.5,
    color = value => {
      const scale = d3
        .scaleSequential(colors[selectedType])
        .domain(valueExtent);
      return scale(value);
    },
    yDay = d => (countDay(d) + 0.5) * cellSize;

  const pathMonth = t => {
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

  return (
    <Svg
      viewBox={[0, 0, width, height]}
      loading={loading}
      nodata={noData(data)}
    >
      <g transform={`translate(${margin.left}, ${margin.right})`}>
        {data.map(({ date, value }) => (
          <rect
            key={date}
            x={x(date)}
            y={y(date)}
            width={cellSize - 1}
            height={cellSize - 1}
            fill={color(value)}
            onClick={() => setSelectedDate(date.getTime())}
          >
            <title>{`${formatDate(date)}:${value}`}</title>
          </rect>
        ))}
        {data.length !== 0 &&
          days.map(d => (
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
        {data.length !== 0 &&
          months.map(d => (
            <React.Fragment key={d}>
              <path
                d={pathMonth(d)}
                stroke="#fff"
                strokeWidth={3}
                fill="none"
              />
              <text fill="currentColor" x={x(d)}>
                {formatMonth(d)}
              </text>
            </React.Fragment>
          ))}
        {select && (
          <rect
            width={cellSize}
            height={cellSize}
            fill="transparent"
            stroke="red"
            x={x(select.date)}
            y={y(select.date)}
          ></rect>
        )}
        <g
          fill="currentColor"
          transform={`translate(${width - margin.right - 160}, ${height -
            margin.top -
            50})`}
        >
          <text>{`日期:${
            select ? formatDate(select.date) : formatDate(selectedDate)
          }`}</text>
          <text y="1.25em">{`人数:${select ? select.value : "暂无数据"}`}</text>
        </g>
      </g>
    </Svg>
  );
}
