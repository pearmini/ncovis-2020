import React from "react";
import { Slider, Button } from "antd";
import styled from "styled-components";
import { connect } from "dva";
import useFrame from "../hook/useFrame";
import * as d3 from "d3";
const Container = styled.div`
  display: flex;
  margin: 1em 0;
  align-items: center;
`;
const StyledSlider = styled(Slider)`
  width: 100%;
  margin: 1em 1em;
`;
const ControlButton = styled(Button)``;

function Timeline({ range = [0, 0], selectedTime, setSelectedTime }) {
  const totalTime = 2 * 1000;
  const scale = d3
    .scaleLinear()
    .domain([0, totalTime])
    .range(range);

  const { requestFrame, cancelFrame, isRunning } = useFrame(step, totalTime);
  function step(duration) {
    setSelectedTime(scale(duration));
  }

  function toggleAnimation() {
    if (isRunning) {
      cancelFrame();
    } else {
      requestFrame();
    }
  }
  return (
    <Container>
      <ControlButton
        shape="circle"
        icon={isRunning ? "pause-circle" : "play-circle"}
        type="primary"
        onClick={toggleAnimation}
      />
      <StyledSlider
        min={range && range[0]}
        max={range && range[1]}
        value={selectedTime}
        onChange={value => setSelectedTime && setSelectedTime(value)}
        tipFormatter={value => new Date(value).getFullYear()}
      />
    </Container>
  );
}

export default connect(
  ({ global }) => ({
    selectedTime: global.selectedTime
  }),
  {
    setSelectedTime: value => ({
      type: "global/setSelectedTime",
      payload: { value }
    })
  }
)(Timeline);
