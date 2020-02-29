import React from "react";
import Svg from "./Svg";
export default function({ loading }) {
  const width = 600,
    height = 400,
    margin = { top: 30, right: 30, bottom: 30, left: 50 };
  return <Svg viewBox={[0, 0, width, height]} loading={loading}></Svg>;
}
