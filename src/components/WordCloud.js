import React from "react";
import Svg from "./Svg";
function WordCloud({ width, height, words, onClick }) {
  function drawWordCloud(svg) {
    const g = svg
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    g.selectAll("text")
      .data(words)
      .join("text")
      .attr("font-size", d => d.size)
      .attr("transform", d => `translate(${d.x}, ${d.y}) rotate(${d.rotate})`)
      .style("fill", d => (d.disabled ? "#efefef" : d.fill || "black"))
      .attr("cursor", "pointer")
      .text(d => d.text)
      .on("click", d => onClick && onClick(d));
  }
  return (
    <Svg textAnchor="middle" width={width} height={height}>
      {svg => drawWordCloud(svg)}
    </Svg>
  );
}

export default WordCloud;
