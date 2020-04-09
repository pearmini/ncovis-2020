import React, { useState, useMemo } from "react";
import "array-flat-polyfill";
import TreeMatrix from "./TreeMatrix";
import HeatMap from "./HeatMap";
import * as d3 from "d3";
export default function ({
  dataByRegion,
  selectedRegion,
  selectedDate,
  setSelectedDate,
  setSelectedRegion,
  selectedType,
  loading,
  selectedRange,
  setSelectedRange,
  selectedCountries,
  treeData,
  setTreeData,
  handleChangeRange,
}) {
  const [isTree, setIsTree] = useState(true);
  const width = 1200,
    height = 650,
    legendWidth = 200,
    legendHeight = 10;

  const highlightColor = "red",
    normalColor = "black",
    highlightRectColor = "red",
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
                    data: data.data,
                  }))
                  .sort((a, b) => new Date(a.date) - new Date(b.date))
              )
              .map(([a, b]) => ({
                region,
                date: b.date,
                ...Object.keys(b.data).reduce(
                  (obj, key) => ((obj[key] = b.data[key] - a.data[key]), obj),
                  {}
                ),
              }))
          )
        : [],
    [dataByRegion, selectedCountries.length]
  );

  const colors = {
    dead: d3.interpolatePurples,
    confirmed: d3.interpolateReds,
    cured: d3.interpolateGreens,
    special: d3.interpolatePuRd,
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
    legendWidth,
    selectedRange,
    setSelectedRange,
    treeData,
    setTreeData,
    handleChangeRange,
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
    legendHeight,
  };

  return (
    <div>
      <TreeMatrix {...treeProps} />
      <HeatMap {...heatMapProps} />
    </div>
  );
}
