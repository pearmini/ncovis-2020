import React, { useEffect } from "react";
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

function Hot({ selectedPlatform, hotlist, getHotlist, options }) {
  const platform = options.platform.find(item => item.id === selectedPlatform);
  const { data } = hotlist;
  useEffect(() => {
    getHotlist(platform);
  }, [selectedPlatform]);
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
              "top"
            ) : (
              <Bar width={item.width} />
            )}
          </Item>
        ))}
    </Container>
  );
}

export default connect(
  ({ global, hot }) => ({
    selectedPlatform: global.selectedPlatform,
    hotlist: hot.list,
    options: global.options
  }),
  {
    getHotlist: key => ({ type: "hot/getlist", payload: { key } })
  }
)(Hot);
