import React from "react";
import styled from "styled-components";
const Container = styled.div`
  position: relative;
  margin-top: 1em;
`;
const An = styled.div`
  position: absolute;
  top: -56px;
`;
function CommentPanel() {
  return (
    <Container>
      <An id="story" />
      <h1>发现</h1>
    </Container>
  );
}

export default CommentPanel;
