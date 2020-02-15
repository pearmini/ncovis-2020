export default function(str, cnt) {
  return str.length <= cnt ? str : str.substr(0, cnt) + "...";
}
