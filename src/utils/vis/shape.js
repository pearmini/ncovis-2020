export default function(context, src, width, height) {
  const image = new Image();

  // 这里的原理暂时不知
  // 这两行主要是为了解决跨域的问题
  image.src = src + "?time=" + new Date().valueOf();
  image.crossOrigin = "Anonymous";

  image.onload = () => {
    context.drawImage(image, 0, 0, width, height);
  };
}
