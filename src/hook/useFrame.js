import { useRef, useState } from "react";
export default function(cb, maxProgress) {
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
    const progress = time - startTime.current;
    if (progress > maxProgress) {
      cancelFrame();
      return;
    }
    cb(progress);
    timer.current = requestAnimationFrame(step);
  }

  return {
    requestFrame,
    cancelFrame,
    isRunning
  };
}
