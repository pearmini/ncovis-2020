import React, { useState } from "react";
import styled from "styled-components";
import { Button, Dropdown, Menu } from "antd";
const Logo = styled.div`
  color: white;
  font-size: 25px;
  font-weight: bold;
  color: ${props => props.theme.font};
  font-family: "Titan One", cursive;
`;

const Container = styled.div`
  display: relative;
  height: 56px;
  background: ${props => props.theme.header};
  line-height: 56px;
  position: fixed;
  width: 100%;
  top: 0px;
  z-index: 15;
  box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.1);
`;

const HeaderWrapper = styled.header`
  margin: 0 auto;
  max-width: 1200px;
  background: ${props => props.theme.header};
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
    color: ${props => props.theme.font};
    font-weight: bold;
    padding: 0.5em 0;
  }

  & a:hover {
    border-bottom: 1px solid white;
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
  transform: rotate(${props => props.angle}deg);
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
  const navs = [
    {
      name: "概览",
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
      name: "发现",
      id: "story"
    }
  ];

  const menu = (
    <Menu>
      <Menu.Item>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="http://www.alipay.com/"
        >
          前端可视化
        </a>
      </Menu.Item>
      <Menu.Item>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="http://www.taobao.com/"
        >
          后端爬虫
        </a>
      </Menu.Item>
      <Menu.Item>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="http://www.tmall.com/"
        >
          数据处理
        </a>
      </Menu.Item>
    </Menu>
  );
  return (
    <>
      <Container>
        <HeaderWrapper>
          <Logo>nCoVIS 2020</Logo>
          <Nav show={show}>
            <ul>
              {navs.map(nav => (
                <li key={nav.name}>
                  <a onClick={() => setShow(false)} href={"#" + nav.id}>
                    {nav.name}
                  </a>
                </li>
              ))}
              <li>
                <Dropdown overlay={menu}>
                  <a onClick={e => e.preventDefault()}>github</a>
                </Dropdown>
              </li>
            </ul>
          </Nav>
          <ToggleButton
            icon="menu"
            ghost
            onClick={() => setShow(!show)}
            angle={show ? 90 : 0}
          />
        </HeaderWrapper>
      </Container>
      {show && <Overlayer onClick={() => setShow(false)} />}
    </>
  );
}
export default Header;
