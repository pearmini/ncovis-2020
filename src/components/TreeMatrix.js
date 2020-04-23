import React, { useState, useEffect, useRef } from "react";
import Svg from "./Svg";
import * as d3All from "d3";
import * as d3Array from "d3-array";
import mouse from "../utils/mouse";
import regionsData from "../assets/data/region_options.json";

const d3 = {
  ...d3All,
  ...d3Array,
};

export default function ({
  dataByRegion,
  selectedRegion,
  selectedDate,
  setSelectedDate,
  setSelectedRegion,
  selectedType,
  loading,
  show,
  setFocusRegion,
  width,
  height,
  colors,
  all,
  highlightColor,
  normalColor,
  highlightRectColor,
  disabledColor,
  legendWidth,
  legendHeight,
  treeData,
  setTreeData,
  handleChangeLevel,
}) {
  if (!dataByRegion.size || !treeData.children)
    return (
      <Svg
        viewBox={[0, 0, width, height]}
        loading={loading}
        nodata={true}
        show={show}
      ></Svg>
    );

  const [highlight, setHighlight] = useState([]);
  const [drag, setDrag] = useState({
    start: null,
    move: 0,
  });
  const [hover, setHover] = useState(false);
  const sliderRef = useRef(null);
  treeData.eachAfter((node) => {
    node.visableH =
      node.children && !node.hideChildren
        ? d3.max(node.children, (d) => d.visableH) + 1
        : 0;
  });
  const descendants = treeData.descendants(),
    visableRegions = new Set(
      descendants
        .filter((d) => !d.hide && (!d.children || d.hideChildren))
        .map((d) => d.data.title)
    ),
    layers = d3
      .groups(descendants, (d) => d.depth)
      .filter(
        ([depth, data]) =>
          depth !== treeData.height && depth !== 0 && data.every((d) => !d.hide)
      ),
    th = treeData.visableH;

  const data = all
      .map((d) => ({
        date: d.date,
        region: d.region,
        value: d[selectedType],
      }))
      .filter(({ value }) => !isNaN(value) && value !== "")
      .filter((d) => visableRegions.has(d.region)),
    days = Array.from(new Set(data.map((d) => d.date)));

  const hset = new Set(highlight.map((d) => d.data.title));
  const colorData = highlight.length
    ? data.filter((d) => hset.has(d.region))
    : data;

  const margin = { top: 55, right: 30, bottom: 60, left: 60 },
    chartPadding = 75,
    nodeWidth = 75,
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
      "Dec",
    ],
    treeW = nodeWidth * th,
    treeH = height - margin.top - margin.bottom - axisPadding,
    matrixWidth = width - margin.left - margin.right - chartPadding - treeW;

  const tree = d3
      .tree()
      .size([treeH, treeData.height * nodeWidth])
      .separation((a, b) => (a.parent === b.parent ? 1 : 1.5)),
    root = tree(treeData),
    allLeaves = root.leaves(),
    cellHeight =
      allLeaves.length === 1
        ? allLeaves[0].x
        : d3
            .pairs(allLeaves)
            .reduce(
              (total, [a, b]) => Math.min(total, Math.abs(a.x - b.x)),
              Infinity
            ),
    cellWidth = Math.max(matrixWidth / days.length, 12.5),
    nodeByTitle = d3.rollup(
      root.descendants(),
      ([d]) => d,
      (d) => d.data.title
    );

  const x = d3
    .scaleBand()
    .domain(days)
    .range([0, cellWidth * days.length]);

  const y = (title) => {
    const node = nodeByTitle.get(title);
    if (!node.children) return node.x;
    let x0 = Infinity;
    node.each((d) => {
      if (d.x < x0) x0 = d.x;
    });
    return x0;
  };

  const h = (title) => {
    const node = nodeByTitle.get(title);
    if (!node.children) return cellHeight;
    let x0 = Infinity;
    let x1 = -x0;
    node.each((d) => {
      if (d.x > x1) x1 = d.x;
      if (d.x < x0) x0 = d.x;
    });
    return x1 - x0 + cellHeight;
  };

  const colorScale = d3.scaleSequential(colors[selectedType]).domain(
    d3.extent(
      colorData.filter((d) => d.region !== "湖北" && d.region !== "华中地区"),
      (d) => d.value
    )
  );

  const specialColorScale = d3
    .scaleSqrt()
    .interpolate(() => colors.special)
    .domain(
      d3.extent(
        colorData.filter((d) => d.region === "湖北" || d.region === "华中地区"),
        (d) => d.value
      )
    );

  const color = (node) => {
    if (highlight.length && !hset.has(node.region)) return disabledColor;
    if (node.region === "湖北" || node.region === "华中地区")
      return specialColorScale(node.value);
    return colorScale(node.value);
  };

  const pathLink = d3
    .linkHorizontal()
    .x((d) => d.y)
    .y((d) => d.x);

  const stroke = d3
    .scaleSequential(colors[selectedType])
    .domain([0, legendWidth]);

  const strokeSpecial = d3
    .scaleSqrt()
    .interpolate(() => colors.special)
    .domain([0, legendWidth]);

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
          鼠标<b>移动到</b>到<b>热力图</b>
          任意格子并停留一会儿，会显示地区、时间以及变化人数。
        </li>
        <li>
          <b>单击“热力图”</b>中的任意格子，会高亮并且选择对应的日期和地区。
        </li>
        <li>
          <b>点击“树”</b>中地区的名字后面的<b>按钮</b>会收缩或者展开该地区。
        </li>
        <li>
          <b>单击“树”</b>中地区的<b>名字</b>
          会选择该地区，并且只可视化选择的地区；再
          <b>单击</b>一次，取消选择。
        </li>
        <li>
          <b>双击“树”</b>中地区的<b>名字</b>会进入<b>日历热图</b>
          ，只可视化该地区的数据；
          <b>双击</b>空白地方返回。
        </li>
      </ul>
    </div>
  );

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

  function handleMouseup() {
    setDrag({ ...drag, start: null });
  }

  function handleMousemove(e) {
    if (drag.start === null) return;
    if (sliderRef.current === null) return;
    const [mouseX] = mouse(e, sliderRef.current);
    const maxMove = matrixWidth * (1 - matrixWidth / (days.length * cellWidth));
    const move = Math.max(
      0,
      Math.min(maxMove, mouseX - drag.start + drag.move)
    );
    setDrag({ ...drag, move });
  }

  function handleMousedown(e) {
    const [mouseX] = mouse(e, sliderRef.current);
    setDrag({
      ...drag,
      start: mouseX,
    });
  }

  function hasSpecialLegend() {
    return (
      (treeData.data.title === "中国" && highlight.length === 0) ||
      highlight.find((d) => d.data.title === "湖北") ||
      highlight.find((d) => d.data.title === "华中地区")
    );
  }

  function toggleHighlightNode(node) {
    if (!node.parent) return;

    const old = highlight.find((d) => d.data.title === node.data.title);
    const hasChildren = highlight.some(
      (d) => d.parent.data.title === node.data.title
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
    if (node.depth === 0) {
      const level = node.data.title === "全球" ? "second" : "top";
      handleChangeLevel(level);
      return;
    }
    // animation
    const t = d3.transition().duration(250).ease(d3.easeExpOut);
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
    const t = d3.transition().duration(250).ease(d3.easeExpOut);

    const validNodes = nodes.filter((node) => node.children);
    const allHide = validNodes.every((d) => d.hideChildren);
    allHide
      ? validNodes.forEach((d) => animateShowChildren(d, t))
      : validNodes
          .filter((d) => !d.hideChildren)
          .forEach((d) => animateHideChildren(d, t));
    animateHideLegend(t);
    animateHideAxis(t);
    await t.end();

    // update data
    allHide
      ? validNodes.forEach(showChildren)
      : validNodes.filter((d) => !d.hideChildren).forEach(hideChildren);

    // update view
    const newTreeData = copyTree();
    allHide
      ? handleChangeLevel("third", newTreeData)
      : handleChangeLevel("second", newTreeData);
    setHighlight([]);
  }

  function animateHideButton(t) {
    d3.select(".tree-btn").transition(t).attr("fill-opacity", 0);
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

    node.each((d) => {
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
    node.each((d) => {
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
    setDrag({
      move: 0,
      start: null,
    });
    node.hideChildren = true;
    node.each((child) => {
      if (child.data.title === node.data.title) return;
      child.hide = true;
    });
  }

  function showChildren(node) {
    setDrag({
      move: 0,
      start: null,
    });
    node.hideChildren = false;
    node.eachBefore((child) => {
      if (child.data.title === node.data.title) return;
      child.hide = false;
      child.hideChildren = false;
    });
  }

  function copyTree() {
    // 这里必须要拷贝一份，否者很麻烦
    const newTreeData = d3.hierarchy(regionsData);
    newTreeData.each((node) => {
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

  useEffect(() => {
    // 绘制坐标轴
    const scaleLegend = d3
      .scaleLinear()
      .domain(colorScale.domain())
      .range([0, legendWidth]);

    const specialScaleLegend = d3
      .scaleSqrt()
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
      .tickFormat((time) => {
        const date = new Date(time).getDate();
        if (date !== 1) return date;
        const month = new Date(time).getMonth();
        return labels[month];
      });

    d3.select(".tree-xAxis")
      .call(xAxis)
      .call((g) =>
        g
          .selectAll("text")
          .filter(function () {
            const label = d3.select(this).text();
            return labels.indexOf(label) !== -1;
          })
          .attr("font-weight", "bold")
          .attr("dy", "2em")
      );

    d3.select(".tree-legend").call(legendAxis);
    d3.select(".tree-legend-special").call(specialLegendAxis);

    // 监听事件
    window.addEventListener("mouseup", handleMouseup);
    window.addEventListener("mousemove", handleMousemove);

    // animation
    const t = d3.transition().duration(200);
    d3.selectAll(
      ".grid, .tree-legend, .tree-line, .tree-xAxis, .tree-xAxis, .tree-btn, .tree-legend-special"
    )
      .transition(t)
      .attr("stroke-opacity", 1)
      .attr("fill-opacity", 1);

    return () => {
      window.removeEventListener("mouseup", handleMouseup);
      window.removeEventListener("mousemove", handleMousemove);
    };
  });

  return (
    <Svg
      viewBox={[0, 0, width, height]}
      loading={loading && noData(data)}
      nodata={noData(data)}
      onClick={() => setHighlight([])}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onMouseOver={() => !hover && setHover(true)}
      show={show}
      title="树 + 热力图"
      introduction={introduction}
    >
      {th && (
        <g
          transform={`translate(${width - margin.right - legendWidth - 10}, ${
            margin.top / 2
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
            className="tree-legend"
            transform={`translate(0, ${legendHeight / 2})`}
          ></g>
          <text textAnchor="end" fill="currentColor" dy="0.31em" dx={-10}>
            {hasSpecialLegend() ? "其他地区" : "所有地区"}
          </text>
        </g>
      )}
      {hasSpecialLegend() && (
        <g
          transform={
            th === 0
              ? `translate(${width - margin.right - legendWidth - 10}, ${
                  margin.top / 2
                })`
              : `translate(${
                  width - margin.right - legendWidth - legendWidth - 100
                }, ${margin.top / 2})`
          }
        >
          {d3.range(0, legendWidth).map((l) => (
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
            {th === 0 ? "中国" : th === 1 ? "华中地区" : "湖北"}
          </text>
        </g>
      )}
      {layers.map(([depth, data]) => (
        <g
          className="tree-btn"
          transform={`translate(${
            margin.left + depth * nodeWidth - buttonSize / 2
          }, ${height - margin.top + buttonSize / 2})`}
          key={depth}
          onClick={(e) => {
            toggleNodes(data);
            e.stopPropagation(); // 这行代码很关键
          }}
          fillOpacity={0}
        >
          {data.every((d) => d.hideChildren) ? plusButton : minusButton}
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
          .map((node) => (
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
                    onClick={(e) => {
                      toggleNode(node);
                      e.stopPropagation();
                    }}
                  ></circle>
                  <g
                    transform={`translate(${-buttonSize / 2}, ${
                      -buttonSize / 2
                    })`}
                    onClick={(e) => {
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
                fontSize="12"
                onClick={(e) => {
                  toggleHighlightNode(node);
                  e.stopPropagation();
                }}
                onDoubleClick={(e) => {
                  setSelectedRegion(node.data.title);
                  setFocusRegion(node.data.title);
                  e.stopPropagation();
                }}
              >
                {node.data.title}
              </text>
            </g>
          ))}
      </g>
      <g transform={`translate(${width - margin.right - matrixWidth}, ${0})`}>
        <g clipPath="url(#maxtrix-ly)">
          <g
            transform={`translate(${-drag.move}, ${
              margin.top - cellHeight / 2
            })`}
          >
            {data.map((d) => (
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
                onClick={(e) => {
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
          </g>
          <g
            className="tree-xAxis"
            transform={`translate(${-drag.move}, ${height - margin.bottom})`}
          ></g>
        </g>
        <defs>
          <clipPath id="maxtrix-ly">
            <rect
              x="0"
              y="0"
              width={matrixWidth}
              height={height - margin.bottom + 30}
            />
          </clipPath>
        </defs>
        {hover && matrixWidth < days.length * cellWidth && (
          <g transform={`translate(0, ${height - margin.bottom + 40})`}>
            <rect
              ref={sliderRef}
              width={matrixWidth}
              height={8}
              x={0}
              y={0}
              rx={4}
              ry={4}
              fill="transparent"
            ></rect>
            <rect
              onMouseDown={handleMousedown}
              width={matrixWidth * (matrixWidth / (days.length * cellWidth))}
              height={8}
              x={drag.move}
              y={0}
              rx={4}
              ry={4}
              fill="#bfbfbf"
              cursor="pointer"
            ></rect>
          </g>
        )}
      </g>
    </Svg>
  );
}
