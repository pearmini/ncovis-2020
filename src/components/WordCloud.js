import React from "react";
import Svg from "./Svg";
function WordCloud({ width, height, words, onClick }) {
  function drawWordCloud(svg) {
    // const g = svg.append("g");
    // .attr("transform", `translate(${width / 2},${height / 2})`);

    const texts = svg.selectAll("text").data(words, d => d.index);

    texts
      .enter()
      .append("text")
      .attr("transform", d => `translate(${d.x}, ${d.y}) rotate(${d.rotate})`)
      .attr("font-size", d => d.size)
      .attr("fill", d => (d.disabled ? "#efefef" : d.fill || "black"))
      .attr("stroke", d => (d.disabled ? "#efefef" : d.fill || "black"))
      .attr("cursor", "pointer")
      .text(d => d.text)
      .on("click", d => onClick && onClick(d));

    texts
      .attr("transform", d => `translate(${d.x}, ${d.y}) rotate(${d.rotate})`)
      .attr("font-size", d => d.size)
      .attr("fill", d => (d.disabled ? "#efefef" : d.fill || "black"))
      .attr("stroke", d => (d.disabled ? "#efefef" : d.fill || "black"))
      .attr("cursor", "pointer")
      .text(d => d.text);

    texts.exit().remove();
  }
  return (
    <Svg textAnchor="middle" width={width} height={height}>
      {svg => drawWordCloud(svg)}
    </Svg>
  );
}

export default WordCloud;
