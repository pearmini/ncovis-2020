import React, { useMemo } from "react";
import * as d3 from "d3";
import "array-flat-polyfill";

import TreeMatrix from "./TreeMatrix";
import HeatMap from "./HeatMap";

export default function ({
  dataByRegion,
  selectedRegion,
  selectedDate,
  setSelectedDate,
  setSelectedRegion,
  selectedType,
  loading,
  selectedCountries,
  treeData,
  setTreeData,
  handleChangeLevel,
  focusRegion,
  setFocusRegion,
  highlightRegions,
  setHighlightRegions,
}) {
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
                  // eslint-disable-next-line
                  (obj, key) => ((obj[key] = b.data[key] - a.data[key]), obj),
                  {}
                ),
              }))
          )
        : [],
    // eslint-disable-next-line
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
    show: focusRegion === "",
    setFocusRegion,
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
    treeData,
    setTreeData,
    handleChangeLevel,
    highlight: highlightRegions,
    setHighlight: setHighlightRegions,
  };

  const heatMapProps = {
    width,
    height,
    show: focusRegion !== "",
    setFocusRegion,
    focusRegion,
    colors,
    all,
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
