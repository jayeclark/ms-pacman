export const camelCase = (str) => {
  let newStr = str;
  const matches = newStr.match(/(-)([a-z])/g);
  matches.forEach((m) => { newStr = newStr.replace(m, m[1].toUpperCase()); });
  return str;
};
export const kebabCase = (str) => {
  const newStr = str;
  return newStr.replace(/([a-z])([A-Z])/g, (a, b, c) => `${b}-${c.toLowerCase()}`);
};
