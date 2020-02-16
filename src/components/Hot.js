import React from "react";
import { connect } from "dva";
import styled from "styled-components";
import substr from "../utils/substr";

const Container = styled.section``;
const Item = styled.div``;
const Title = styled.h3`
  padding-top: 0.5em;
`;
const Bar = styled.div`
  background: steelblue;
  display: inline-block;
  width: ${props => props.width}px;
  height: 1em;
`;

const Text = styled.span`
  display: inline-block;
  width: 300px;
`;

function Hot({ data }) {
  return (
    <Container>
      <Title>Hot</Title>
      {data &&
        data.map((item, index) => (
          <Item key={index}>
            <Text>
              ({index + 1}) {substr(item.title, 15)}
            </Text>
            {isNaN(item.width) || item.width <= 0 ? (
              "置顶"
            ) : (
              <Bar width={item.width} />
            )}
          </Item>
        ))}
    </Container>
  );
}

export default connect(({ hot }) => ({
  data: hot.list
}))(Hot);
