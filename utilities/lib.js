export const camelCase = (str) => {
  const matches = str.match(/(-)([a-z])/g);
  matches.forEach((m, i) => (str = str.replace(m, m[1].toUpperCase())));
  return str;
};
export const kebabCase = (str) =>
  str.replace(/([a-z])([A-Z])/g, "$1-" + "$2".toLowerCase());
