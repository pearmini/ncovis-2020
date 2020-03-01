import React from "react";
import { Slider, Button } from "antd";
import styled from "styled-components";
import useFrame from "../hook/useFrame";
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

export default function({
  time,
  selectedTime,
  setSelectedTime,
  running,
  setRunning
}) {
  const { requestFrame, pauseFrame, setFrame } = useFrame(step);
  const [, total] = time.domain(),
    range = time.range();
  const formatDate = d => new Date(d).getFullYear();

  function step(duration) {
    setSelectedTime(time(duration));
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
    setFrame(time.invert(value));
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
