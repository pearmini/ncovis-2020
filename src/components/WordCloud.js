import React from "react";
import Svg from "./Svg";
function WordCloud({ width, height, words }) {
  return (
    <Svg
      viewBox={[0, 0, width, height]}
      textAnchor="middle"
    >
      <g transform={`translate(${width / 2}, ${height / 2})`}>
        {words.map(({ x, y, size, text, rotate }, index) => (
          <text
            key={index}
            fontSize={size}
            transform={`translate(${x}, ${y}) rotate(${rotate})`}
          >
            {text}
          </text>
        ))}
      </g>
    </Svg>
  );
}

export default WordCloud;
