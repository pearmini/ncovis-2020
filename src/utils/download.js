// https://observablehq.com/@mbostock/saving-svg
export function serialize(svg) {
  const xmlns = "http://www.w3.org/2000/xmlns/";
  const xlinkns = "http://www.w3.org/1999/xlink";
  const svgns = "http://www.w3.org/2000/svg";
  svg = svg.cloneNode(true);
  const fragment = window.location.href + "#";
  const walker = document.createTreeWalker(
    svg,
    NodeFilter.SHOW_ELEMENT,
    null,
    false
  );
  while (walker.nextNode()) {
    for (const attr of walker.currentNode.attributes) {
      if (attr.value.includes(fragment)) {
        attr.value = attr.value.replace(fragment, "#");
      }
    }
  }
  svg.setAttributeNS(xmlns, "xmlns", svgns);
  svg.setAttributeNS(xmlns, "xmlns:xlink", xlinkns);
  const serializer = new window.XMLSerializer();
  const string = serializer.serializeToString(svg);
  return new Blob([string], { type: "image/svg+xml" });
}

export function rasterize(svg) {
  let resolve, reject;
  const promise = new Promise((y, n) => ((resolve = y), (reject = n)));
  const image = new Image();
  image.onerror = reject;
  image.onload = () => {
    const rect = svg.getBoundingClientRect();
    const canvas = document.createElement("canvas");
    canvas.width = rect.width;
    canvas.height = rect.height;
    const context = canvas.getContext("2d");
    context.drawImage(image, 0, 0, rect.width, rect.height);
    context.canvas.toBlob(resolve);
  };
  image.src = URL.createObjectURL(serialize(svg));
  return promise;
}

export default function(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || "nCov-vis";
  a.click();
}
