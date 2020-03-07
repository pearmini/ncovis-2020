const wrapper = d => (d < 10 ? "0" + d : d);
export default function(time) {
  const year = time.getFullYear(),
    month = time.getMonth() + 1,
    date = time.getDate() + 1;
  return `${year}-${wrapper(month)}-${wrapper(date)}`;
}
