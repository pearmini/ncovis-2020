import React, { useState, useEffect } from "react";
import Svg from "./Svg";
import regionsData from "../assets/data/region_options.json";
import * as d3All from "d3";
import * as d3Array from "d3-array";

const d3 = {
  ...d3All,
  ...d3Array
};
function find(source, cb) {
  let target;
  eachBefore(source, d => {
    if (cb(d)) target = d;
  });
  return target;
}

function eachBefore(node, cb) {
  node.children && node.children.forEach(d => eachBefore(d, cb));
  cb(node);
}

export default function({
  dataByRegion,
  all,
  selectedRegion,
  selectedDate,
  setSelectedDate,
  setSelectedRegion,
  selectedType,
  range,
  loading
}) {
  const width = 1200,
    treeW = 150,
    matrixW = width - treeW,
    height = 600,
    margin = { top: 40, right: 30, bottom: 30, left: 60 },
    colors = {
      dead: d3.interpolateBuPu,
      confirm: d3.interpolatePuRd,
      cue: d3.interpolateYlGn,
      suspect: d3.interpolateOrRd
    };

  const [regions, setRegions] = useState(regionsData);
  const root = tree(regions);
  const visableNodes = new Set(
    root
      .descendants()
      .filter(
        d => !d.data.hide && (!d.children || d.children.every(d => d.data.hide))
      )
      .map(d => d.data.title)
  );
  const data = all
    .map(d => ({
      region: d.region,
      date: new Date(d.date),
      value: d.data[selectedType]
    }))
    .filter(d => visableNodes.has(d.region));

  let maxtirxLeft = -1,
    cellWidth = Infinity,
    nodeByTitle = d3.rollup(
      root.descendants(),
      ([d]) => d,
      d => d.data.title
    );
  root.each(d => !d.data.hide && (maxtirxLeft = Math.max(maxtirxLeft, d.y)));
  d3.pairs(root.leaves()).forEach(([a, b]) => {
    cellWidth = Math.min(cellWidth, Math.abs(a.x - b.x));
  });

  const days = Array.from(new Set(data.map(d => d.date.getTime())));
  const x = d3
    .scaleBand()
    .domain(days)
    .range([0, matrixW - margin.right - 120]);

  const y = title => {
    const node = nodeByTitle.get(title);
    if (!node.children) return node.x;
    return d3.min(node.children, d => d.x);
  };

  const formatDate = d3.timeFormat("%x");

  const cellHeight = title => {
    const node = nodeByTitle.get(title);
    if (!node.children) return cellWidth;
    const [a, b] = d3.extent(node.children, d => d.x);
    return Math.abs(a - b) + cellWidth;
  };

  const color = value => {
    const scale = d3
      .scaleSequential(colors[selectedType])
      .domain(d3.extent(data, d => d.value));
    return scale(value);
  };

  const pathLink = d3
    .linkHorizontal()
    .x(d => d.y)
    .y(d => d.x);

  function tree(data) {
    const root = d3.hierarchy(data);
    return d3
      .tree()
      .size([height - margin.top - margin.bottom, treeW])
      .separation((a, b) => (a.parent === b.parent ? 1 : 1))(root);
  }

  function handleClick({ data }) {
    const node = find(regions, d => d.title === data.title);
    node.children &&
      node.children.forEach(n =>
        eachBefore(n, d => (d.hide = !(d.hide | false)))
      );
    setRegions({ ...regions });
  }

  function noData(data) {
    return data.filter(({ value }) => !isNaN(value)).length === 0;
  }

  useEffect(() => {
    // const xAxis = g =>
    //   g
    //     .call(
    //       d3
    //         .axisBottom(x)
    //         .ticks(width / 50)
    //         .tickSizeOuter(0)
    //     )
    //     .call(g => g.selectAll("text").attr("transform", `rotate(-15)`));
    // d3.select(".treeMatrix-xAxis").call(xAxis);
  });

  return (
    <Svg
      viewBox={[0, 0, width, height]}
      loading={loading}
      nodata={noData(data)}
    >
      <g transform={`translate(${margin.left}, ${margin.top})`}>
        {root.descendants().map(node => (
          <g
            key={node.data.title}
            transform={`translate(${node.y}, ${node.x})`}
            style={{
              display: node.data.hide && "none"
            }}
          >
            <circle
              r={2.5}
              onClick={() => handleClick(node)}
              cursor="pointer"
            ></circle>
            <text
              dy="0.31em"
              x={
                node.children && node.children.every(d => !d.data.hide) ? -6 : 6
              }
              textAnchor={
                node.children && node.children.every(d => !d.data.hide)
                  ? "end"
                  : "start"
              }
              fill="currentColor"
            >
              {node.data.title}
            </text>
          </g>
        ))}
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
        <g transform={`translate(${maxtirxLeft + 80}, ${-cellWidth / 2})`}>
          <g>
            {data.map(d => (
              <rect
                key={d.region + d.date.toString()}
                x={x(d.date.getTime()) - 0.5}
                y={y(d.region) - 0.5}
                width={x.bandwidth() - 1}
                height={cellHeight(d.region) - 1}
                fill={color(d.value)}
                cursor="pointer"
              >
                <title>{`${d.region}:${d.value}(${formatDate(d.date)})`}</title>
              </rect>
            ))}
          </g>
          <g
            className="treeMatrix-xAxis"
            transform={`translate(0, ${height -
              margin.bottom -
              margin.top +
              10})`}
          ></g>
        </g>
      </g>
    </Svg>
  );
}
