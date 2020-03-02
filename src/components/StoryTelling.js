import React from "react";
import Svg from "./Svg";
export default function({ loading }) {
  const width = 600,
    height = 400;
  const words = [
    { x: -26, y: -61, size: 85, rotate: 90, text: "如何" },
    { x: -119, y: 62, size: 81, rotate: 90, text: "疫情" },
    { x: 27, y: 79, size: 69, rotate: 0, text: "如何" },
    { x: 81, y: -58, size: 68, rotate: 0, text: "2 " },
    { x: -110, y: -70, size: 67, rotate: 0, text: "贫贱" },
    { x: -244, y: -71, size: 65, rotate: 0, text: "全国" },
    { x: 171, y: 69, size: 60, rotate: 90, text: "为什" },
    { x: -188, y: 51, size: 59, rotate: 90, text: "有哪" },
    { x: 109, y: -68, size: 58, rotate: 90, text: "如何" },
    { x: 103, y: 59, size: 17, rotate: 90, text: "日本" }
  ];
  return (
    <Svg viewBox={[0, 0, width, height]} loading={loading} textAnchor="middle">
      <g transform={`translate(${width / 2 + 50}, ${height / 2})`}>
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
