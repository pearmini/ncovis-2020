import * as commentApi from "./service";

export default {
  namespace: "comment",
  state: {
    list: commentApi.get(),
    isOpen: false,
  },
  reducers: {
    setOpen(state, action) {
      const { value } = action.payload;
      return { ...state, isOpen: value };
    },
  },
};
