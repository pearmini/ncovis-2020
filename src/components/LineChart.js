import React from "react";
import Svg from "./Svg";
import styled from "styled-components";
import { connect } from "dva";
import * as d3 from "d3";
const Title = styled.h3`
  padding-top: 1em;
`;
const Container = styled.section``;
const Box = styled.div`
  width: 400px;
  height: 150px;
`;

function Line({ data = [] }) {
  const width = 400,
    height = 150,
    margin = { top: 20, right: 5, bottom: 20, left: 40 };

  function drawLineChart(svg) {
    const x = d3
      .scaleUtc()
      .domain(d3.extent(data, d => d.date))
      .range([margin.left, width - margin.right]);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, d => d.confirm)])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const xAxis = g =>
      g.attr("transform", `translate(0,${height - margin.bottom})`).call(
        d3
          .axisBottom(x)
          .ticks(width / 80)
          .tickSizeOuter(0)
      );

    const yAxis = g =>
      g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))
        .call(g => g.select(".domain").remove())
        .call(g =>
          g
            .select(".tick:last-of-type text")
            .clone()
            .attr("x", 3)
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .text(data.y)
        );

    const line = d3
      .line()
      .defined(d => !isNaN(d.confirm))
      .x(d => x(d.date))
      .y(d => y(d.confirm));

    svg.append("g").call(xAxis);

    svg.append("g").call(yAxis);

    svg
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("d", line);
  }

  return (
    <Container>
      <Title>确诊总人数</Title>
      <Box>
        <Svg width={width} height={height}>
          {svg => drawLineChart(svg)}
        </Svg>
      </Box>
    </Container>
  );
}

export default connect(({ total }) => ({
  data: total.data
}))(Line);
