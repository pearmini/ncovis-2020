import React, { useState, useEffect} from "react";
import Svg from "./Svg";
import regionsData from "../assets/data/region_options.json";
import * as d3All from "d3";
import * as d3Array from "d3-array";

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
  loading,
  show,
  setShow,
  width,
  height,
  colors,
  all,
  highlightColor,
  normalColor,
  highlightRectColor,
  disabledColor,
  legendWidth,
  legendHeight
}) {
  if (!dataByRegion.size)
    return (
      <Svg
        viewBox={[0, 0, width, height]}
        loading={loading}
        nodata={true}
        show={show}
      ></Svg>
    );

  const [treeData, setTreeData] = useState(d3.hierarchy(regionsData));
  const [highlight, setHighlight] = useState([]);
  treeData.eachAfter(node => {
    node.visableH =
      node.children && !node.hideChildren
        ? d3.max(node.children, d => d.visableH) + 1
        : 0;
  });
  const descendants = treeData.descendants(),
    visableRegions = new Set(
      descendants
        .filter(d => !d.hide && (!d.children || d.hideChildren))
        .map(d => d.data.title)
    ),
    layers = d3
      .groups(descendants, d => d.depth)
      .filter(
        ([depth, data]) =>
          depth !== treeData.height && depth !== 0 && data.every(d => !d.hide)
      ),
    th = treeData.visableH;

  const data = all
      .map(d => ({
        date: d.date,
        region: d.region,
        value: d[selectedType]
      }))
      .filter(({ value }) => !isNaN(value) && value !== "")
      .filter(d => visableRegions.has(d.region)),
    days = new Set(data.map(d => d.date));

  const hset = new Set(highlight.map(d => d.data.title));
  const colorData = highlight.length
    ? data.filter(d => hset.has(d.region))
    : data;

  const margin = { top: 50, right: 30, bottom: 30, left: 60 },
    chartPadding = 90,
    nodeWidth = 100,
    buttonSize = 15,
    axisPadding = 5,
    formatDate = d3.timeFormat("%x"),
    labels = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "June",
      "July",
      "Aug",
      "Sept",
      "Oct",
      "Nov",
      "Dec"
    ],
    treeW = nodeWidth * th,
    treeH = height - margin.top - margin.bottom - axisPadding,
    matrixWidth = width - margin.left - margin.right - chartPadding - treeW;

  const tree = d3
      .tree()
      .size([treeH, treeData.height * nodeWidth])
      .separation((a, b) => (a.parent === b.parent ? 1 : 1.5)),
    root = tree(treeData),
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

  const x = d3
    .scaleBand()
    .domain(Array.from(days))
    .range([0, matrixWidth]);

  const y = title => {
    const node = nodeByTitle.get(title);
    if (!node.children) return node.x;
    let x0 = Infinity;
    node.each(d => {
      if (d.x < x0) x0 = d.x;
    });
    return x0;
  };

  const h = title => {
    const node = nodeByTitle.get(title);
    if (!node.children) return cellHeight;
    let x0 = Infinity;
    let x1 = -x0;
    node.each(d => {
      if (d.x > x1) x1 = d.x;
      if (d.x < x0) x0 = d.x;
    });
    return x1 - x0 + cellHeight;
  };

  const colorScale = d3.scaleSequential(colors[selectedType]).domain(
    d3.extent(
      colorData.filter(d => d.region !== "湖北" && d.region !== "华中地区"),
      d => d.value
    )
  );

  const specialColorScale = d3.scaleSequential(colors.special).domain(
    d3.extent(
      colorData.filter(d => d.region === "湖北" || d.region === "华中地区"),
      d => d.value
    )
  );

  const color = node => {
    if (highlight.length && !hset.has(node.region)) return disabledColor;
    if (node.region === "湖北" || node.region === "华中地区")
      return specialColorScale(node.value);
    return colorScale(node.value);
  };

  const pathLink = d3
    .linkHorizontal()
    .x(d => d.y)
    .y(d => d.x);

  const stroke = d3
    .scaleSequential(colors[selectedType])
    .domain([0, legendWidth]);

  const strokeSpecial = d3
    .scaleSequential(colors.special)
    .domain([0, legendWidth]);

  useEffect(() => {
    // 绘制坐标轴
    const scaleLegend = d3
      .scaleLinear()
      .domain(colorScale.domain())
      .range([0, legendWidth]);

    const specialScaleLegend = d3
      .scaleLinear()
      .domain(specialColorScale.domain())
      .range([0, legendWidth]);

    const legendAxis = d3
      .axisBottom(scaleLegend)
      .ticks(legendWidth / 50)
      .tickSizeOuter(0);

    const specialLegendAxis = d3
      .axisBottom(specialScaleLegend)
      .ticks(legendWidth / 50)
      .tickSizeOuter(0);

    const xAxis = d3
      .axisBottom(x)
      .tickSizeOuter(0)
      .tickFormat(time => {
        const date = new Date(time).getDate();
        if (date !== 1) return date;
        const month = new Date(time).getMonth();
        return labels[month];
      });

    d3.select(".tree-xAxis")
      .call(xAxis)
      .call(g =>
        g
          .selectAll("text")
          .filter(function() {
            const label = d3.select(this).text();
            return labels.indexOf(label) !== -1;
          })
          .attr("font-weight", "bold")
          .attr("dy", "2em")
      );

    d3.select(".tree-legend").call(legendAxis);
    d3.select(".tree-legend-special").call(specialLegendAxis);

    // animation
    const t = d3.transition().duration(200);
    d3.selectAll(
      ".grid, .tree-legend, .tree-line, .tree-xAxis, .tree-xAxis, .tree-btn, .tree-legend-special"
    )
      .transition(t)
      .attr("stroke-opacity", 1)
      .attr("fill-opacity", 1);
  });

  function toggleHighlightNode(node) {
    if (!node.parent) return;

    const old = highlight.find(d => d.data.title === node.data.title);
    const hasChildren = highlight.some(
      d => d.parent.data.title === node.data.title
    );
    if (old || hasChildren) {
      const deleteNodes = node.hideChildren ? [node] : node.leaves();
      for (let d of deleteNodes) {
        const index = highlight.indexOf(d);
        highlight.splice(index, 1);
      }
    } else {
      node.hideChildren
        ? highlight.push(node)
        : highlight.push(...node.leaves());
    }
    setHighlight([...highlight]);
    setSelectedRegion(node.data.title);
  }

  async function toggleNode(node) {
    if (!node.children) return;
    // animation
    const t = d3
      .transition()
      .duration(250)
      .ease(d3.easeExpOut);
    node.hideChildren
      ? animateShowChildren(node, t)
      : animateHideChildren(node, t);
    !node.hideChildren && node.depth === 0 && animateHideButton(t);
    animateHideLegend(t);
    await t.end();

    // update data
    node.hideChildren ? showChildren(node) : hideChildren(node);

    // upadte view
    const newTreeData = copyTree();
    setTreeData(newTreeData);
    setHighlight([]);
  }

  async function toggleNodes(nodes) {
    // animation
    const t = d3
      .transition()
      .duration(250)
      .ease(d3.easeExpOut);

    const validNodes = nodes.filter(node => node.children);
    const allHide = validNodes.every(d => d.hideChildren);
    allHide
      ? validNodes.forEach(d => animateShowChildren(d, t))
      : validNodes
          .filter(d => !d.hideChildren)
          .forEach(d => animateHideChildren(d, t));
    animateHideLegend(t);
    animateHideAxis(t);
    await t.end();

    // update data
    allHide
      ? validNodes.forEach(showChildren)
      : validNodes.filter(d => !d.hideChildren).forEach(hideChildren);

    // update view
    const newTreeData = copyTree();
    setTreeData(newTreeData);
    setHighlight([]);
  }

  function animateHideButton(t) {
    d3.select(".tree-btn")
      .transition(t)
      .attr("fill-opacity", 0);
  }

  function animateHideLegend(t) {
    // 坐标轴和 legend
    d3.selectAll(".tree-legend, .tree-line, .tree-legend-special")
      .transition(t)
      .attr("stroke-opacity", 0)
      .attr("fill-opacity", 0);
  }

  function animateHideAxis(t) {
    d3.select(".tree-xAxis")
      .transition(t)
      .attr("stroke-opacity", 0)
      .attr("fill-opacity", 0);
  }

  function animateHideChildren(node, t) {
    const text = d3.select(`#node-${node.data.title} text`).node();
    const { width } = text.getBBox();
    d3.select(`#node-${node.data.title} text`)
      .transition(t)
      .attr("x", width + 8);

    node.each(d => {
      if (node.data.title === d.data.title) return;

      // node
      d3.select(`#node-${d.data.title}`)
        .attr("fill-opacity", 1)
        .transition(t)
        .attr("transform", `translate(${node.y}, ${node.x})`)
        .attr("fill-opacity", 0);

      // link
      d3.select(`#link-${d.data.title}`)
        .transition(t)
        .attr("d", () => {
          const o = { x: node.x, y: node.y };
          return pathLink({ source: o, target: o });
        });

      // rect
      d3.selectAll(`.grid-${d.data.title}`)
        .transition(t)
        .attr("stroke-opacity", 0)
        .attr("fill-opacity", 0);
    });
  }

  function animateShowChildren(node, t) {
    const text = d3.select(`#node-${node.data.title} text`).node();
    const { width } = text.getBBox();
    d3.select(`#node-${node.data.title} text`)
      .transition(t)
      .attr("x", -width - 8);

    d3.selectAll(`.grid-${node.data.title} `)
      .transition(t)
      .attr("stroke-opacity", 0)
      .attr("fill-opacity", 0);

    // 移动到目的位置
    node.each(d => {
      if (node.data.title === d.data.title) return;
      d3.select(`#node-${d.data.title}`)
        .transition(t)
        .attr("transform", `translate(${d.y}, ${d.x})`)
        .attr("fill-opacity", 1);

      d3.select(`#link-${d.data.title}`)
        .transition(t)
        .attr("stroke-opacity", 0.4)
        .attr("d", () => {
          const o = { x: d.x, y: d.y };
          const s = { x: d.parent.x, y: d.parent.y };
          return pathLink({ source: s, target: o });
        });
    });
  }

  function hideChildren(node) {
    node.hideChildren = true;
    node.each(child => {
      if (child.data.title === node.data.title) return;
      child.hide = true;
    });
  }

  function showChildren(node) {
    node.hideChildren = false;
    node.eachBefore(child => {
      if (child.data.title === node.data.title) return;
      child.hide = false;
      child.hideChildren = false;
    });
  }

  function copyTree() {
    // 这里必须要拷贝一份，否者很麻烦
    const newTreeData = d3.hierarchy(regionsData);
    newTreeData.each(node => {
      const old = nodeByTitle.get(node.data.title);
      node.hideChildren = old.hideChildren;
      node.hide = old.hide;
    });
    return newTreeData;
  }

  function isSelect(d) {
    return selectedRegion === d.region && selectedDate === d.date;
  }

  function handleClickRect({ region, date }) {
    setSelectedRegion(region);
    setSelectedDate(date);
  }

  function noData(data) {
    return data.filter(({ value }) => !isNaN(value)).length === 0;
  }

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
      cursor="pointer"
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
      cursor="pointer"
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
      loading={loading && noData(data)}
      nodata={noData(data)}
      onClick={() => setHighlight([])}
      show={show}
    >
      <g
        transform={`translate(${width -
          margin.right -
          legendWidth -
          10}, ${margin.top / 2})`}
      >
        {d3.range(0, legendWidth).map(l => (
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
          className="tree-legend"
          transform={`translate(0, ${legendHeight / 2})`}
        ></g>
        <text textAnchor="end" fill="currentColor" dy="0.31em" dx={-10}>
          其他地区
        </text>
      </g>
      {th && (
        <g
          transform={`translate(${width -
            margin.right -
            legendWidth -
            legendWidth -
            100}, ${margin.top / 2})`}
        >
          {d3.range(0, legendWidth).map(l => (
            <line
              className="tree-line"
              key={l}
              x1={l}
              y1={-legendHeight / 2}
              x2={l}
              y2={legendHeight / 2}
              stroke={strokeSpecial(l)}
            />
          ))}
          <g
            className="tree-legend-special"
            transform={`translate(0, ${legendHeight / 2})`}
          ></g>
          <text textAnchor="end" fill="currentColor" dy="0.31em" dx={-10}>
            华中或湖北地区
          </text>
        </g>
      )}

      {layers.map(([depth, data]) => (
        <g
          className="tree-btn"
          transform={`translate(${margin.left +
            depth * nodeWidth -
            buttonSize / 2}, ${height - margin.top + buttonSize / 2})`}
          key={depth}
          onClick={e => {
            toggleNodes(data);
            e.stopPropagation(); // 这行代码很关键
          }}
          fillOpacity={0}
        >
          {data.every(d => d.hideChildren) ? plusButton : minusButton}
        </g>
      ))}
      <g transform={`translate(${margin.left}, ${margin.top})`}>
        {root.links().map((link, index) => (
          <path
            id={`link-${link.target.data.title}`}
            key={index}
            fill="none"
            stroke="#555"
            strokeOpacity={link.target.hide || link.source.hide ? 0 : 0.4}
            strokeWidth={1.5}
            d={pathLink(link)}
          ></path>
        ))}
        {root
          .descendants()
          .reverse()
          .map(node => (
            <g
              key={node.data.title}
              id={`node-${node.data.title}`}
              transform={`translate(${node.y}, ${node.x})`}
              fill={
                selectedRegion === node.data.title
                  ? highlightColor
                  : normalColor
              }
              fillOpacity={node.hide ? 0 : 1}
              cursor="pointer"
            >
              {!node.children ? (
                <circle r={3}></circle>
              ) : (
                <>
                  <circle
                    r={buttonSize / 2 - 5}
                    fill="white"
                    onClick={e => {
                      toggleNode(node);
                      e.stopPropagation();
                    }}
                  ></circle>
                  <g
                    transform={`translate(${-buttonSize / 2}, ${-buttonSize /
                      2})`}
                    onClick={e => {
                      toggleNode(node);
                      e.stopPropagation();
                    }}
                  >
                    {!node.hideChildren ? minusButton : plusButton}
                  </g>
                </>
              )}
              <text
                dy="0.31em"
                x={!node.children || node.hideChildren ? 8 : -8}
                textAnchor={
                  !node.children || node.hideChildren ? "start" : "end"
                }
                onClick={e => {
                  toggleHighlightNode(node);
                  e.stopPropagation();
                }}
                onDoubleClick={e => {
                  setSelectedRegion(node.data.title);
                  setShow(false);
                  e.stopPropagation();
                }}
              >
                {node.data.title}
              </text>
            </g>
          ))}
      </g>
      <g
        transform={`translate(${width -
          margin.right -
          matrixWidth}, ${margin.top - cellHeight / 2})`}
      >
        <g>
          {data.map(d => (
            <rect
              className={`grid-${d.region} grid`}
              key={d.region + d.date.toString()}
              x={x(d.date) - 1}
              y={y(d.region) - 1}
              width={x.bandwidth() - 2}
              height={h(d.region) - 2}
              fill={color(d)}
              fillOpacity={0}
              strokeOpacity={0}
              cursor="pointer"
              onClick={e => {
                handleClickRect(d);
                e.stopPropagation();
              }}
              stroke={isSelect(d) ? highlightRectColor : "none"}
              strokeWidth={isSelect(d) ? 3 : 0}
            >
              <title>{`${d.region}:${d.value}(${formatDate(
                new Date(d.date)
              )})`}</title>
            </rect>
          ))}
          <g
            className="tree-xAxis"
            transform={`translate(0, ${height - margin.bottom - margin.top})`}
          ></g>
        </g>
      </g>
    </Svg>
  );
}
