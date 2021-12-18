/* eslint-disable import/extensions */
/* eslint-disable no-extend-native */
import Board from './components/Board.js';
import RcPos from './components/RcPos.js';
import Ghost, { ghosts } from './components/Ghost.js';
import MsPacMan from './components/MsPacman.js';
import Tile from './components/Tile.js';
import Directions from './components/Directions.js';
import loadBoards from './data/boards.js';

const dots = { dotCount: 0 };
let [count, dCount, powerCount, eatenCount, score] = [0, 0, 0, 0, 0, 0];
let [munchModeActive, stop, started, restarted, restartGhosts, restartRelease] = [
  false, false, false, false, false, false,
];

String.prototype.isHall = function isHall() {
  return this === 'hall';
};
String.prototype.isWall = function isWall() {
  return this === 'wall';
};
String.prototype.isOpen = function isOpen() {
  return this !== 'wall' && this !== 'ghostbox';
};
String.prototype.isBlocked = function isBlocked() {
  return this === 'wall' || this === 'ghostbox';
};
Array.prototype.includesAll = function includesAll(...args) {
  return args.map((arg) => this.includes(arg)).every((x) => x === true);
};
Array.prototype.includesAny = function includesAny(...args) {
  return args.map((arg) => this.includes(arg)).some((x) => x === true);
};
Boolean.prototype.or = function or(bool2) {
  return this || bool2;
};
Number.prototype.isBetween = function isBetween(a, b) {
  return a < b ? this >= a && this <= b : this >= b && this <= a;
};

function get(str) {
  if (str.startsWith('#')) {
    return document.getElementById(str.replace('#', ''));
  }
  return document.getElementsByClassName(str.replace(/\./, ''));
}

// create initial board
const { array: layout, speed } = await loadBoards().then((res) => res.board1);

// create inline stylesheet for changing properties
const styleSheet = document.createElement('style');
styleSheet.id = 'header-style-sheet';
document.head.appendChild(styleSheet);

// make a board out of the layout
const board = new Board(layout, speed);
document.getElementById('game').style.top = board.tileW * 3;
document.getElementById('game').style.width = board.boardWidth;
document.getElementById('header').style.width = board.boardWidth;
board.addToGame(dots);

const [row, col] = [
  layout.findIndex((x) => x.match`P`),
  layout.find((x) => x.match`P`).indexOf`P`,
];
// eslint-disable-next-line import/prefer-default-export
export let msPacMan = new MsPacMan(new RcPos({ row, col, board }), 'right');

// Redraws board and restarts the game
function restartGame() {
  started = false;
  stop = false;
  restartGhosts = false;
  restarted = true;
  restartRelease = true;

  // erase board, score, ghosts, and msPacMan
  document.getElementById('game').innerHTML = '';
  document.getElementById('score').innerHTML = 0;
  score = 0;

  ghosts.splice(0, ghosts.length);
  const msPacKeys = Object.keys(msPacMan);
  msPacKeys.forEach((key) => {
    delete msPacMan[key];
  });

  function redraw() {
    board.addToGame(dots);
    const [rowP, colP] = [
      layout.findIndex((x) => x.match`P`),
      layout.find((x) => x.match`P`).indexOf`P`,
    ];
    msPacMan = new MsPacMan(new RcPos({ rowP, colP, board }), 'right');
  }

  setTimeout(redraw, 500);

  document.getElementById('restart').style.display = 'none';
  document.getElementById('start').style.display = '';
}

