import * as d3 from "d3";
export default function(
  svg,
  dataMap,
  { type, width, height, margin, setSelectedDate, selectedDate }
) {
  svg.select(".chart").remove();
  if (dataMap === undefined) return;

  const data = d3.pairs(Array.from(dataMap)).map(([a, b]) => ({
    date: new Date(b[0]),
    value: (b[1][type] - a[1][type]) | 0
  }));

  const select = data.find(
    ({ date }) => date.getTime() === new Date(selectedDate).getTime()
  );

  const interpolate = {
    dead: d3.interpolateBuPu,
    confirm: d3.interpolatePuRd,
    cue: d3.interpolateYlGn,
    suspect: d3.interpolateOrRd
  };

  const formatDate = d3.timeFormat("%x"),
    formatDay = d => "SMTWTFS"[d.getDay()],
    formatMonth = d3.timeFormat("%b"),
    countDay = d => d.getDay();

  const timeWeek = d3.timeSunday,
    timeMonth = d3.timeMonth,
    startDate = data[0].date,
    endDate = data[data.length - 1].date,
    weekCnt = timeWeek.count(startDate, endDate);

  const cellHeight = (height - margin.top - margin.bottom) / 7,
    cellWidth = (width - margin.left - margin.right) / (weekCnt + 1),
    cellSize = d3.min([cellWidth, cellHeight]);

  const color = d3
    .scaleSequential(interpolate[type])
    .domain(d3.extent(data, d => d.value));

  const highlight = g => {
    if (!select) return;
    g.append("rect")
      .datum(select)
      .attr("width", cellSize)
      .attr("height", cellSize)
      .attr("x", d => timeWeek.count(timeMonth(startDate), d.date) * cellSize)
      .attr("y", d => countDay(d.date) * cellSize)
      .attr("stroke", "red")
      .attr("fill", "transparent");
  };

  const labels = g => {
    if (!select) return;
    const text = g
      .append("g")
      .datum(select)
      .attr(
        "transform",
        `translate(${width - margin.right - margin.left - 110}, ${height -
          margin.top -
          margin.bottom -
          20})`
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

  const pathMonth = t => {
    const n = 7;
    const d = countDay(t);
    const w = timeWeek.count(timeMonth(startDate), t);
    return `${
      d === 0
        ? `M${w * cellSize},0`
        : d === n
        ? `M${(w + 1) * cellSize},0`
        : `M${(w + 1) * cellSize},0V${d * cellSize}H${w * cellSize}`
    }V${n * cellSize}`;
  };

  const year = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`)
    .attr("class", "chart");

  year
    .append("g")
    .selectAll("rect")
    .data(data)
    .join("rect")
    .attr("width", cellSize - 1)
    .attr("height", cellSize - 1)
    .attr(
      "x",
      d => timeWeek.count(timeMonth(startDate), d.date) * cellSize + 0.5
    )
    .attr("y", d => countDay(d.date) * cellSize + 0.5)
    .attr("fill", d => color(d.value))
    .on("click", d => setSelectedDate(d.date))
    .append("title")
    .text(d => `${formatDate(d.date)}:${d.value}`);

  year
    .append("g")
    .selectAll("text")
    .data(d3.range(7).map(i => new Date(1995, 0, i)))
    .join("text")
    .attr("x", -cellSize)
    .attr("y", d => (countDay(d) + 0.5) * cellSize)
    .attr("dy", ".31em")
    .attr("fill", "currentColor")
    .text(d => formatDay(d));

  year.call(labels);

  const month = year
    .append("g")
    .selectAll("g")
    .data(d => d3.timeMonths(timeMonth(startDate), timeMonth(endDate)))
    .join("g");

  month
    .append("text")
    .attr("fill", "currentColor")
    .attr(
      "x",
      d => timeWeek.count(timeMonth(startDate), timeWeek.ceil(d)) * cellSize + 2
    )
    .attr("y", -5)
    .text(formatMonth);

  month
    .append("path")
    .attr("fill", "none")
    .attr("stroke", "#fff")
    .attr("stroke-width", 3)
    .attr("d", pathMonth);

  year.call(highlight);
}
