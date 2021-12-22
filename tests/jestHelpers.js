function getClassMethodNames(className, instance) {
  const functions = Object.getOwnPropertyNames(className.prototype).filter((x) => x !== 'constructor')
    .filter((e) => e !== 'constructor' && typeof instance[e] === 'function');
  return functions;
}

function getClassStaticMethodNames(className, instance = null) {
  const functions = Object.getOwnPropertyNames(className).filter((x) => x !== 'constructor')
    .filter((e) => e !== 'constructor' && (!instance || typeof instance[e] !== 'function') && typeof className[e] === 'function');
  return functions;
}

function format(str) {
  return `\n---------------------------------------------------\n${str}\n---------------------------------------------------`;
}
module.exports.getClassMethodNames = getClassMethodNames;
module.exports.getClassStaticMethodNames = getClassStaticMethodNames;
module.exports.format = format;
