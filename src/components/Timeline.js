import React, { useRef, useEffect } from "react";
import styled from "styled-components";
import useFrame from "../hook/useFrame";
import mouse from "../utils/mouse";
import * as d3 from "d3";

const Svg = styled.svg`
  background: #f9f9f9;
`;

const Button = styled.g`
  cursor: pointer;
`;

const Slider = styled.rect`
  cursor: pointer;
`;

const Dot = styled.circle`
  cursor: pointer;
`;

export default function({
  time,
  selectedTime,
  setSelectedTime,
  running,
  setRunning
}) {
  const { requestFrame, pauseFrame, setFrame } = useFrame(step);
  const dragging = useRef(false);
  const sliderRef = useRef(null);
  const dotRef = useRef(null);
  const [, total] = time.domain(),
    range = time.range(),
    duration = time.invert(selectedTime);
  const width = 1200,
    height = 50,
    margin = { top: 20, right: 30, bottom: 20, left: 60 };

  const x = d3
    .scaleLinear()
    .domain(range)
    .range([margin.left, width - margin.right]);

  function step(duration) {
    // 不能超过最大的时间
    const t = Math.min(time(duration), range[1]);
    setSelectedTime(t);
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
      requestFrame(duration >= total ? 0 : duration);
    }
  }

  function changeValue(value) {
    const validValue = Math.max(range[0], Math.min(value, range[1]));
    setFrame(time.invert(validValue));
    setSelectedTime(validValue);
  }

  function handleClick(e) {
    const [mouseX] = mouse(e, sliderRef.current);
    const t = x.invert(mouseX + margin.left);
    changeValue(t);
  }

  useEffect(() => {
    const handleMouseUp = () => (dragging.current = false);
    const handleMouseMove = e => {
      if (!dragging.current) return;
      const [mouseX] = mouse(e, sliderRef.current);
      const t = x.invert(mouseX + margin.left);
      changeValue(t);
    };

    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  });

  const startButton = (
    <svg
      t="1583152510891"
      className="icon"
      viewBox="0 0 1024 1024"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      p-id="2302"
      width="30"
      height="30"
    >
      <path
        d="M149.989688 874.093352a509.948138 509.948138 0 1 0-109.714286-162.700613 513.206978 513.206978 0 0 0 109.714286 162.700613z"
        fill="#4D4D4D"
        p-id="2303"
      ></path>
      <path
        d="M429.646454 687.977369a57.331447 57.331447 0 0 0 27.277699 7.000472 60.348892 60.348892 0 0 0 32.829797-10.017916l175.977369-115.990571a68.677039 68.677039 0 0 0 30.777935-58.055634 66.504479 66.504479 0 0 0-29.812353-56.486563l-177.54644-115.749175a57.934936 57.934936 0 0 0-60.348892-3.017445 67.832155 67.832155 0 0 0-33.312588 60.348893V627.628477a67.470061 67.470061 0 0 0 34.157473 60.348892z"
        fill="#FFFFFF"
        p-id="2304"
      ></path>
    </svg>
  );

  const pauseButton = (
    <svg
      t="1583152894415"
      className="icon"
      viewBox="0 0 1024 1024"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      p-id="1002"
      width="30"
      height="30"
    >
      <path
        d="M874.058005 149.941995a510.06838 510.06838 0 1 0 109.740156 162.738976 511.396369 511.396369 0 0 0-109.740156-162.738976z"
        fill="#4D4D4D"
        p-id="1003"
      ></path>
      <path
        d="M417.954256 281.533601a41.046923 41.046923 0 0 0-41.77128 40.201839v385.116718a41.892007 41.892007 0 0 0 83.663287 0v-385.116718a41.167649 41.167649 0 0 0-41.892007-40.201839zM606.045744 281.533601a41.046923 41.046923 0 0 0-41.77128 40.201839v385.116718a41.892007 41.892007 0 0 0 83.663287 0v-385.116718a41.167649 41.167649 0 0 0-41.892007-40.201839z"
        fill="#FFFFFF"
        p-id="1004"
      ></path>
    </svg>
  );

  const restartButton = (
    <svg
      t="1583294650370"
      className="icon"
      viewBox="0 0 1024 1024"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      p-id="1815"
      width="30"
      height="30"
    >
      <path d="M471.616 361.728" p-id="1816"></path>
      <path
        d="M512 0C229.248 0 0 229.248 0 512s229.248 512 512 512 512-229.248 512-512S794.752 0 512 0zM534.976 860.672c-100.992 0-191.616-44.48-253.312-114.944l63.36-55.424c3.712 4.224 7.488 8.32 11.52 12.288 47.68 47.68 111.104 73.92 178.56 73.92 67.456 0 130.816-26.304 178.56-73.92 47.68-47.68 73.92-111.104 73.92-178.56s-26.304-130.816-73.92-178.56c-47.68-47.68-111.104-73.92-178.56-73.92-67.456 0-130.816 26.304-178.56 73.92l94.4 94.4L198.336 439.872 198.336 187.328 296.96 285.952c60.928-60.928 145.088-98.624 238.016-98.624 185.92 0 336.64 150.72 336.64 336.64C871.616 709.888 720.896 860.672 534.976 860.672z"
        p-id="1817"
      ></path>
    </svg>
  );
  return (
    <Svg viewBox={[0, 0, width, height]}>
      <Button transform={`translate(${10}, ${10})`} onClick={toggleAnimation}>
        {running
          ? pauseButton
          : duration >= total
          ? restartButton
          : startButton}
      </Button>
      <Slider
        ref={sliderRef}
        x={margin.left}
        y={margin.top}
        width={width - margin.left - margin.right}
        height={10}
        fill="#eee"
        rx={5}
        onClick={handleClick}
      ></Slider>
      <Dot
        ref={dotRef}
        cx={x(selectedTime) || margin.left}
        cy={height / 2}
        r={7}
        onMouseDown={() => (dragging.current = true)}
      ></Dot>
    </Svg>
  );
}
