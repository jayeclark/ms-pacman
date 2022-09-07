export function isOpen(pos) {
  return pos !== 'wall' && pos !== 'ghostbox';
}
export function isBlocked(pos) {
  return pos === 'wall' || pos === 'ghostbox';
}

export function isBetween(val, [a, b]) {
  return a < b ? val >= a && val <= b : val >= b && val <= a;
}

export function get(str) {
  if (str.startsWith('#')) {
    return document.getElementById(str.replace('#', ''));
  }
  return document.getElementsByClassName(str.replace(/\./, ''));
}
