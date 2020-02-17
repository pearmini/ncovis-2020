export default function(array, element, cb) {
  let index = -1;
  array.forEach((item, i) => cb(element, item) && (index = i));
  return index;
}
