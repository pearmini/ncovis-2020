import React from "react";
import styled from "styled-components";
const Container = styled.div`
  position: relative;
`;
const An = styled.div`
  position: absolute;
  top: -56px;
`;
function Discovery() {
  return (
    <Container>
      <An id="discovery" />
      <h1>发现</h1>
    </Container>
  );
}

export default Discovery;
