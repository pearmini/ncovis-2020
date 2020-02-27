import * as d3 from "d3";
export default function({ svg, list, width, height, margin, colors }) {
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

  const update = svg
    .selectAll("rect")
    .data(data, d => d.title)
    .attr("y", d => y(d.title))
    .attr("width", d => x(d.reading) - x(0));

  update
    .exit()
    .each(removeColor)
    .remove();

  update
    .enter()
    .append("rect")
    .attr("fill", getColor)
    .attr("x", margin.left)
    .attr("y", d => y(d.title))
    .attr("height", y.bandwidth())
    .attr("width", d => x(d.reading) - x(0))
    .append("title")
    .text(d => d.title);

  function getColor(d) {
    for (let c of colors) {
      const [color, title] = c;
      if (title === undefined) {
        c[1] = d.title;
        return color;
      }
    }
  }

  function removeColor(d) {
    const color = colors.find(([, title]) => d.title === title);
    color[1] = undefined;
  }
}
