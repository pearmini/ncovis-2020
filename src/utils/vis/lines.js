import * as d3 from "d3";
export default function({
  svg,
  data: dataMap,
  type,
  width,
  height,
  margin,
  setSelectedDate,
  selectedDate
}) {
  // 初始化
  svg.select(".chart").remove();
  if (dataMap === undefined) return;

  const select = {
    date: new Date(selectedDate),
    value: dataMap.get(selectedDate) ? dataMap.get(selectedDate)[type] : null
  };

  const formatDate = d3.timeFormat("%x");

  const color = {
    dead: "black",
    confirm: "red",
    cue: "green",
    suspect: "orange"
  }[type];

  const data = Object.assign(
    Array.from(dataMap)
      .map(([date, data]) => ({
        date: new Date(date),
        value: data[type]
      }))
      .filter(d => !isNaN(d.value)),
    { y: "人数" }
  );

  if (!data.length) return;

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, d => d.value)])
    .nice()
    .range([height - margin.bottom, margin.top]);

  const x = d3
    .scaleUtc()
    .domain(d3.extent(data, d => d.date))
    .range([margin.left, width - margin.right]);

  const line = d3
    .line()
    .defined(d => d.value !== "")
    .x(d => x(d.date))
    .y(d => y(d.value));

  const xAxis = g =>
    g
      .append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(
        d3
          .axisBottom(x)
          .ticks(width / 50)
          .tickSizeOuter(0)
      )
      .call(g => g.selectAll("text").attr("transform", `rotate(-15)`));

  const yAxis = g =>
    g
      .append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
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

  const labels = g => {
    if (!select.value) return;
    const text = g
      .append("g")
      .datum(select)
      .attr(
        "transform",
        `translate(${width - margin.right - 110}, ${height - margin.top - 20})`
      );

    text
      .append("text")
      .attr("class", "number")
      .text(d => `人数: ${d.value}`);

    text
      .append("text")
      .attr("class", "date")
      .attr("y", "1em")
      .text(
        ({ date }) =>
          `日期: ${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
      );
  };

  const dot = g => {
    if (!select.value) return;
    g.append("circle")
      .attr("class", "dot")
      .datum(select)
      .attr("cx", d => x(d.date))
      .attr("cy", d => y(d.value))
      .attr("fill", color)
      .attr("r", 4);
  };

  const tip = g => {
    const container = g.append("g").on("mouseleave", () => {
      d3.select(".tip").style("display", "none");
    });

    let next;

    // overlayer
    container
      .append("rect")
      .attr("width", width - margin.right)
      .attr("height", height - margin.bottom)
      .attr("x", margin.left)
      .attr("y", margin.top)
      .attr("fill", "transparent")
      .attr("cursor", "pointer")
      .on("click", date)
      .on("mousemove", update);

    const line = container
      .append("rect")
      .datum(select)
      .attr("class", "tip")
      .attr("y", margin.top)
      .attr("x", d => x(d.date))
      .attr("width", 1)
      .attr("height", height - margin.bottom - margin.top)
      .attr("fill", "currentColor")
      .on("click", date)
      .style("display", "none");

    const title = container.append("title");

    function update() {
      const [x0] = d3.mouse(this);

      d3.pairs(data).forEach(([pre, cur]) => {
        const date = x.invert(x0);
        pre.date <= date && date < cur.date && (next = pre);
      });

      if (!next) return;

      title.datum(next).text(d => `${formatDate(d.date)}:${d.value}`);

      line
        .datum(next)
        .attr("x", d => x(d.date))
        .style("display", "block");
    }

    function date() {
      if (!next) return;
      const { date } = next;
      setSelectedDate(date);
    }
  };

  const g = svg.append("g").attr("class", "chart");

  g.call(xAxis);

  g.call(yAxis);

  g.call(labels);

  g.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", color)
    .attr("stroke-width", 2)
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .attr("d", line);

  g.call(dot);
  g.call(tip);
}
