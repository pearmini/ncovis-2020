import React from "react";
import styled from "styled-components";
const Container = styled.section`
  margin: 1em 0;
`;

const Title = styled.h2``;
function Introduction() {
  return (
    <Container>
      <Title>对下面问题比较感兴趣</Title>
      <ul>
        <li>疫情期间，人们喜欢讨论的问题以及随着疫情变化的变化趋势。</li>
        <li>疫情期间，新闻的主题以及随着疫情变化的变化情况。</li>
        <li>疫情期间，新闻的主题和人们讨论问题的异同和联系。</li>
      </ul>
    </Container>
  );
}
export default Introduction;
