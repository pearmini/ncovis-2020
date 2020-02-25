import React, { useRef, useState } from "react";
import styled from "styled-components";
import { useMouse } from "react-use";
import { Button, Popover } from "antd";

const Container = styled.div.attrs(
  props =>
    props.zoom && {
      style: {
        position: "fixed",
        zIndex: 10,
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        width: "90%"
      }
    }
)`
  position: relative;
  max-width: 900px;
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.5s;
  background: white;
  cursor: pointer;
  &:hover {
    box-shadow: 0px 0px 10px 3px rgba(0, 0, 0, 0.1);
  }
`;

const Row = styled.div`
  display: flex;
  justify-content: space-around;
`;

const DownloadButton = styled(Button)`
  right: 5px;
  top: 5px;
  position: absolute;
`;

const ZoomButton = styled(Button)`
  right: 40px;
  top: 5px;
  position: absolute;
`;

const Layer = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  z-index: 5;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
`;

function Card({ children, onDownload, onDownloadPng, onDownloadSvg, ...rest }) {
  const ref = useRef(null);
  const [zoom, setZoom] = useState(false);
  const { elX, elY, elW, elH } = useMouse(ref);
  const mouseHovered = elX > 0 && elX < elW && elY > 0 && elY < elH;
  const content = (
    <Row>
      <Button onClick={() => onDownloadPng && onDownloadPng()}>png</Button>
      <Button onClick={() => onDownloadSvg && onDownloadSvg()}>svg</Button>
    </Row>
  );

  const buttonGroup = (
    <>
      <ZoomButton
        icon={zoom ? "fullscreen-exit" : "fullscreen"}
        size="small"
        type="primary"
        onClick={() => setZoom(!zoom)}
      />
      {onDownload ? (
        <DownloadButton
          icon="download"
          type="primary"
          size="small"
          onClick={() => onDownload && onDownload()}
        />
      ) : (
        <Popover
          placement="bottomRight"
          title={"选择一种格式下载"}
          content={content}
          trigger="click"
        >
          <DownloadButton icon="download" type="primary" size="small" />
        </Popover>
      )}
    </>
  );
  return (
    <>
      <Container ref={ref} {...rest} zoom={zoom}>
        {mouseHovered && buttonGroup}
        {children}
      </Container>
      {zoom && <Layer onClick={() => setZoom(false)} />}
    </>
  );
}

export default Card;
