export default function(svg, data, options) {
  const g = svg.select(".container");
  if (!g) {
    svg.append("g").attr("class", "container");
  }

  
  const texts = svg.selectAll("text").data(data, d => d.index);

  texts
    .enter()
    .append("text")
    .attr("transform", d => `translate(${d.x}, ${d.y}) rotate(${d.rotate})`)
    .attr("font-size", d => d.size)
    .attr("fill", d => (d.disabled ? "#efefef" : d.fill || "black"))
    .attr("stroke", d => (d.disabled ? "#efefef" : d.fill || "black"))
    .attr("cursor", "pointer")
    .text(d => d.text);

  texts
    .attr("transform", d => `translate(${d.x}, ${d.y}) rotate(${d.rotate})`)
    .attr("font-size", d => d.size)
    .attr("fill", d => (d.disabled ? "#efefef" : d.fill || "black"))
    .attr("stroke", d => (d.disabled ? "#efefef" : d.fill || "black"))
    .attr("cursor", "pointer")
    .text(d => d.text);

  texts.exit().remove();
}
