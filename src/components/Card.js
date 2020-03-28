import React, { useState, useRef } from "react";
import styled from "styled-components";
import useSize from "../hook/useSize";
import { Popover, Empty, Spin, Icon, Drawer } from "antd";

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
        maxWidth: 1200
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
  background: transparent;
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

const Grid = styled.div`
  right: 0px;
  top: 0px;
  position: absolute;
  cursor: pointer;
  width: 30px;
  height: 30px;
`;

const More = styled.div`
  position: absolute;
  right: 13px;
  top: 19px;
  cursor: pointer;

  &,
  &::before,
  &::after {
    content: "";
    width: 5px;
    height: 5px;
    display: block;
    background: black;
    border-radius: 50%;
  }

  &::before {
    transform: translateY(-7px);
  }

  &::after {
    transform: translateY(2px);
  }
`;

const Content = styled.ul`
  padding: 0;
  margin: 0;
  cursor: pointer;
  & li {
    list-style: none;
    padding: 0.5em 1em;
  }

  & span {
    margin-left: 0.75em;
  }

  & li:hover {
  }
`;

const StyledDrawer = styled(Drawer)`
  position: absolute;
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
  title = "title",
  introduction,
  ...rest
}) {
  const ref = useRef(null);
  const { width, height } = useSize(ref);
  const [zoom, setZoom] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [more, setMore] = useState(false);
  const [pop, setPop] = useState(false);

  const content = (
    <Content>
      <li onClick={() => onClickItem(() => setZoom(!zoom))}>
        <Icon type={zoom ? "fullscreen-exit" : "fullscreen"} />
        <span>{zoom ? "缩小" : "放大"}</span>
      </li>
      <li onClick={() => onClickItem(onDownload ? onDownload : onDownloadPng)}>
        <Icon type="download" />
        <span>PNG</span>
      </li>
      {onDownloadSvg && (
        <li onClick={() => onClickItem(onDownloadSvg)}>
          <Icon type="download" />
          <span>SVG</span>
        </li>
      )}
      <li onClick={() => onClickItem(() => setMore(true))}>
        <Icon type="question" />
        <span>详情</span>
      </li>
    </Content>
  );

  function onClickItem(cb) {
    cb && cb();
    setPop(false);
  }

  return (
    <>
      <Container
        ref={ref}
        {...rest}
        zoom={zoom}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => {
          setHovered(false);
          setPop(false);
        }}
        onClick={() => setPop(false)}
      >
        {loading ? (
          <State width={width} height={height} type="loading" />
        ) : nodata ? (
          <State width={width} height={height} />
        ) : (
          hovered && (
            <Popover
              placement="bottomRight"
              content={content}
              trigger="click"
              arrowPointAtCenter
              visible={pop}
            >
              <Grid
                onClick={e => {
                  setPop(!pop);
                  e.stopPropagation();
                }}
              >
                <More></More>
              </Grid>
            </Popover>
          )
        )}
        {children}
        <StyledDrawer
          title={title}
          placement="right"
          closable={true}
          onClose={() => setMore(false)}
          visible={more}
          getContainer={false}
        >
          {introduction}
        </StyledDrawer>
      </Container>
      {zoom && <Layer onClick={() => setZoom(false)} />}
    </>
  );
}

export default Card;
