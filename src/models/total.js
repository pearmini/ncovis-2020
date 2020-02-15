import total from "../assets/data/total.json";

total.data.forEach(item => (item.date = new Date(item.date)));

export default {
  namespace: "total",
  state: total,
  reducers: {}
};