// Check proximity to edges and reverse direction and image if needed
function checkCollisions(item) {
  if (item.cache !== '') {
    // if no wall, AND the item is at a transition point, change direction + speed and clear cache

    const canTurn = ({ position: { x, y }, rcPos: { xyCoordinates } }) => (
      x === xyCoordinates.x && y === xyCoordinates.y
    );
    const canReverse = ({ cache: pacCache, direction, board: currentBoard }) => (
      pacCache === new Directions(currentBoard)[direction].reverse
    );

    const nextPositionOf = ({ pacCache, rcPos }) => rcPos.check(pacCache, 2, 2);
    if (
      nextPositionOf(item).every((pos) => pos.isOpen())
      && (canTurn(item) || canReverse(item))
    ) {
      const { cache: pacCache, direction: dir } = item;
      const downLeft = 'rotate(270deg) rotateY(180deg)';
      const upLeft = 'rotate(90deg) rotateY(180deg)';
      const { element: { style: { transform } } } = item;

      switch ((pacCache, dir, transform)) {
        case pacCache === 'down' && dir === 'left':
          item.element.style.setAttribute('transform', 'rotate(270deg) rotateY(180deg)');
          break;
        case pacCache === 'down' && dir === 'right':
          item.element.style.setAttribute('transform', 'rotate(90deg)');
          break;
        case pacCache === 'up' && dir === 'left':
          item.element.style.setAttribute('transform', 'rotate(90deg) rotateY(180deg)');
          break;
        case pacCache === 'up' && dir === 'right':
          item.element.style.setAttribute('transform', 'rotate(-90deg)');
          break;
        case pacCache === 'up' && dir === 'down' && transform.includes(downLeft):
          item.element.style.setAttribute('transform', 'rotate(270deg)');
          break;
        case pacCache === 'down' && dir === 'up' && transform.includes(upLeft):
          item.element.style.setAttribute('transform', 'rotate(90deg)');
          break;
        default:
          item.element.style.setAttribute('transform', new Directions(item.board)[
            pacCache
          ].transform);
      }

      item.setAttribute('speed', new Directions(item.board)[pacCache].speed);
      item.setAttribute('direction', pacCache);
      item.setAttribbute('cache', '');

      return true;
    }
  }

  // if there is no cache, or it wasn't cleared, check whether Ms PacMan is up against a wall
  const { direction, rcPos } = item;
  let next = rcPos[direction];
  if (direction.includes('right').or(direction.includes('down'))) {
    next = next[direction];
  }
  const [{ x, y }, { typeOf }] = [rcPos.xyCoordinates, Tile];
  if (
    typeOf(Tile.at(next)).isBlocked()
    && x === item.position.x
    && y === item.position.y
  ) {
    item.setAttribute('speed', 0);
    item.setAttribute('cache', '');
  }

  item.teleport();
  return true;
}

// Activates munchmode
function munchMode() {
  if (stop === false) {
    if (munchModeActive === false) {
      munchModeActive = true;
      ghosts.forEach((ghost) => {
        ghost.status.setAttribute('munchModeActive', true);
      });
    }

    // make free ghosts blue, turn off their eyes and turn on their frowns
    if (powerCount === 0) {
      ghosts.forEach((ghost) => {
        if (ghost.element.style.backgroundColor !== 'transparent') {
          ghost.element.style.setAttribute('backgroundColor', 'blue');

          const fringes = Array.from(
            ghost.element.getElementsByClassName('fringe'),
          );
          fringes.forEach((fringe) => {
            const { backgroundColor: color, backgroundImage: image } = fringe.style;
            if (color !== 'transparent') {
              fringe.style.setAttribute('backgroundColor', 'blue');
            } else {
              fringe.style.setAttribute('backgroundImage', image.replace(
                new RegExp(`white|${ghost.color}`),
                'blue',
              ));
            }
          });

          const divs = [
            ...Array.from(ghost.element.getElementsByClassName('eyeball')),
            ...Array.from(ghost.element.getElementsByClassName('pupil')),
            ...Array.from(ghost.element.getElementsByClassName('blue-frown')),
            ...Array.from(ghost.element.getElementsByClassName('blue-pupil')),
          ];
          divs.forEach((div) => (
            div.style.setAttribute('display', div.style.display === 'none' ? '' : 'none')
          ));
        }
      });
    } else if (powerCount < 80) {
      // animated mouth will go here
    } else if (powerCount.isBetween(80, 119)) {
      // flashing while winding down - count 80 (4 seconds)
      let tempColor = 'white';
      if (powerCount % 8 === 0) {
        tempColor = 'blue';
      }
      if (powerCount % 4 === 0) {
        ghosts.forEach((ghost) => {
          let { backgroundColor } = ghost.element.style;
          if (backgroundColor !== 'transparent') {
            if (backgroundColor.match(/blue|white/)) {
              ghost.element.style.setAttribute('backgroundColor', tempColor);
            }
            const fringes = Array.from(
              ghost.element.getElementsByClassName('fringe'),
            );

            fringes.forEach((fringe) => {
              backgroundColor = fringe.style.backgroundColor;
              if (backgroundColor.match(/blue|white/)) {
                fringe.style.setAttribute('backgroundColor', tempColor);
              } else {
                const gradient = fringe.style.backgroundImage;
                if (gradient.includes(tempColor) === false) {
                  fringe.style.setAttribute('backgroundImage', gradient.replace(
                    /blue|white/,
                    tempColor,
                  ));
                }
              }
            });
          }
        });
      }
    } else if (powerCount >= 120) {
      // done - count 120 (6 seconds) - make everything normal again
      ghosts.forEach((ghost) => {
        if (ghost.element.style.backgroundColor !== 'transparent') {
          ghost.element.style.setAttribute('backgroundColor', ghost.color);

          const fringes = Array.from(
            ghost.element.getElementsByClassName('fringe'),
          );
          fringes.forEach((fringe) => {
            const { backgroundColor, backgroundImage } = fringe.style;
            if (backgroundColor.match(/blue|white/)) {
              fringe.style.setAttribute('backgroundColor', ghost.color);
            } else {
              fringe.style.setAttribute('backgroundImage', backgroundImage.replace(
                /blue|white/,
                ghost.color,
              ));
            }
          });
          const divs = [
            ...Array.from(ghost.element.getElementsByClassName('eyeball')),
            ...Array.from(ghost.element.getElementsByClassName('pupil')),
            ...Array.from(ghost.element.getElementsByClassName('blue-frown')),
            ...Array.from(ghost.element.getElementsByClassName('blue-pupil')),
          ];
          divs.forEach((div) => {
            div.style.setAttribute('display', div.style.display === 'none' ? '' : 'none');
          });
        }
      });

      // stop function
      powerCount = 0;
      munchModeActive = false;
      ghosts.forEach((ghost) => {
        ghost.status.setAttribute('munchModeActive', false);
      });
      return true;
    }

    powerCount += 1;
  }

  setTimeout(munchMode, 50);
  return true;
}

