import React from "react";
import { connect } from "dva";
import styled from "styled-components";
import substr from "../utils/substr";
import indexOf from "../utils/indexOf";

const Container = styled.section``;
const Item = styled.div.attrs(props => ({
  style: {
    color: props.selected && "red"
  }
}))`
  margin-bottom: 0.5em;
`;

const Title = styled.h3`
  padding-top: 0.5em;
`;
const Bar = styled.div.attrs(props => ({
  style: {
    background: props.disabled ? "#efefef" : props.color || "steelblue",
    width: props.width
  }
}))`
  display: inline-block;
  height: 1em;
  cursor: pointer;
`;

const Text = styled.a`
  display: inline-block;
  width: 260px;
`;

const Span = styled.span`
  color: ${props => (props.disabled ? "#efefef" : props.color || "black")};
  font-weight: bold;
  cursor: pointer;
`;

function Hot({ list = [], selectedWords, toggleHots }) {
  if (selectedWords.length === 0) {
    list.forEach(item => (item.disabled = false));
  } else {
    list.forEach(item => {
      const index = indexOf(selectedWords, item, (a, b) => a.index === b.index);
      item.disabled = index === -1 ? true : false;
    });
  }

  return (
    <Container>
      <Title>Hot</Title>
      {list.map((item, index) => (
        <Item key={index}>
          <Text href={item.url} target="_blank">
            ({index + 1}) {substr(item.title, 15)}
          </Text>
          {isNaN(item.width) || item.width <= 0 ? (
            <Span
              color={item.color}
              disabled={item.disabled}
              onClick={() => toggleHots(item)}
            >
              置顶
            </Span>
          ) : (
            <Bar
              width={item.width}
              color={item.color}
              disabled={item.disabled}
              onClick={() => toggleHots(item)}
            />
          )}
        </Item>
      ))}
    </Container>
  );
}

export default connect(
  ({ global }) => ({
    selectedWords: global.selectedWords
  }),
  {
    toggleHots: item => ({
      type: "global/toggleHots",
      payload: { item }
    })
  }
)(Hot);
