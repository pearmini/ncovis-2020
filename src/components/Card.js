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
        marginTop: 28,
        width: "90%",
        maxWidth: 1200
      }
    }
)`
  display: ${props => (props.show ? "block" : "none")};
  position: relative;
  border-radius: 8px;
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
  background: ${props => (props.type === "loading " ? "transparent" : "white")};
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

const Content = styled.ul`
  padding: 0;
  margin: 0;
  cursor: pointer;

  & li {
    list-style: none;
    padding: 0.5em;
    border-bottom: 1px solid transparent;
  }

  & li:hover {
    border-bottom: 1px solid #efefef;
  }
`;

const StyledDrawer = styled(Drawer)`
  position: absolute;
`;

const Header = styled.div`
  display: flex;
  margin: 0.5em 1em 0 1em;
  padding-bottom: 0.5em;
  border-bottom: 1px solid #efefef;
  align-items: center;
  justify-content: space-between;
`;

const Left = styled.div`
  & span {
    margin-left: 8px;
  }
`;

const Right = styled.div``;

const StyledIcon = styled(Icon)`
  cursor: pointer;
`;

const ZoomIcon = styled(StyledIcon)`
  margin-right: 8px;
`;

function State({ type, width, height }) {
  return (
    <Box width={width} height={height} type={type}>
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
  show = true,
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
      <li onClick={() => onClickItem(onDownload ? onDownload : onDownloadPng)}>
        <span>PNG</span>
      </li>
      {onDownloadSvg && (
        <li onClick={() => onClickItem(onDownloadSvg)}>
          <span>SVG</span>
        </li>
      )}
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
        show={show}
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
        ) : (
          nodata && <State width={width} height={height} />
        )}
        <Header>
          <Left>
            <StyledIcon
              type="question-circle"
              onClick={() => onClickItem(() => setMore(true))}
            />
            <span>{title}</span>
          </Left>
          <Right>
            <ZoomIcon
              type={zoom ? "fullscreen-exit" : "fullscreen"}
              onClick={() => onClickItem(() => setZoom(!zoom))}
            />
            <Popover
              placement="bottomRight"
              content={content}
              trigger="click"
              arrowPointAtCenter
              visible={pop}
            >
              <StyledIcon
                type="download"
                onClick={e => {
                  setPop(!pop);
                  e.stopPropagation();
                }}
              />
            </Popover>
          </Right>
        </Header>
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
