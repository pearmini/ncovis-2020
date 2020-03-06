import { useRef } from "react";
export default function(cb, frameRate = 60) {
  const timer = useRef();
  const duration = useRef(0);
  const pre = useRef();

  const requestAnimation = start => {
    start && (duration.current = start);
    timer.current = setInterval(step, 1000 / frameRate);
  };

  const cancelAnimation = () => {
    pre.current = undefined;
    duration.current = 0;
    clearInterval(timer.current);
  };

  const setFrame = time => {
    duration.current = time;
  };

  const pauseAnimation = () => {
    pre.current = undefined;
    clearInterval(timer.current);
  };

  function step() {
    const time = new Date().getTime();
    if (pre.current === undefined) pre.current = time;
    duration.current += time - pre.current;
    pre.current = time;
    const end = cb(duration.current);

    if (end === false) {
      cancelAnimation();
      return;
    }
  }

  return {
    requestAnimation,
    pauseAnimation,
    setFrame
  };
}
