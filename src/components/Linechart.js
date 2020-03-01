import React, { useEffect, useRef, useState, useMemo } from "react";
import { useMouse } from "react-use";
import Svg from "./Svg";
import * as d3 from "d3";
export default function({
  dataByDate,
  loading,
  selectedType,
  selectedDate,
  setSelectedDate,
  ...rest
}) {
  const ref = useRef(null);
  const { elX } = useMouse(ref);
  const width = 1200,
    height = 250,
    margin = { top: 30, right: 30, bottom: 30, left: 50 },
    colors = { dead: "black", confirm: "red", cue: "green", suspect: "orange" };

  const data = useMemo(
    () =>
      dataByDate
        ? Object.assign(
            Array.from(dataByDate)
              .map(([date, data]) => ({
                date: new Date(date),
                value: data[selectedType]
              }))
              .filter(d => !isNaN(d.value)),
            { y: "人数" }
          )
        : [],
    [dataByDate, selectedType]
  );

  const select = dataByDate
    ? {
        date: selectedDate,
        value: dataByDate.get(selectedDate)
          ? dataByDate.get(selectedDate)[selectedType]
          : undefined
      }
    : {};

  const [tip, setTip] = useState({ ...select, hide: true });

  const color = type => colors[type];
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

  const valid = d => d.value !== undefined && d.value !== "" && !isNaN(d.value);
  const formatDate = d3.timeFormat("%x");

  function onUpdateTip(e) {
    const date = x.invert(elX + margin.left);
    const bisectDate = d3.bisector(d => d.date);
    const i = bisectDate.left(data, date, 0, data.length - 1),
      next = data[i];
    setTip({ ...tip, ...next });
  }

  function onUpdateDate(e) {
    const { date } = tip;
    date && setSelectedDate(date.getTime());
  }

  function noData(data) {
    return data.filter(({ value }) => !isNaN(value)).length === 0;
  }

  useEffect(() => {
    d3.select(".yAxis").call(yAxis);
    d3.select(".xAxis").call(xAxis);
  });

  return (
    <Svg
      viewBox={[0, 0, width, height]}
      loading={loading}
      nodata={noData(data)}
      stokeLinejoin="round"
      strokeLinecap="round"
      onMouseOver={() => tip.hide && setTip({ ...tip, hide: false })}
      onMouseEnter={() => setTip({ ...tip, hide: false })}
      onMouseLeave={() => setTip({ ...tip, hide: true })}
      {...rest}
    >
      <path
        d={line(data)}
        fill="none"
        strokeWidth={2}
        stroke={color(selectedType)}
      />
      <g className="yAxis" transform={`translate(${margin.left}, 0)`}></g>
      <g
        className="xAxis"
        transform={`translate(0, ${height - margin.bottom})`}
      ></g>
      {valid(select) && (
        <circle
          cx={x(select.date)}
          cy={y(select.value)}
          r={4}
          fill={color(selectedType)}
        />
      )}
      <g
        fill="currentColor"
        transform={`translate(${width - margin.right - 110}, ${height -
          margin.top -
          25})`}
      >
        <text>{`日期:${formatDate(select.date)}`}</text>
        <text y="1.25em">{`人数:${
          valid(select) ? select.value : "暂无数据"
        }`}</text>
      </g>
      <rect
        ref={ref}
        x={margin.left}
        y={margin.top}
        width={width - margin.left - margin.right}
        height={height - margin.top - margin.bottom}
        fill="transparent"
        onMouseMove={onUpdateTip}
        onClick={onUpdateDate}
      />
      {valid(tip) && !tip.hide && (
        <>
          <line
            x1={x(tip.date)}
            y1={margin.top}
            x2={x(tip.date)}
            y2={height - margin.bottom}
            onClick={onUpdateDate}
            stroke="currentColor"
          ></line>
          <title>{`${formatDate(tip.date)}:${tip.value}`}</title>
        </>
      )}
    </Svg>
  );
}
