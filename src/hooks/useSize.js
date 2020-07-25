import { useEffect, useState } from "react";
import ResizeObserver from "resize-observer-polyfill";

export default function(ref) {
  const [size, setSize] = useState({
    width: 0,
    height: 0
  });

  const [observer] = useState(
    new ResizeObserver(([entry]) => {
      if (entry) {
        const { width, height } = entry.contentRect;
        setSize({ width, height });
      }
    })
  );
  useEffect(() => {
    const node = ref.current;
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, observer]);
  return size;
}
