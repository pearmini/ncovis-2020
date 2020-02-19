import { useRef, useState } from "react";
export default function(cb) {
  const [isRunning, setIsRunning] = useState(false);
  const timer = useRef();
  const startTime = useRef();

  const requestFrame = () => {
    if (isRunning) return;
    setIsRunning(() => true);
    timer.current = requestAnimationFrame(step);
  };

  const cancelFrame = () => {
    if (!isRunning) return;
    setIsRunning(() => false);
    startTime.current = undefined;
    cancelAnimationFrame(timer.current);
  };

  function step(time) {
    if (startTime.current === undefined) startTime.current = time;
    const duration = time - startTime.current;
    cb(duration);
    timer.current = requestAnimationFrame(step);
  }

  return {
    requestFrame,
    cancelFrame,
    isRunning
  };
}
