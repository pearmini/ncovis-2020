import React, { useEffect, useMemo, useRef, useState } from "react";
import Svg from "./Svg";
import * as d3 from "d3";
import mouse from "../utils/mouse";
import Tooltip from "./Tooltip";
export default function({
  loading,
  dataByDate,
  selectedTime,
  selectedType = "confirm",
  selectedLevel = "top",
  setSelectedTime,
  focus,
  setFocus,
  running
}) {
  const ref = useRef(null);
  const width = 1200,
    height = 300,
    margin = { top: 30, right: 40, bottom: 25, left: 90 },
    formatDate = d3.timeFormat("%x"),
    bisect = d3.bisector(d => d.date).left;

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

  const [highlight, setHighlight] = useState(""),
    [tip, setTip] = useState(null);

  const all = useMemo(
      () =>
        Array.from(dataByDate).map(([date, data]) => ({
          date: new Date(date),
          ...data
            .filter(({ region }) => {
              if (selectedLevel === "top") {
                return region === "中国";
              } else if (selectedLevel === "second") {
                return secondLevelSet.has(region);
              } else {
                return region !== "中国" && !secondLevelSet.has(region);
              }
            })
            .reduce((obj, { region, data }) => ((obj[region] = data), obj), {})
        })),
      [dataByDate, selectedLevel]
    ),
    data = useMemo(
      () =>
        all
          .map(d =>
            Object.keys(d).reduce((obj, key) => {
              if (key === "date") {
                obj[key] = d[key];
              } else if (focus === "" || focus === key) {
                obj[key] = d[key][selectedType];
              }
              return obj;
            }, {})
          )
          .sort((a, b) => a.date - b.date),
      [all, selectedType, focus]
    ),
    [first] = data,
    keys = first ? Object.keys(first).filter(d => d !== "date") : [],
    cnt = selectedLevel === "second" ? 4 : 6,
    legendWidth = selectedLevel === "second" ? 75 : 50,
    legendHeight = 25,
    disableColor = "#efefef",
    tw = selectedLevel === "second" ? 100 : 70,
    th = 20,
    tipW = Math.max(tw * Math.ceil(keys.length / cnt), 100),
    tipH = Math.min(keys.length, cnt) * th + 30;

  const series = d3.stack().keys(keys)(data);

  const x = d3
    .scaleTime()
    .domain(d3.extent(data, d => new Date(d.date)))
    .range([0, width - margin.right - margin.left]);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(series, d => d3.max(d, d => d[1]))])
    .nice()
    .range([height - margin.bottom - margin.top, 0]);

  const legendX = index => ((index / cnt) | 0) * legendWidth;
  const legendY = index => (index % cnt) * legendHeight;
  const tipX = index => ((index / cnt) | 0) * tw;
  const tipY = index => (index % cnt) * th;

  const lineX = () => {
    if (running) return x(new Date(selectedTime));
    if (tip) return x(tip.time);
    return x(new Date(0));
  };

  const area = d3
    .area()
    .x(d => x(d.data.date))
    .y0(d => y(d[0]))
    .y1(d => y(d[1]));

  const colorScale =
    keys.length === 1
      ? () => "#61d4b3"
      : d3
          .scaleOrdinal()
          .domain(keys)
          .range(d3.quantize(d3.interpolateSpectral, keys.length).reverse());

  const color = key =>
    highlight === "" || key === highlight ? colorScale(key) : disableColor;

  const stroke = key =>
    selectedLevel === "top" ? d3.color(color(key)).darker() : "none";

  const introduction = (
    <div>
      <h3>说明</h3>
      <p>如果某个地区的数据长时间没有变化，可能是因为数据缺失。</p>
      <h3>交互</h3>
      <ul>
        <li>
          <b>鼠标移动到</b>某个地区的名字上，会高亮该地区所对应的“带子”.
          <b>鼠标移出后</b>会取消高亮。
        </li>
        <li>
          <b>单击</b>某个地区的名字，进入该地区所对应的<b>普通面积图</b>。
          <b>双击</b>空白部分返回。
        </li>
      </ul>
    </div>
  );

  function handleChangeSelectedTime(e) {
    const [mouseX] = mouse(e, ref.current);
    const time = x.invert(mouseX).getTime();
    setSelectedTime(time);
  }

  function handleChangeTip(e) {
    const [mouseX, mouseY] = mouse(e, ref.current);
    const time = x.invert(mouseX).getTime();
    const i = bisect(data, new Date(time), 0, data.length - 1),
      a = data[i];
    setTip({ ...a, time, x: mouseX, y: mouseY });
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
        <Svg
          viewBox={[0, 0, width, height]}
          loading={loading}
          onDoubleClick={() => setFocus("")}
          onMouseLeave={() => setHighlight("")}
          introduction={introduction}
          title="堆叠面积图"
        >
          <g
            cursor="pointer"
            ref={ref}
            transform={`translate(${margin.left}, ${margin.top})`}
            onMouseLeave={() => setTip(null)}
          >
            <g onMouseMove={handleChangeTip} onClick={handleChangeSelectedTime}>
              {series.map(s => (
                <path
                  key={s.key}
                  fill={color(s.key)}
                  d={area(s)}
                  stroke={stroke(s.key)}
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              ))}
            </g>
            <line
              x1={lineX()}
              y1={0}
              x2={lineX()}
              y2={height - margin.bottom - margin.top}
              stroke="currentColor"
            />
            <g transform={`translate(${20},${5})`}>
              <rect
                onMouseLeave={() => setHighlight("")}
                x={-10}
                y={-10}
                fill="transparent"
                width={legendWidth * Math.ceil(keys.length / cnt)}
                height={Math.min(keys.length, cnt) * legendHeight}
              ></rect>
              {keys.map((key, index) => (
                <g
                  key={key}
                  transform={`translate(${legendX(index)}, ${legendY(index)})`}
                  onMouseEnter={() => setHighlight(key)}
                  onClick={e => {
                    setFocus(key);
                    setHighlight("");
                    e.stopPropagation();
                  }}
                >
                  <circle fill={color(key)} cx={0} cy={0} r={5}></circle>
                  <text dy={5} dx={10} fill="currentColor" fontSize="11">
                    {key}
                  </text>
                </g>
              ))}
            </g>
            {tip && (
              <Tooltip
                extent={[
                  0,
                  0,
                  width - margin.left - margin.right,
                  height - margin.top - margin.bottom
                ]}
                size={[tipW, tipH]}
                pos={[tip.x, 10]}
              >
                {(x, y) => (
                  <g transform={`translate(${x}, ${y})`}>
                    <rect
                      width={tipW}
                      height={tipH}
                      rx={10}
                      ry={10}
                      fill="white"
                      stroke="currentColor"
                    ></rect>
                    <text dx={10} dy={20}>
                      {formatDate(tip.date)}
                    </text>
                    <g transform={`translate(10, 40)`}>
                      {Object.keys(tip)
                        .filter(
                          d =>
                            d !== "time" &&
                            d !== "x" &&
                            d !== "y" &&
                            d !== "date"
                        )
                        .sort((a, b) => tip[b] - tip[a])
                        .map((key, index) => (
                          <text
                            fontSize="10"
                            key={key}
                            x={tipX(index)}
                            y={tipY(index)}
                          >{`${key}: ${tip[key]}`}</text>
                        ))}
                    </g>
                  </g>
                )}
              </Tooltip>
            )}
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
