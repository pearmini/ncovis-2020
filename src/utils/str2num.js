export default function (str) {
  const num = Array.from(str).reduce(
    (total, ch) => total + ch.codePointAt(0),
    0
  );
  return num;
}
