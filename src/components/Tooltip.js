import React from "react";

export default function({ extent, pos, size, children }) {
  const [x0, y0, width, height] = extent;
  const [x, ofx] = pos;
  const [contentW, contentH] = size;
  const rightY = (y0 + height - contentH) / 2;
  let rightX = x;
  if (x + contentW + ofx > x0 + width) {
    rightX -= contentW + ofx;
  } else {
    rightX += ofx;
  }
  return <>{children && children(rightX, rightY)}</>;
}
