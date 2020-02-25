import React, { useRef, useEffect } from "react";
import Card from "./Card";
import styled from "styled-components";
import download from "../utils/download";
const StyledCanvas = styled.canvas`
  width: 100%;
  height: 100%;
  background: white;
  padding: 10px 0px;
  cursor: pointer;
`;

function Canvas({ src, width, height, filename, children, ...rest }) {
  function downloadImage() {
    const canvas = ref.current;
    canvas.toBlob(blob => {
      download(blob, filename);
    });
  }
  const ref = useRef(null);
  useEffect(() => {
    if (!src) return;
    const canvas = ref.current;
    const context = canvas.getContext("2d");
    context.restore();
    context.save();
    context.scale(2, 2);
    context.fillStyle = "#fff";
    context.fillRect(0, 0, width, height);
    children && children(context, src, width, height);
  }, [src, width, height, children]);

  return (
    <Card onDownload={() => downloadImage()} {...rest}>
      <StyledCanvas
        ref={ref}
        width={width * 2}
        height={height * 2}
      ></StyledCanvas>
    </Card>
  );
}

export default Canvas;
