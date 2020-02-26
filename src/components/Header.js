import React, { useState } from "react";
import styled from "styled-components";
import { Button } from "antd";
const Logo = styled.div`
  color: white;
  font-size: 25px;
  font-weight: bold;
  color: white;
`;

const Container = styled.div`
  display: relative;
  height: 56px;
  background: black;
  line-height: 56px;
  position: fixed;
  width: 100%;
  top: 0px;
  z-index: 3;
`;

const HeaderWrapper = styled.header`
  margin: 0 auto;
  max-width: 1200px;
  background: black;
  width: 90%;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Nav = styled.nav`
  & ul {
    margin-bottom: 0;
  }
  & li {
    display: inline-block;
    margin-left: 1em;
    list-style-type: none;
  }
  & a {
    color: white;
  }

  @media (max-width: 700px) {
    display: ${props => (props.show ? "block" : "none")};
    position: absolute;
    top: 100%;
    right: 0;
    z-index: 10;

    & ul {
      background: black;
      padding: 0 2.5em 0 2em;
    }
    & li {
      display: block;
    }
  }
`;

const ToggleButton = styled(Button)`
  display: none;
  @media (max-width: 700px) {
    display: block;
  }
`;

const Overlayer = styled.div`
  position: fixed;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2;
`;

function Header() {
  const [show, setShow] = useState(false);

  function jumpTo(id) {
    const element = document.getElementById(id);
    let { offsetTop: actualTop } = element;
    let current = element.offsetParent;
    while (current) {
      actualTop += current.offsetTop;
      current = current.offsetParent;
    }
    setShow(false);
  }

  const navs = [
    {
      name: "介绍",
      id: "introduction"
    },
    {
      name: "舆论可视化",
      id: "hots"
    },
    {
      name: "新闻可视化",
      id: "news"
    },
    {
      name: "故事",
      id: "story"
    },
    {
      name: "发现",
      id: "discovery"
    }
  ];
  return (
    <>
      <Container>
        <HeaderWrapper>
          <Logo>nCov 社交媒体可视化</Logo>
          <Nav show={show}>
            <ul>
              {navs.map(nav => (
                <li key={nav.name}>
                  <a onClick={() => jumpTo(nav.id)} href={"#" + nav.id}>
                    {nav.name}
                  </a>
                </li>
              ))}
            </ul>
          </Nav>
          <ToggleButton icon="menu" ghost onClick={() => setShow(!show)} />
        </HeaderWrapper>
      </Container>
      {show && <Overlayer onClick={() => setShow(false)} />}
    </>
  );
}
export default Header;
