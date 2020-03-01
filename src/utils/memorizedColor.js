export default function(domain) {
  const colorByKey = new Map();
  let pre = [],
    cur = [];

  color.pre = function(_) {
    return arguments.length ? ((pre = _), color) : pre;
  };

  color.cur = function(_) {
    return arguments.length ? ((cur = _), color) : cur;
  };

  function color(key) {
    const c = colorByKey.get(key);
    if (c) return c;
    const [rc] = domain.splice(0, 1);
    colorByKey.set(key, rc);
    if (!domain.length) {
      // 找到一个之前没有且有对应颜色的 key
      // 因为在调用 pre 方法之前，之前没有的颜色可能已经被删除过了
      const dk = pre.find(
        pk => !cur.find(ck => ck === pk) && colorByKey.get(pk)
      );
      const dc = colorByKey.get(dk);
      domain.push(dc);
      colorByKey.delete(dk);
    }
    return rc;
  }
  return color;
}
