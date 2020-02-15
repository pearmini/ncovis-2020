import React from "react";
import styled from "styled-components";
const Title = styled.h3`
  padding-top: 0.5em;
`;
const Container = styled.section``;
const Box = styled.div`
  width: 400px;
  height: 150px;
  border: 1px solid black;
`;

function Heat() {
  return (
    <Container>
      <Title>每天新增确诊数</Title>
      <Box></Box>
    </Container>
  );
}

export default Heat;
