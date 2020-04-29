import React, { useState } from "react";
import styled from "styled-components";
import { Button, Dropdown, Menu } from "antd";
import { connect } from "dva";

const Container = styled.div`
  height: 56px;
  line-height: 56px;
  background: ${(props) => props.theme.header};
  position: fixed;
  width: 100%;
  top: 0px;
  z-index: 1001;
  box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.1);
`;

const Logo = styled.span`
  font-size: 25px;
  font-family: "Titan One", cursive;
`;

const Left = styled.span`
  font-weight: bold;
`;

const Lab = styled.a`
  font-size: 16px;
  margin-left: 10px;
  font-family: "webfont" !important;
  color: ${(props) => props.theme.font};
  text-decoration: none;

  &:hover {
    color: ${(props) => props.theme.font};
  }
`;

const HeaderWrapper = styled.header`
  margin: 0 auto;
  max-width: 1200px;
  background: ${(props) => props.theme.header};
  width: 90%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: ${(props) => props.theme.font};
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
    color: ${(props) => props.theme.font};
    font-weight: bold;
    padding: 0.5em 0;
  }

  & a:hover {
    border-bottom: 1px solid white;
  }

  @media (max-width: 700px) {
    display: ${(props) => (props.show ? "block" : "none")};
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
  transform: rotate(${(props) => props.angle}deg);
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

function Header({ setOpenForm }) {
  const [show, setShow] = useState(false);
  const navs = [
    {
      name: "概览",
      id: "overview",
    },
    {
      name: "介绍",
      id: "introduction",
    },
    {
      name: "可视化",
      id: "vis",
    },
    {
      name: "发现",
      id: "story",
    },
  ];

  const menu = (
    <Menu>
      <Menu.Item>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://github.com/pearmini"
        >
          前端可视化
        </a>
      </Menu.Item>
      <Menu.Item>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://github.com/vivym"
        >
          后端爬虫
        </a>
      </Menu.Item>
      <Menu.Item>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://github.com/Kaiyiwing"
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
          <Left>
            <Logo>nCoVIS</Logo>
            <Lab href="https://vislab.wang/" target="_blank">
              山东大学 VisLab
            </Lab>
          </Left>
          <Nav show={show}>
            <ul>
              {navs.map((nav) => (
                <li key={nav.name}>
                  <a onClick={() => setShow(false)} href={"#" + nav.id}>
                    {nav.name}
                  </a>
                </li>
              ))}
              <li>
                <a
                  onClick={(e) => {
                    e.preventDefault();
                    setOpenForm(true);
                  }}
                >
                  投稿
                </a>
              </li>
              <li>
                <Dropdown overlay={menu}>
                  <a onClick={(e) => e.preventDefault()}>联系我们</a>
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
export default connect(null, {
  setOpenForm: (value) => ({
    type: "comment/setOpenForm",
    payload: { value },
  }),
})(Header);
