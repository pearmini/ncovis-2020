import * as d3Array from "d3-array";
import * as d3All from "d3";

const d3 = {
  ...d3All,
  ...d3Array
};

export default function({
  svg,
  list,
  width,
  height,
  margin,
  currentTime,
  running,
  colors,
  transition
}) {
  if (!list) return;
  const data = list.slice(0, 10);

  const x = d3
    .scaleLinear()
    .domain([0, d3.max(data, d => d.reading)])
    .range([margin.left, width - margin.right]);

  const y = d3
    .scaleBand()
    .domain(data.map(d => d.title))
    .range([margin.top, height - margin.bottom])
    .padding(0.1);

  // 获得上一个状态的数据，对比当前状态和上一个状态排名
  // 根据排名差异计算差值形成过渡效果。
  const preData = svg
    .selectAll("rect")
    .data()
    .map((d, rank) => ({ ...d, rank }))
    .sort((a, b) => b.reading - a.reading);

  const preMap = d3.rollup(
    preData,
    ([d]) => d,
    d => d.title
  );

  const preY = d3
    .scaleBand()
    .domain(preData.map(d => d.title))
    .range([margin.top, height - margin.bottom])
    .padding(0.1);

  const transitionY = d => {
    const state = transition.get(d.title),
      duration = 250;
    if (
      !state ||
      state.startTime + duration < currentTime ||
      currentTime < state.startTime
    ) {
      transition.delete(d.title);
      return y(d.title);
    }
    const { startY, endY, startTime } = state;
    const curY = d3
      .scaleLinear()
      .domain([startTime, startTime + duration])
      .range([startY, endY]);
    return curY(currentTime);
  };

  for (const d of data) {
    const pd = preMap.get(d.title);
    const t = transition.get(d.title);
    transition.set(d.title, {
      startY: t ? t.startY : pd ? preY(pd.title) : y(d.title),
      endY: y(d.title),
      startTime: t ? t.startTime : currentTime
    });
  }

  const update = svg
    .selectAll("rect")
    .data(data, d => d.title)
    .attr("y", d => (running ? transitionY(d) : y(d.title)))
    .attr("width", d => x(d.reading) - x(0));

  update
    .exit()
    .each(removeColor)
    .remove();

  update
    .enter()
    .append("rect")
    .attr("fill-opacity", 0.6)
    .attr("fill", getColor)
    .attr("x", margin.left)
    .attr("y", d => (running ? transitionY(d) : y(d.title)))
    .attr("height", y.bandwidth())
    .attr("width", d => x(d.reading) - x(0))
    .append("title")
    .text(d => d.title);

  function getColor(d) {
    for (const c of colors) {
      const [color, title] = c;
      if (title === undefined) {
        c[1] = d.title;
        return color;
      }
    }
  }

  function removeColor(d) {
    const color = colors.find(([, title]) => d.title === title);
    color && (color[1] = undefined);
  }
}
