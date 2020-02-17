import React from "react";
import Svg from "./Svg";
import styled from "styled-components";
const Text = styled.text.attrs(props => ({
  style: {
    fill: props.disabled ? "efefef" : props.fill || "black"
  }
}))`
  cursor: pointer;
`;
function WordCloud({ width, height, words, onClick }) {
  return (
    <Svg viewBox={[0, 0, width, height]} textAnchor="middle">
      <g transform={`translate(${width / 2}, ${height / 2})`}>
        {words.map((item, index) => (
          <Text
            key={index}
            fontSize={item.size}
            transform={`translate(${item.x}, ${item.y}) rotate(${item.rotate})`}
            disabled={item.disabled}
            fill={item.fill}
            onClick={() => onClick && onClick(item)}
          >
            {item.text}
          </Text>
        ))}
      </g>
    </Svg>
  );
}

export default WordCloud;
