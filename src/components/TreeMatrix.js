import React, { useState, useEffect, useMemo } from "react";
import Svg from "./Svg";
import regionsData from "../assets/data/region_options.json";
import * as d3All from "d3";
import * as d3Array from "d3-array";
import {
  find,
  eachBefore,
  filter,
  treeHeight,
  hasChildren
} from "../utils/tree";

const d3 = {
  ...d3All,
  ...d3Array
};

export default function({
  dataByRegion,
  selectedRegion,
  selectedDate,
  setSelectedDate,
  setSelectedRegion,
  selectedType,
  loading
}) {
  const [regions, setRegions] = useState(regionsData),
    visableRegions = new Set(
      filter(regions, d => !d.hide && !hasChildren(d, d => !d.hide)).map(
        d => d.title
      )
    ),
    th = treeHeight(regions);

  const all = useMemo(
      () =>
        dataByRegion
          ? Array.from(dataByRegion).flatMap(([region, dataByDate]) =>
              d3
                .pairs(
                  Array.from(dataByDate).map(([date, data]) => ({
                    date: new Date(date),
                    data: data.data
                  }))
                )
                .map(([a, b]) => ({
                  region,
                  date: new Date(b.date),
                  ...Object.keys(b.data).reduce(
                    (obj, key) => ((obj[key] = b.data[key] - a.data[key]), obj),
                    {}
                  )
                }))
            )
          : [],
      [dataByRegion]
    ),
    data = all
      .map(d => ({
        date: d.date,
        region: d.region,
        value: d[selectedType]
      }))
      .filter(({ value }) => !isNaN(value) && value !== "")
      .filter(d => visableRegions.has(d.region)),
    days = Array.from(new Set(data.map(d => d.date.getTime())));

  const width = 1200,
    height = 600,
    margin = { top: 50, right: 30, bottom: 20, left: 60 },
    maxCellWidth = 15,
    padding = 80,
    nodeWidth = 100,
    treeW = nodeWidth * th,
    maxMatrixWidth = width - margin.left - margin.right - padding - treeW,
    matrixWidth = Math.min(days.length * maxCellWidth, maxMatrixWidth),
    colors = {
      dead: d3.interpolateBuPu,
      confirm: d3.interpolatePuRd,
      cue: d3.interpolateYlGn,
      suspect: d3.interpolateOrRd
    },
    highlightColor = "red",
    normalColor = "black",
    highlightRectColor = "steelblue",
    buttonSize = 20,
    legendWidth = 150,
    legendHeight = 10,
    formatDate = d3.timeFormat("%x");

  const root = tree(regions),
    cellHeight = d3
      .pairs(root.leaves())
      .reduce(
        (total, [a, b]) => Math.min(total, Math.abs(a.x - b.x)),
        Infinity
      ),
    nodeByTitle = d3.rollup(
      root.descendants(),
      ([d]) => d,
      d => d.data.title
    );

  function tree(data) {
    const root = d3.hierarchy(data);
    return d3
      .tree()
      .size([height - margin.top - margin.bottom, treeW])
      .separation((a, b) => (a.parent === b.parent ? 1 : 1.5))(root);
  }

  const x = d3
    .scaleBand()
    .domain(days)
    .range([0, matrixWidth]);

  const y = title => {
    const node = nodeByTitle.get(title);
    if (!node.children) return node.x;
    return d3.min(node.children, d => d.x);
  };

  const h = title => {
    const node = nodeByTitle.get(title);
    if (!node.children) return cellHeight;
    const [a, b] = d3.extent(node.children, d => d.x);
    return Math.abs(a - b) + cellHeight;
  };

  const color = d3
    .scaleSequential(colors[selectedType])
    .domain(d3.extent(data, d => d.value));

  const pathLink = d3
    .linkHorizontal()
    .x(d => d.y)
    .y(d => d.x);

  const stroke = d3
    .scaleSequential(colors[selectedType])
    .domain([0, legendWidth]);

  function handleClickNode({ data }) {
    const node = find(regions, d => d.title === data.title);
    setSelectedRegion(node.title);
    if (!node.children || !node.children.length) return;
    const { hideChildren } = node;
    if (hideChildren) {
      // 如果要展开孩子，只展开一层
      node.children.forEach(n => (n.hide = false));
    } else {
      // 如果要隐藏孩子，隐藏所有的
      node.children.forEach(n =>
        eachBefore(n, d => (d.hide = d.hideChildren = true))
      );
    }

    node.hideChildren = !node.hideChildren;
    setRegions({ ...regions });
  }

  function isSelect(d) {
    return selectedRegion === d.region && selectedDate === d.date.getTime();
  }

  function handleClickRect({ region, date }) {
    setSelectedRegion(region);
    setSelectedDate(date.getTime());
  }

  function noData(data) {
    return data.filter(({ value }) => !isNaN(value)).length === 0;
  }

  useEffect(() => {
    // 绘制坐标轴
    const scaleTime = d3
      .scaleTime()
      .domain(d3.extent(days).map(d3.timeDay))
      .range([0, maxMatrixWidth]);

    const scaleLegend = d3
      .scaleLinear()
      .domain(color.domain())
      .range([0, legendWidth]);

    const legendAxis = d3
      .axisBottom(scaleLegend)
      .ticks(legendWidth / 50)
      .tickSizeOuter(0);

    const xAxis = d3.axisBottom(scaleTime).tickSizeOuter(0);

    d3.select(".tree-xAxis").call(xAxis);
    d3.select(".tree-legend").call(legendAxis);
  });

  const minusButton = (
    <svg
      t="1583216776327"
      className="icon"
      viewBox="0 0 1024 1024"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      p-id="1313"
      width={buttonSize}
      height={buttonSize}
    >
      <path
        d="M512 128c211.968 0 384 172.032 384 384s-172.032 384-384 384-384-172.032-384-384 172.032-384 384-384z m-187.221333 425.6h371.2a41.6 41.6 0 1 0 0-83.2h-371.2a41.6 41.6 0 0 0 0 83.2z"
        p-id="1314"
      ></path>
    </svg>
  );

  const plusButton = (
    <svg
      t="1583216820149"
      className="icon"
      viewBox="0 0 1024 1024"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      p-id="1443"
      width={buttonSize}
      height={buttonSize}
    >
      <path
        d="M458.922667 503.210667H314.965333a41.6 41.6 0 1 0 0 83.2h143.957334v144a41.6 41.6 0 0 0 83.2 0v-144h144a41.6 41.6 0 0 0 0-83.2h-144V359.253333a41.6 41.6 0 0 0-83.2 0v143.957334zM502.186667 160.853333c211.968 0 384 172.032 384 384s-172.032 384-384 384-384-172.032-384-384 172.032-384 384-384z"
        p-id="1444"
      ></path>
    </svg>
  );

  return (
    <Svg
      viewBox={[0, 0, width, height]}
      loading={loading}
      nodata={noData(data)}
    >
      <g
        transform={`translate(${width -
          margin.right -
          legendWidth -
          10}, ${margin.top / 2})`}
      >
        {d3.range(0, legendWidth).map(l => (
          <line
            key={l}
            x1={l}
            y1={-legendHeight / 2}
            x2={l}
            y2={legendHeight / 2}
            stroke={stroke(l)}
          />
        ))}
        <g
          className="tree-legend"
          transform={`translate(0, ${legendHeight / 2})`}
        ></g>
      </g>
      <g transform={`translate(${margin.left}, ${margin.top})`}>
        {root.links().map((link, index) => (
          <path
            style={{
              display: link.target.data.hide && "none"
            }}
            key={index}
            fill="none"
            stroke="#555"
            strokeOpacity={0.4}
            strokeWidth={1.5}
            d={pathLink(link)}
          ></path>
        ))}
        {root.descendants().map(node => (
          <g
            key={node.data.title}
            transform={`translate(${node.y}, ${node.x})`}
            style={{
              display: node.data.hide && "none"
            }}
            fill={
              selectedRegion === node.data.title ? highlightColor : normalColor
            }
            onClick={() => handleClickNode(node)}
            cursor="pointer"
          >
            <circle r={3}></circle>
            <text
              dy="0.31em"
              x={hasChildren(node, d => !d.data.hide) ? -6 : 6}
              textAnchor={
                hasChildren(node, d => !d.data.hide) ? "end" : "start"
              }
            >
              {node.data.title}
            </text>
          </g>
        ))}
      </g>
      <g
        transform={`translate(${width -
          margin.right -
          maxMatrixWidth}, ${margin.top - cellHeight / 2})`}
      >
        <g>
          {data.map(d => (
            <rect
              key={d.region + d.date.toString()}
              x={x(d.date.getTime()) - 1}
              y={y(d.region) - 1}
              width={x.bandwidth() - 2}
              height={h(d.region) - 2}
              fill={color(d.value)}
              cursor="pointer"
              onClick={() => handleClickRect(d)}
              stroke={isSelect(d) ? highlightRectColor : "none"}
              strokeWidth={isSelect(d) ? 3 : 0}
            >
              <title>{`${d.region}:${d.value}(${formatDate(d.date)})`}</title>
            </rect>
          ))}
          <g
            className="tree-xAxis"
            transform={`translate(0, ${height -
              margin.bottom -
              margin.top +
              3})`}
          ></g>
        </g>
      </g>
    </Svg>
  );
}
