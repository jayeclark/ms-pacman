export const camelCase = (str) => {
  if (typeof str !== 'string') {
    throw Error('the argument provided to the function camelCase must be a string!');
  }
  let newStr = str;
  const matches = newStr.match(/(-+|_+)([a-z])/g);
  if (matches) {
    matches.forEach((m) => { newStr = newStr.replace(m, m[m.length - 1].toUpperCase()); });
  }
  return newStr[0].toLowerCase() + newStr.slice(1);
};
export const kebabCase = (str) => {
  if (typeof str !== 'string') {
    throw Error('the argument provided to the function camelCase must be a string!');
  }
  let newStr = str;
  newStr = newStr.replace(/(_+)([a-z])/gi, (a, b, c) => `-${c.toLowerCase()}`);
  newStr = newStr.replace(/([a-z])([A-Z]{1,2})(?=[^[A-Z])/g, (a, b, c) => {
    if (c.length > 1) {
      return `${b}-${c[0].toLowerCase()}-${c[1].toLowerCase()}`;
    }
    return `${b}-${c.toLowerCase()}`;
  });

  return newStr[0].toLowerCase() + newStr.slice(1);
};

export const endEntry = (item, finalDirection) => {
  const ghost = item;
  ghost.setDirection(finalDirection);
  ghost.speed = 0;
  ghost.spawn(ghost.isInBox ? 'notfree' : 'free');
};

export const ghostGateCoords = (board) => {
  const {
    tileW: t,
    ghostContainer: {
      gateStart: { x, y },
      gateEnd: { y: yE },
    },
  } = board;
  const [xS, yS] = [x + (t / 2), y - t * 2];
  const [leftPos, rightPos] = [xS - t * 2, xS - t * 2];
  return {
    xS, yS, yE, leftPos, rightPos,
  };
};

export const startEntry = (item) => {
  const { xS } = ghostGateCoords(item.board);
  const ghost = item;
  const { element: { id }, board: { ghostsInBox } } = item;
  ghost.setDirection('down');
  ghost.position.x = xS;
  ghost.element.style.left = `${ghost.position.x}px`;
  ghost.status.mode = 'reentering';

  document.getElementById('ghost-gate').style.backgroundColor = 'black';
  if (ghostsInBox.includes(id) === false) {
    ghostsInBox.push(id);
  }
  setTimeout(() => {
    document.getElementById('ghost-gate').style.backgroundColor = '#e1e1fb';
  }, 500);
};

export const startReshuffle = (item, direction) => {
  const ghost = item;
  ghost.setDirection(direction);
  ghost.status.mode = 'reshuffling';
};
