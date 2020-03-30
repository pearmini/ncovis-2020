import React, { useState, useMemo } from "react";
import 'array-flat-polyfill';
import TreeMatrix from "./TreeMatrix";
import HeatMap from "./HeatMap";
import * as d3 from "d3";
export default function({
  dataByRegion,
  selectedRegion,
  selectedDate,
  setSelectedDate,
  setSelectedRegion,
  selectedType,
  loading
}) {
  const [isTree, setIsTree] = useState(true);
  const width = 1200,
    height = 600,
    legendWidth = 150,
    legendHeight = 10;

  const highlightColor = "red",
    normalColor = "black",
    highlightRectColor = "steelblue",
    disabledColor = "#eeeeee";

  const all = useMemo(
    () =>
      dataByRegion
        ? Array.from(dataByRegion).flatMap(([region, dataByDate]) =>
            d3
              .pairs(
                Array.from(dataByDate)
                  .map(([date, data]) => ({
                    date: date,
                    data: data.data
                  }))
                  .sort((a, b) => new Date(a.date) - new Date(b.date))
              )
              .map(([a, b]) => ({
                region,
                date: b.date,
                ...Object.keys(b.data).reduce(
                  (obj, key) => ((obj[key] = b.data[key] - a.data[key]), obj),
                  {}
                )
              }))
          )
        : [],
    [dataByRegion]
  );

  const colors = {
    dead: d3.interpolateGnBu,
    confirmed: d3.interpolateBuPu,
    cured: d3.interpolateBuGn,
    special: d3.interpolateOrRd
  };

  const treeProps = {
    dataByRegion,
    selectedRegion,
    selectedDate,
    setSelectedDate,
    setSelectedRegion,
    selectedType,
    loading,
    show: isTree,
    setShow: setIsTree,
    width,
    height,
    colors,
    all,
    highlightColor,
    normalColor,
    highlightRectColor,
    disabledColor,
    legendHeight,
    legendWidth
  };

  const heatMapProps = {
    width,
    height,
    show: !isTree,
    setShow: setIsTree,
    colors,
    all,
    selectedRegion,
    selectedType,
    loading: false,
    selectedDate,
    highlightRectColor,
    disabledColor,
    setSelectedDate,
    legendWidth,
    legendHeight
  };

  return (
    <div>
      <TreeMatrix {...treeProps} />
      <HeatMap {...heatMapProps} />
    </div>
  );
}
