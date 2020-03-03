import * as d3 from "d3";
// 获取 SVG 元素的 mouseX 和 mouseY 和普通 DOM 元素有一点不同，因为它会缩放
export default function(evevt, SVGelement) {
  const { clientX, clientY } = evevt;
  const {
    left,
    top,
    width: realWidth,
    height: realHeight
  } = SVGelement.getBoundingClientRect();
  const mouseX = clientX - left,
    mouseY = clientY - top;
  const { width, height } = SVGelement.getBBox();
  const x = d3.scaleLinear([0, realWidth], [0, width]),
    y = d3.scaleLinear([0, realHeight], [0, height]);
  return [x(mouseX), y(mouseY)];
}
