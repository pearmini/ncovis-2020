import React, { useState, useRef } from "react";
import styled from "styled-components";
import useSize from "../hook/useSize";
import { Button, Popover, Empty, Spin } from "antd";

const Container = styled.div.attrs(
  props =>
    props.zoom && {
      style: {
        position: "fixed",
        zIndex: 10,
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        width: "90%",
        maxWidth: 900
      }
    }
)`
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.5s;
  background: white;
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

const Box = styled.div`
  width: ${props => props.width}px;
  height: ${props => props.height}px;
  line-height: ${props => props.height}px;
  z-index: 10;
  background: white;
  position: absolute;
  left: 0;
  top: 0;
`;

const MiddleSpin = styled(Spin)`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
`;

const MiddleEmpty = styled(Empty)`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  margin: 0;
`;

function State({ type, width, height }) {
  return (
    <Box width={width} height={height}>
      {type === "loading" ? (
        <MiddleSpin />
      ) : (
        <MiddleEmpty
          description="暂无数据"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}
    </Box>
  );
}

function Card({
  children,
  onDownload,
  onDownloadPng,
  onDownloadSvg,
  loading,
  nodata,
  ...rest
}) {
  const ref = useRef(null);
  const { width, height } = useSize(ref);
  const [zoom, setZoom] = useState(false);
  const [hovered, setHovered] = useState(false);

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
      <Container
        ref={ref}
        {...rest}
        zoom={zoom}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {loading ? (
          <State width={width} height={height} type="loading" />
        ) : nodata ? (
          <State width={width} height={height} />
        ) : (
          hovered && buttonGroup
        )}
        {children}
      </Container>
      {zoom && <Layer onClick={() => setZoom(false)} />}
    </>
  );
}

export default Card;
