import React, { useRef, useEffect } from "react";
import { Button, Popover } from "antd";
import styled from "styled-components";
import download, { serialize, rasterize } from "../utils/download";
import { useMouse } from "react-use";
import * as d3 from "d3";

const Container = styled.div`
  position: relative;
  outline: 1px solid black;
`;

const DownloadButton = styled(Button)`
  right: 5px;
  top: 5px;
  position: absolute;
`;

const StyledSvg = styled.svg`
  background: white;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-around;
`;

function Svg({ viewBox, children, filename, ...rest }) {
  const ref = useRef(null);
  const { elX, elY, elW, elH } = useMouse(ref);
  const mouseHovered = elX > 0 && elX < elW && elY > 0 && elY < elH;

  function onDownloadSvg() {
    const blob = serialize(ref.current);
    download(blob);
  }

  function onDownloadPng() {
    rasterize(ref.current).then(download);
  }

  const content = (
    <Row>
      <Button onClick={onDownloadPng}>png</Button>
      <Button onClick={onDownloadSvg}>svg</Button>
    </Row>
  );

  useEffect(() => {
    const svg = d3.select(ref.current);
    children && children(svg);
  }, [children]);

  return (
    <Container {...rest}>
      {mouseHovered && (
        <Popover
          placement="bottomRight"
          title={"选择一种格式下载"}
          content={content}
          trigger="click"
        >
          <DownloadButton icon="download" type="primary" />
        </Popover>
      )}
      <StyledSvg ref={ref} viewBox={viewBox}></StyledSvg>
    </Container>
  );
}

export default Svg;