// Tests if player has encountered a dot that should be eaten, and removes the dot if so
function checkDots(item) {
  const {
    rcPos,
    direction,
    element: {
      style: { top: itemT, left: itemL },
    },
  } = item;
  const { board: currentBoard } = rcPos;
  // find all dots in the current cell
  const classCode = `dot-${rcPos.col}-${rcPos.row}`;
  const next = rcPos[item.direction];
  let classCode2 = `dot-${next.col}-${next.row}`;
  function removeDot(id) {
    const removedDot = document
      .getElementById('game')
      .removeChild(document.getElementById(id));
    const isBig = removedDot.classList.contains('big');

    if (removedDot && isBig && munchModeActive) {
      score += 50;
      powerCount = 0;
    } else if (removedDot && isBig) {
      score += 50;
      munchMode();
    } else {
      score += 10;
    }

    document.getElementById('score').innerHTML = score;
  }

  if (direction === 'right') {
    classCode2 = `dot-${next.col + 1}-${next.row}`;
  }
  if (direction === 'down') {
    classCode2 = `dot-${next.col}-${next.row + 1}`;
  }

  const pacDots = [
    document.getElementById(classCode),
    document.getElementById(classCode2),
  ].filter((x) => x !== null);

  // check if any are in the mouth
  for (let i = 0; i < pacDots.length; i += 1) {
    const [dot, { tileW, pacWidth }] = [dots[i], currentBoard];
    const pacDotW = parseFloat(dot.style.width) || currentBoard.pacDotW;
    const [left, top] = [parseFloat(dot.style.left), parseFloat(dot.style.top)];
    const [right, bottom] = [left + pacDotW, top + pacDotW];

    const bounds = (pos) => [
      pos + tileW - pacWidth / 2,
      pos + tileW + pacWidth / 2,
    ];
    const [pacL, pacR, pacT, pacB] = [
      ...bounds(parseFloat(itemL)),
      ...bounds(parseFloat(itemT)),
    ];

    if (left > pacL && right < pacR && top > pacT && bottom < pacB) {
      removeDot(dot.id);
      eatenCount += 1;
      if (eatenCount === dots.dotCount) {
        stop = true;

        // disappear ghosts
        ghosts.forEach(({ element, status: { mode } }) => {
          element.style.setAttribute('display', mode === 'free' ? 'none' : '');
        });

        // appear 'winner'
        document.getElementById('winner').style.display = '';

        // change button to 'restart'
        document.getElementById('stop').style.display = 'none';
        document.getElementById('restart').style.display = '';
      }
    }
  }
}

