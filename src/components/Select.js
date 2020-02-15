import React from "react";
import { Select } from "antd";
import { connect } from "dva";
import styled from "styled-components";
const { Option } = Select;
const Container = styled.div`
  margin-left: 1em;
  margin-bottom: 0.5em;
`;
const StyledSelect = styled(Select)`
  width: 120px;
`;

function MySelect({
  type,
  options,
  selectedRegion,
  selectedPlatform,
  setSelectedKey,
  ...rest
}) {
  const selectedOptions = options[type];
  const id = type === "platform" ? selectedPlatform : selectedRegion;
  const selectedOption = selectedOptions.find(item => item.id === id);

  return (
    <Container>
      <StyledSelect
        value={selectedOption.name}
        onChange={id => setSelectedKey(type, id)}
        {...rest}
      >
        {selectedOptions.map(item => (
          <Option key={item.id}>{item.name}</Option>
        ))}
      </StyledSelect>
    </Container>
  );
}

export default connect(
  ({ global }) => ({
    options: global.options,
    selectedPlatform: global.selectedPlatform,
    selectedRegion: global.selectedRegion
  }),
  {
    setSelectedKey: (type, id) => ({
      type: "global/setSelectedKey",
      payload: { type, id }
    })
  }
)(MySelect);
