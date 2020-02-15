import React from "react";
import { Slider } from "antd";
import styled from "styled-components";
const StyledSlider = styled(Slider)`
  width: 800px;
  margin: 1em 0;
`;
export default function() {
  return <StyledSlider defaultValue={30} />;
}
