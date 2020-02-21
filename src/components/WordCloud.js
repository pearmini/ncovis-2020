import React from "react";
import Svg from "./Svg";
function WordCloud({ width, height, words, onClick }) {
  function drawWordCloud(svg) {

    
  }
  return (
    <Svg textAnchor="middle" width={width} height={height}>
      {svg => drawWordCloud(svg)}
    </Svg>
  );
}

export default WordCloud;
