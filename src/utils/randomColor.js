export default function(colors) {
  const colorByKey = new Map();
  function color(key) {
    const c = colorByKey.get(key);
    if (c) return c;
    const i = (Math.random() * colors.length) | 0,
      newColor = colors[i];
    colorByKey.set(key, newColor);
    return newColor;
  }
  return color;
}