// Checks whether the player has collided with a ghost, and either ends the game or eats the ghost
function checkGhostCollision() {
  // if collided with a ghost, end game
  const collidedGhosts = [];

  function getBoundaries(element) {
    const {
      left, margin, top, width,
    } = window.getComputedStyle(element);
    return [
      parseFloat(left) + parseFloat(margin),
      parseFloat(left) + parseFloat(margin) + parseFloat(width),
      parseFloat(top) + parseFloat(margin),
      parseFloat(top) + parseFloat(margin) + parseFloat(width),
    ];
  }

  const [pacL, pacR, pacT, pacB] = getBoundaries(msPacMan.element);
  const pacDir = msPacMan.direction;

  ghosts.forEach((ghost) => {
    let ghostCollision = false;
    if (ghost.status.mode === 'free') {
      const [left, right, top, bottom] = getBoundaries(ghost.element);

      if (right.isBetween(pacL, pacR) || left.isBetween(pacR, pacL)) {
        ghostCollision = top.isBetween(pacT, pacB) || bottom.isBetween(pacT, pacB);
      } else if (bottom.isBetween(pacT, pacB) || top.isBetween(pacT, pacB)) {
        ghostCollision = left.isBetween(pacL, pacR) || right.isBetween(pacL, pacR);
      }
      if (ghostCollision) { collidedGhosts.push(ghost.element.id); }
    }
  });

  if (collidedGhosts.length > 0 && powerCount === 0) {
    // stop all movement
    stop = true;
    eatenCount = 0;
    dots.dotCount = 0;

    // disappear msPacMan
    const handleReappearance = (item) => {
      item.element.style.setAttribute('display', 'none');
    };
    msPacMan.blink(handleReappearance);

    // appear 'game over' message
    document.getElementById('game-over').style.display = '';

    // change button to 'restart'
    document.getElementById('stop').style.display = 'none';
    document.getElementById('restart').style.display = '';
  } else if (collidedGhosts.length > 0 && powerCount > 0) {
    collidedGhosts.forEach((id) => {
      const ghostEl = document.getElementById(id);
      const {
        margin: gMargin,
        left: gLeft,
        top: gTop,
      } = window.getComputedStyle(ghostEl);

      const ghostL = parseFloat(gLeft) + parseFloat(gMargin);
      const ghostT = parseFloat(gTop) + parseFloat(gMargin);
      let ghostEaten = false;

      if (
        (ghostL <= pacL && pacDir === 'left')
        || (ghostL >= pacL && pacDir === 'right')
        || (ghostT <= pacT && pacDir === 'up')
        || (ghostT >= pacT && pacDir === 'down')
      ) {
        ghosts.forEach((x) => {
          if (x.element.id === id && x.status.mode === 'free') {
            ghostEaten = true;
          }
        });
      }

      if (ghostEaten === true) {
        const ghost = ghosts.filter((g) => g.element.id === id)[0];

        if (ghost.status.mode === 'free') {
          ghost.disAppear();
          board.scoreDivAdd({
            x: parseFloat(ghost.element.style.left),
            y: parseFloat(ghost.element.style.top),
          });
          score += 200;
          document.getElementById('score').innerHTML = score;
        }
      }
    });
  }
}

// Updates the position of Ms PacMan
function update() {
  if (restarted === true) {
    return false;
  }
  count += 1;
  dCount += 1;
  const { speed: pSpeed, cache: pCache, element } = msPacMan;

  function checkKey(e) {
    const dirs = [
      ['up', 38, 87],
      ['down', 40, 83],
      ['left', 37, 65],
      ['right', 39, 68],
    ];
    if (dirs.find((dir) => dir.includes(e.keyCode))) {
      msPacMan.setAttribute('cache', dirs.find((dir) => dir.includes(e.keyCode))[0]);
    }
  }

  if (stop === false) {
    document.onkeydown = checkKey;
    checkGhostCollision();
    if (pSpeed || pCache) {
      checkCollisions(msPacMan);
      checkDots(msPacMan);
      msPacMan.move();
    }
  }

  if (count === 3) {
    element.src = element.src.includes('man1')
      ? './images/mspacman2.png'
      : './images/mspacman1.png';
    count = 0;
  }

  if (dCount === 9) {
    const bigDots = [...document.getElementsByClassName('big')];
    bigDots.forEach(({ style }) => {
      style.setAttribute('display', (!style.display && 'none') || null);
    });
    dCount = 0;
  }

  setTimeout(update, 50);
  return true;
}

