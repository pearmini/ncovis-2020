import React, { useEffect, useMemo, useRef } from "react";
import Svg from "./Svg";
import * as d3 from "d3";
import mouse from "../utils/mouse";
export default function({
  loading,
  dataByDate,
  selectedTime,
  selectedType = "confirm",
  selectedLevel = "top",
  range,
  setSelectedTime
}) {
  const ref = useRef(null);
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

  const all = useMemo(
      () =>
        Array.from(dataByDate).map(([date, data]) => ({
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
            .reduce((obj, { region, data }) => ((obj[region] = data), obj), {})
        })),
      [dataByDate, selectedLevel]
    ),
    data = useMemo(
      () =>
        all.map(d =>
          Object.keys(d).reduce(
            (obj, key) => (
              (obj[key] = key === "date" ? d[key] : d[key][selectedType]), obj
            ),
            {}
          )
        ),
      [dataByDate, selectedType, selectedLevel]
    ),
    [first] = data,
    keys = first ? Object.keys(first).filter(d => d !== "date") : [];

  const series = d3.stack().keys(keys)(data);

  const x = d3
    .scaleTime()
    .domain(range.map(d => new Date(d)))
    .range([0, width - margin.right - margin.left]);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(series, d => d3.max(d, d => d[1]))])
    .nice()
    .range([height - margin.bottom - margin.top, 0]);

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

  function handleClickPath(e) {
    const [mouseX] = mouse(e, ref.current);
    const time = x.invert(mouseX).getTime();
    setSelectedTime(time);
  }

  function noData(data) {
    return (
      !data ||
      data.length === 0 ||
      data.some(d =>
        Object.keys(d).some(key => d[key] === undefined || isNaN(d[key]))
      )
    );
  }

  useEffect(() => {
    const xAxis = d3.axisBottom(x);
    const yAxis = g =>
      g.call(d3.axisLeft(y)).call(g => g.select(".domain").remove());
    d3.select(".area-xAxis").call(xAxis);
    d3.select(".area-yAxis").call(yAxis);
  }, [data]);

  return (
    <>
      {noData(data) ? (
        <Svg
          viewBox={[0, 0, width, height]}
          loading={loading}
          nodata={true}
        ></Svg>
      ) : (
        <Svg viewBox={[0, 0, width, height]} loading={loading}>
          <g
            cursor="pointer"
            ref={ref}
            onClick={handleClickPath}
            transform={`translate(${margin.left}, ${margin.top})`}
          >
            {series.map(s => (
              <path key={s.key} fill={color(s.key)} d={area(s)} />
            ))}
            <line
              x1={x(new Date(selectedTime))}
              y1={0}
              x2={x(new Date(selectedTime))}
              y2={height - margin.bottom - margin.top}
              stroke="currentColor"
            />
          </g>
          <g
            className="area-xAxis"
            transform={`translate(${margin.left}, ${height - margin.bottom})`}
          />
          <g
            className="area-yAxis"
            transform={`translate(${margin.left}, ${margin.top})`}
          />
        </Svg>
      )}
    </>
  );
}
