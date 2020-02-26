import React, { useState } from "react";
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

function Timeline({
  range = [0, 0],
  total = 0,
  selectedTime,
  setSelectedTime
}) {
  const [running, setRunning] = useState(false);
  const { requestFrame, pauseFrame, setFrame } = useFrame(step);

  const scale = d3
    .scaleLinear()
    .domain([0, total])
    .range(range);

  const formatDate = d => new Date(d).getFullYear();

  function step(duration) {
    const time = scale(duration);
    setSelectedTime(time);
    if (duration > total) {
      setRunning(false);
      return false;
    }
  }

  function toggleAnimation() {
    if (running) {
      setRunning(false);
      pauseFrame();
    } else {
      setRunning(true);
      requestFrame();
    }
  }

  function onChange(value) {
    setFrame(scale.invert(value));
    setSelectedTime(value);
  }

  return (
    <Container>
      <ControlButton
        shape="circle"
        icon={running ? "pause-circle" : "play-circle"}
        type="primary"
        onClick={toggleAnimation}
      />
      <StyledSlider
        min={range[0]}
        max={range[1]}
        value={selectedTime}
        onChange={onChange}
        tipFormatter={formatDate}
      />
    </Container>
  );
}

export default connect(null, {
  setSelectedTime: value => ({
    type: "global/setSelectedTime",
    payload: { value }
  })
})(Timeline);