// Updates the position of free and returning ghosts
function updateGhosts() {
  if (restarted === true && restartGhosts === false) {
    return false;
  }

  // correct starting position if applicable
  ghosts.forEach((ghost) => {
    const { element, speed: gSpeed, status: { mode } } = ghost;
    let { position: { x, y } } = ghost;
    if (mode === 'free' && x % gSpeed > 0) {
      x += x % gSpeed;
      element.style.left = x;
    } else if (mode === 'free' && y % gSpeed > 0) {
      y += y % gSpeed;
      element.style.top = y;
    }
  });

  if (stop === false) {
    const filteredGhosts = ghosts.filter(({ status: { mode } }) => (
      mode.match(/^free|returning/)
    ));
    filteredGhosts.forEach((ghost) => {
      ghost.pickDir();
      ghost.move();
    });
  }

  setTimeout(updateGhosts, 50);
  return true;
}

// releases new ghosts from the box as applicable
function release() {
  // stop function if the game is restarted
  if (restarted === true || restartRelease === true) {
    return false;
  }

  function reArrange(ghost) {
    const result = ghost.reshuffle();
    if (result || restarted) {
      return false;
    }
    setTimeout(() => reArrange(ghost), 50);
    return true;
  }

  function leave(ghost) {
    if (restarted === true) { return false; }

    if (ghost.status.mode === 'free') {
      // recalculate box positions
      const newPos = Ghost.boxPositions(ghosts);
      if (
        newPos.center !== ''
        && (newPos.left === false || newPos.right === false)
      ) {
        // find and move center ghost
        const otherGhost = ghosts.filter((g) => g.boxPosition === 'center')[0];
        reArrange(otherGhost);
      }
      return true;
    }
    ghost.leaveBox();
    setTimeout(() => leave(ghost), 50);
    return true;
  }

  // only proceed if there are ghosts in position in the box
  const positions = Ghost.boxPositions(ghosts);
  if (Object.values(positions).some((val) => val)) {
    // center leaves first, followed by left and then right
    const { center, left, right } = positions;
    const targetBoxPosition = (center && 'center')
      || (left && 'left')
      || (right && 'right');

    // get the ghost in the target position
    const ghost = ghosts.filter((g) => g.boxPosition === targetBoxPosition)[0];

    // open the gate
    const ghostGate = document.getElementById('ghost-gate');
    ghostGate.style.backgroundColor = 'black';

    leave(ghost);
  }

  setTimeout(() => release(), 4000);
  return true;
}

// Swaps the visibility of the 'Start' and 'Stop' buttons when they are clicked
function buttonSwap() {
  get('#start').style.display = (!get('#start').style.display && 'none') || '';
  get('#stop').style.display = (!get('#stop').style.display && 'none') || '';
}

// Starts the game
function startGame() {
  if (stop === false && started === false) {
    restarted = false;
    update();
    setTimeout(updateGhosts, 1000);
    setTimeout(() => {
      restartRelease = false;
      release(board);
    }, 7000);

    const readyDiv = document.getElementById('ready');
    readyDiv.style.display = 'none';
    started = true;
  } else {
    stop = !stop;
    ghosts.forEach((ghost) => {
      ghost.status.setAttribute('stop', !ghost.status.stop);
    });
  }
  buttonSwap();
}

// Add event listeners to buttons
document.getElementById('start').addEventListener('click', startGame);
document.getElementById('stop').addEventListener('click', startGame);
document.getElementById('restart').addEventListener('click', restartGame);

// Adds a direction to msPacMan's cache when an arrow is clicked
function cache(id, msPacManPiece) {
  const dir = id.replace('-arrow', '');
  msPacManPiece.setAttribute('cache', dir);
  const arrow = document.getElementById(id);
  arrow.style.opacity = '60%';
  arrow.style.transform = 'translate(0px, 2px)';
  setTimeout(() => {
    arrow.style.opacity = '';
    arrow.style.transform = '';
  }, 100);
}

// Add event listeners to arrows
document
  .getElementById('up-arrow')
  .addEventListener('click', (e) => cache(e.currentTarget.id, msPacMan));
document
  .getElementById('down-arrow')
  .addEventListener('click', (e) => cache(e.currentTarget.id, msPacMan));
document
  .getElementById('left-arrow')
  .addEventListener('click', (e) => cache(e.currentTarget.id, msPacMan));
document
  .getElementById('right-arrow')
  .addEventListener('click', (e) => cache(e.currentTarget.id, msPacMan));
