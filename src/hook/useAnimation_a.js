import { useRef } from "react";
export default function(cb, frameRate = 60) {
  const timer = useRef();
  const duration = useRef(0);
  const pre = useRef();
  const preRenderTime = useRef();

  const requestAnimation = start => {
    start && (duration.current = start);
    timer.current = requestAnimationFrame(step);
  };

  const cancelAnimation = () => {
    pre.current = undefined;
    duration.current = 0;
    cancelAnimationFrame(timer.current);
  };

  const setFrame = time => {
    duration.current = time;
  };

  const pauseAnimation = () => {
    pre.current = undefined;
    cancelAnimationFrame(timer.current);
  };

  function step(time) {
    if (preRenderTime.current === undefined) preRenderTime.current = time;
    if (pre.current === undefined) pre.current = time;
    duration.current += time - pre.current;
    pre.current = time;
    let end;
    if (time > preRenderTime.current + 1000 / frameRate) {
      end = cb(duration.current);
      preRenderTime.current = time;
    }

    if (end === false) {
      cancelAnimation();
      return;
    }
    timer.current = requestAnimationFrame(step);
  }

  return {
    requestAnimation,
    pauseAnimation,
    setFrame
  };
}
