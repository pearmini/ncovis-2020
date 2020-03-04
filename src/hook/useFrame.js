import { useRef } from "react";
export default function(cb) {
  const timer = useRef();
  const duration = useRef(0);
  const pre = useRef();

  const requestFrame = (start) => {
    start && (duration.current = start);
    timer.current = requestAnimationFrame(step);
  };

  const cancelFrame = () => {
    pre.current = undefined;
    duration.current = 0;
    cancelAnimationFrame(timer.current);
  };

  const setFrame = time => {
    duration.current = time;
  };

  const pauseFrame = () => {
    pre.current = undefined;
    cancelAnimationFrame(timer.current);
  };

  function step(time) {
    if (pre.current === undefined) pre.current = time;
    duration.current += time - pre.current;
    pre.current = time;
    const end = cb(duration.current);
    if (end === false) {
      cancelFrame();
      return;
    }
    timer.current = requestAnimationFrame(step);
  }

  return {
    requestFrame,
    pauseFrame,
    setFrame
  };
}
