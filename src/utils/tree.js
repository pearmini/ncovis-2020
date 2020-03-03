import * as d3 from "d3";
export function find(source, cb) {
  let target;
  eachBefore(source, d => {
    if (cb(d)) target = d;
  });
  return target;
}

export function eachBefore(node, cb) {
  node.children && node.children.forEach(d => eachBefore(d, cb));
  cb(node);
}

export function eachAfter(node, cb) {
  cb(node);
  node.children && node.children.forEach(d => eachBefore(d, cb));
}

export function filter(root, cb) {
  let nodes = [];
  eachBefore(root, node => {
    if (cb(node)) nodes.push(node);
  });
  return nodes;
}

export function treeHeight(root) {
  eachBefore(root, node => {
    node.height = hasChildren(node, d => !d.hide)
      ? d3.max(node.children, d => d.height) + 1
      : 0;
  });
  return root.height;
}

export function hasChildren(node, cb = () => true) {
  return node.children && node.children.every(d => cb(d));
}
