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
    if (!document.getElementById(str.replace('#', ''))) {
      return false;
    }
    return document.getElementById(str.replace('#', ''));
  }
  const collection = document.getElementsByClassName(str.replace(/\./, ''));
  if (collection.length === 0) { return false; }
  return [...document.getElementsByClassName(str.replace(/\./, ''))];
}
