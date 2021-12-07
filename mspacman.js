import { Board } from './components/Board.js';
import { RcPos } from './components/RcPos.js';
import { Ghost, ghosts } from './components/Ghost.js';
import { MsPacMan } from './components/MsPacman.js';
import { Tile } from './components/Tile.js';
import { Directions } from './components/Directions.js';
import { loadBoards } from './data/boards.js';

let [dots, count, dCount, powerCount, eatenCount, score] = [{ dotCount: 0 }, 0, 0, 0, 0, 0, 0];
let [munchModeActive, stop, started, restarted, restartGhosts, restartRelease] = [false, false, false, false, false, false];

String.prototype.isHall = function() { return this === 'hall' };
String.prototype.isWall = function() { return this === 'wall' };
String.prototype.isOpen = function() { return this !== 'wall' && this !== 'ghostbox' };
String.prototype.isBlocked = function() { return this === 'wall' || this === 'ghostbox' };
Array.prototype.includesAll = function(...args) {
  return args.map(arg => this.includes(arg)).every(x => x === true);
}
Array.prototype.includesAny = function(...args) {
  return args.map(arg => this.includes(arg)).some(x => x === true);
}
Boolean.prototype.or = function(bool2) { return this || bool2 };
Number.prototype.isBetween = function(a,b) {return this >= a && this <= b};


function get(str) {
  if (str.startsWith('#')) { return document.getElementById(str.replace('#','')) }
  return document.getElementsByClassName(str.replace(/\./,''))
}

// create initial board
const { array: layout, speed }  = await loadBoards().then(res => res.board1);

// create inline stylesheet for changing properties
const styleSheet = document.createElement('style');
styleSheet.id = "header-style-sheet";
document.head.appendChild(styleSheet);

// make a board out of the layout
const board = new Board(layout, speed);
document.getElementById('game').style.top = board.tileW * 3;
document.getElementById('game').style.width = board.boardWidth;
document.getElementById('header').style.width = board.boardWidth;
board.addToGame(dots);

const [row, col] = [layout.findIndex(x => x.match`P`), layout.find(x => x.match`P`).indexOf`P`];
export let msPacMan = new MsPacMan(new RcPos({ row, col, board }), 'right');

// Add event listeners to buttons
document.getElementById('start').addEventListener('click', startGame);
document.getElementById('stop').addEventListener('click', startGame);
document.getElementById('restart').addEventListener('click', restartGame);

// Add event listeners to arrows
document.getElementById('up-arrow').addEventListener('click', (e) => cache(e.currentTarget.id, msPacMan));
document.getElementById('down-arrow').addEventListener('click', (e) => cache(e.currentTarget.id, msPacMan));
document.getElementById('left-arrow').addEventListener('click', (e) => cache(e.currentTarget.id, msPacMan));
document.getElementById('right-arrow').addEventListener('click', (e) => cache(e.currentTarget.id, msPacMan));

// Swaps the visibility of the 'Start' and 'Stop' buttons when they are clicked
function buttonSwap() {
  get('#start').style.display = (!get('#start').style.display && 'none' ) || '';
  get('#stop').style.display = (!get('#stop').style.display && 'none' ) || '';
}

// Adds a direction to msPacMan's cache when an arrow is clicked
function cache(id, msPacMan) {
  const dir = id.replace('-arrow','');
  msPacMan.cache = dir;
  const arrow = document.getElementById(id);
  arrow.style.opacity = '60%';
  arrow.style.transform = 'translate(0px, 2px)';
  setTimeout(() => {
    arrow.style.opacity = '';
    arrow.style.transform = '';}, 100);
}

// Check prosimity to edges and reverse direction and image if needed
function checkCollisions(item) {

  if (item.cache !== '') {

    // figure out the next position based on the desired direction
    const { typeOf } = Tile;


    // if there is no wall there, AND the item is at a transition point, change the direction and speed and clear the cache
   
    const canTurn = ({position: { x,y }, rcPos: { findXY }}) => x === findXY.x && y === findXY.y;
    const canReverse = ({cache, direction, board}) => cache === new Directions(board)[direction].reverse;

    const nextPositionOf = ({cache, rcPos}) => rcPos.check(cache, 2, 2);    
    if (nextPositionOf(item).every(pos => pos.isOpen()) && (canTurn(item) || canReverse(item))) {

          const { cache, direction: dir } = item;
          const downLeft = 'rotate(270deg) rotateY(180deg)';
          const upLeft = 'rotate(90deg) rotateY(180deg)';
          const transform = item.element.style.transform;

          switch (cache, dir, transform) {
            case cache === 'down' && dir === 'left':
              item.element.style.transform = 'rotate(270deg) rotateY(180deg)'; break;
            case cache === 'down' && dir === 'right':
              item.element.style.transform = 'rotate(90deg)'; break;
            case cache === 'up' && dir === 'left':
              item.element.style.transform = 'rotate(90deg) rotateY(180deg)'; break;
            case cache === 'up' && dir === 'right':
              item.element.style.transform = 'rotate(-90deg)'; break;
            case cache === 'up' && dir === 'down' && transform.includes(downLeft):
              item.element.style.transform = 'rotate(270deg)'; break;
            case cache === 'down' && dir === 'up' && transform.includes(upLeft):
              item.element.style.transform = 'rotate(90deg)'; break;
            default:
              item.element.style.transform = new Directions(item.board)[cache].transform;
          }

          item.speed = new Directions(item.board)[cache].speed;
          item.direction = cache;
          item.cache = '';

          return true;
   
    } 
  
  }

  // if there is no cache, or it wasn't cleared, check whether Ms PacMan is up against a wall
  const { direction, rcPos } = item;
  let next = rcPos[direction];
  if (direction.includes('right').or(direction.includes('down'))) { next = next[direction];}
  let [{ x, y }, { typeOf }] = [rcPos.xyCoordinates, Tile];
  if (typeOf(Tile.at(next)).isBlocked() && x === item.position.x && y === item.position.y) {
    item.speed = 0;
    item.cache = '';
  }

  item.teleport();

}

// Tests if player has encountered a dot that should be eaten, and removes the dot if so
function checkDots(item) {

  const { rcPos, direction, element: { style: {top: itemT, left: itemL} } } = item;
  const { board } = rcPos;
  // find all dots in the current cell
  let classCode = `dot-${rcPos.col}-${rcPos.row}`;
  let next = rcPos[item.direction];
  let classCode2 = `dot-${next.col}-${next.row}`;
  if (direction === 'right') { classCode2 = `dot-${next.col + 1}-${next.row}`; }
  if (direction === 'down') { classCode2 = `dot-${next.col}-${next.row + 1}`; }

  let dots = [document.getElementById(classCode),
              document.getElementById(classCode2)].filter(x => x !== null);

  // check if any are in the mouth
  for (let i = 0; i < dots.length; i++) {

    const [dot, { tileW, pacWidth }] = [dots[i], board]; 
    const pacDotW = parseFloat(dot.style.width) || board.pacDotW;
    const [left, top] = [parseFloat(dot.style.left), parseFloat(dot.style.top)];
    const [right, bottom] = [left + pacDotW, top + pacDotW];

    const bounds = (pos) => [pos + tileW - pacWidth / 2, pos + tileW + pacWidth / 2];
    const [pacL, pacR, pacT, pacB] = [...bounds(parseFloat(itemL)), ...bounds(parseFloat(itemT)) ]

    if (left > pacL && right < pacR && top > pacT && bottom < pacB) {
      removeDot(dot.id); eatenCount++;
      if (eatenCount === dots.dotCount) {

            stop = true;

            // disappear ghosts
            ghosts.forEach(({ element, status: { mode } }) => {
              element.style.display = mode === 'free' ? 'none' : '';
            })

            // appear 'winner'
            document.getElementById('winner').style.display = '';

            // change button to 'restart'
            document.getElementById('stop').style.display = 'none';
            document.getElementById('restart').style.display = '';
      }
    }

    function removeDot(id) {
      const removedDot = document.getElementById('game').removeChild(document.getElementById(id));
      const isBig = removedDot.classList.contains('big');

      if (removedDot && isBig && munchModeActive) { score += 50; powerCount = 0; } 
      else if (removedDot && isBig) { score += 50; munchMode(); } 
      else { score += 10; }

      document.getElementById('score').innerHTML = score;
    }
  }
}

// Checks whether the player has collided with a ghost, and either ends the game or eats the ghost
function checkGhostCollision() {

  // if collided with a ghost, end game
  const collidedGhosts = [];

  function getBoundaries(element) {
    const { left, margin, top, width } = window.getComputedStyle(element);
    return [parseFloat(left) + parseFloat(margin),
            parseFloat(left) + parseFloat(margin) + parseFloat(width),
            parseFloat(top) + parseFloat(margin),
            parseFloat(top) + parseFloat(margin) + parseFloat(width)]
  }

  const [pacL, pacR, pacT, pacB] = getBoundaries(msPacMan.element)
  const pacDir = msPacMan.direction;

  ghosts.forEach(ghost => {

    let ghostCollision = false;
    if (ghost.status.mode === 'free') {
      const [left, right, top, bottom] = getBoundaries(ghost.element)
      const centerX = (left + right) / 2;
      const centerY = (top + bottom) / 2;

      if ((right >= pacL && right <= pacR) || (left <= pacR && left >= pacL)) {
        if (centerY <= pacB && centerY >= pacT) { ghostCollision = true; }
        else if (top <= pacB && top >= pacT) { ghostCollision = true; } 
        else if (bottom >= pacT && bottom <= pacB) { ghostCollision = true; }
      }
      else if ((bottom >= pacT && bottom <= pacB) || (top <= pacB && top >= pacT)) {
        if (centerX <= pacR && centerX >= pacL) { ghostCollision = true; }
        else if (left <= pacR && left >= pacL) { ghostCollision = true; } 
        else if (right >= pacL && right <= pacR) { ghostCollision = true; }
      }
      if (ghostCollision === true) { collidedGhosts.push(ghost.element.id); }
    }
  })

  if (collidedGhosts.length > 0 && powerCount === 0) {
    // stop all movement
    stop = true;
    eatenCount = 0;
    dots.dotCount = 0;

    // disappear msPacMan
    msPacMan.element.style.display = 'none';

    // appear 'game over' message
    document.getElementById('game-over').style.display = '';

    // change button to 'restart'
    document.getElementById('stop').style.display = 'none';
    document.getElementById('restart').style.display = '';
  }
  else if (collidedGhosts.length > 0 && powerCount > 0) {

    collidedGhosts.forEach(id => {
      let ghostEl = document.getElementById(id);
      const {margin: gMargin, left: gLeft, top: gTop, width: gWidth, height: gHeight} = window.getComputedStyle(ghostEl);

      let ghostL = parseFloat(gLeft) + parseFloat(gMargin);
      let ghostT = parseFloat(gTop) + parseFloat(gMargin);
      let ghostEaten = false;

      if ((ghostL <= pacL && pacDir === 'left') || (ghostL >= pacL && pacDir === 'right') ||
          (ghostT <= pacT && pacDir === 'up') || (ghostT >= pacT && pacDir === 'down')) {
            ghosts.forEach(x => {
              if (x.element.id === id && x.status.mode === 'free') ghostEaten = true
            })
      }

      if (ghostEaten === true) { 

        const ghost = ghosts.filter(g => g.element.id === id)[0];

        if (ghost.status.mode === 'free') {

          ghost.disAppear();

          board.scoreDivAdd({'x': parseFloat(ghost.element.style.left), 'y': parseFloat(ghost.element.style.top)});
          score += 200;
          document.getElementById('score').innerHTML = score;
        }

      }

    })

  }

}

// Activates munchmode
function munchMode() {

  if (stop === false) {

    if (munchModeActive === false) {
      munchModeActive = true;
      ghosts.forEach(ghost => ghost.status.munchModeActive = true);
    }

    // make free ghosts blue, turn off their eyes and turn on their frowns
    if (powerCount === 0) {

      ghosts.forEach(ghost=>{

        if (ghost.element.style.backgroundColor !== 'transparent') {

          ghost.element.style.backgroundColor = 'blue';

          let fringes = Array.from(ghost.element.getElementsByClassName('fringe'));
          fringes.forEach(fringe=> {
            let {backgroundColor: color, backgroundImage: image} = fringe.style;
            if (color !== 'transparent') {fringe.style.backgroundColor = 'blue';}
            else {
              fringe.style.backgroundImage = image.replace(new RegExp(`white|${ghost.color}`),'blue');
            }
          })

          let divs = [...Array.from(ghost.element.getElementsByClassName('eyeball')),
                      ...Array.from(ghost.element.getElementsByClassName('pupil')),
                      ...Array.from(ghost.element.getElementsByClassName('blue-frown')),
                      ...Array.from(ghost.element.getElementsByClassName('blue-pupil'))];
          divs.forEach(div => div.style.display = div.style.display === 'none' ? '' : 'none');

        }

      })
    }

    else if (powerCount < 80) {
        // animated mouth will go here
    }

    // flashing while winding down - count 80 (4 seconds)
    else if (powerCount < 120 && powerCount >= 80) {
      let tempColor = 'white';
      if (powerCount % 8 === 0) {tempColor = 'blue';}
      if (powerCount % 4 === 0) {

        ghosts.forEach(ghost=>{

          let backgroundColor = ghost.element.style.backgroundColor;
          if (backgroundColor !== 'transparent') {
            if (backgroundColor.match(/blue|white/)) {ghost.element.style.backgroundColor = tempColor;}
            let fringes = Array.from(ghost.element.getElementsByClassName('fringe'));

            fringes.forEach(fringe => {
              backgroundColor = fringe.style.backgroundColor;
              if (backgroundColor.match(/blue|white/)) {fringe.style.backgroundColor = tempColor;}
              else {
                let gradient = fringe.style.backgroundImage;
                if (gradient.includes(tempColor) === false) {
                      fringe.style.backgroundImage = gradient.replace(/blue|white/,tempColor);
                }          
              }
            })
  
          }
        })

      }

    }

    // done - count 120 (6 seconds)
    else if (powerCount >= 120) {

      // make everything normal again
      ghosts.forEach(ghost=>{

        if (ghost.element.style.backgroundColor !== 'transparent') {
          ghost.element.style.backgroundColor = ghost.color;

          let fringes = Array.from(ghost.element.getElementsByClassName('fringe'));
          fringes.forEach(fringe => {
            let { backgroundColor, backgroundImage } = fringe.style;
            if (backgroundColor.match(/blue|white/)) {fringe.style.backgroundColor = ghost.color;}
            else {fringe.style.backgroundImage = backgroundImage.replace(/blue|white/, ghost.color);}
          })
          let divs = [...Array.from(ghost.element.getElementsByClassName('eyeball')), 
                      ...Array.from(ghost.element.getElementsByClassName('pupil')),
                      ...Array.from(ghost.element.getElementsByClassName('blue-frown')),
                      ...Array.from(ghost.element.getElementsByClassName('blue-pupil'))];
          divs.forEach(div => div.style.display = div.style.display === 'none' ? '' : 'none');

        }

      })

      // stop function
      powerCount = 0;
      munchModeActive = false;
      ghosts.forEach(ghost => ghost.status.munchModeActive = false);
      return true;

    }

    powerCount++;

  }

  setTimeout(munchMode, 50);

}

// releases new ghosts from the box as applicable
function release(board) {

  // stop function if the game is restarted
  if (restarted === true || restartRelease === true) {return false;}

  // only proceed if there are ghosts in position in the box
  const positions = Ghost.boxPositions(ghosts);
  if (Object.values(positions).some(val => val)) {

    // center leaves first, followed by left and then right
    const {center, left, right} = positions
    const targetBoxPosition = (center && 'center') || (left && 'left') || (right && 'right');

    // get the ghost in the target position
    let ghost = ghosts.filter(g => g.boxPosition === targetBoxPosition)[0];

    // open the gate
    const ghostGate = document.getElementById('ghost-gate');
    ghostGate.style.backgroundColor = 'black';

    leave(ghost);

    function leave(ghost) {
      if (restarted === true) {return false;}
      if (ghost.status.mode === 'free') {
        // recalculate box positions
        let newPos = Ghost.boxPositions(ghosts);
        if (newPos.center !== '' && (newPos.left === false || newPos.right === false)) {
          // find and move center ghost
          otherGhost = ghosts.filter(g => g.boxPosition === 'center')[0];
          reArrange(otherGhost);
        }
        return true;
      }
      ghost.leaveBox();
      setTimeout(function() {leave(ghost)},50);
    }

    function reArrange(ghost) {
      let result = ghost.reshuffle();
      if (result || restarted) {return false;}
      setTimeout(function() {reArrange(ghost)},50)
    }
    
  }

  setTimeout(function() {release(board);},4000)

}

// Redraws board and restarts the game
function restartGame() {

  started = stop = restartGhosts = false;
  restarted = restartRelease = true;
  
  // erase board, score, ghosts, and msPacMan
  document.getElementById('game').innerHTML = '';
  document.getElementById('score').innerHTML = 0;
  score = 0;

  ghosts.splice(0, ghosts.length);
  const msPacKeys = Object.keys(msPacMan);
  msPacKeys.forEach(key=> { delete msPacMan[key]; })

  setTimeout(redraw, 500);

  document.getElementById('restart').style.display = 'none';
  document.getElementById('start').style.display = ''; 

  function redraw() {
    board.addToGame(dots);
    const [row, col] = [layout.findIndex(x=> x.match`P`), layout.find(x => x.match`P`).indexOf`P`];
    msPacMan = new MsPacMan(new RcPos({ row, col, board }), 'right');
  }
}
// Starts the game
function startGame() {

  if (stop === false && started === false) {
    restarted = false;
    update();
    setTimeout(updateGhosts, 1000);
    setTimeout(() => { restartRelease = false; release(board); }, 7000);

    let readyDiv = document.getElementById('ready');
    readyDiv.style.display = 'none';
    started = true;
  } else {
    stop = !stop;
    ghosts.forEach(ghost => ghost.status.stop = !ghost.status.stop);
  }
  buttonSwap();
}

// Updates the position of Ms PacMan
function update() {

  if (restarted === true) { return false; }
  count++; dCount++;
  const { speed, cache, element } = msPacMan;

  if (stop === false) {

    document.onkeydown = checkKey;
    checkGhostCollision();
    if (speed || cache) { checkCollisions(msPacMan); checkDots(msPacMan); msPacMan.move(); }

    function checkKey(e) {
      const dirs = [['up', 38, 87],['down', 40, 83],['left', 37, 65],['right', 39, 68]]
      if (dirs.find(dir => dir.includes(e.keyCode))) {
        msPacMan.cache = dirs.find(dir => dir.includes(e.keyCode))[0];
      }
    }
  }

  if (count === 3) {
    element.src = element.src.includes('man1') ? './images/mspacman2.png' : './images/mspacman1.png';
    count = 0;
  }

  if (dCount === 9) {
    let bigDots = [...document.getElementsByClassName('big')];
    bigDots.forEach(({ style }) => style.display = (!style.display && 'none') || null )
    dCount = 0;
  }

  setTimeout(update, 50);
}

// Updates the position of free and returning ghosts
function updateGhosts() {

  if (restarted === true && restartGhosts === false) { return false; }

  // correct starting position if applicable
  ghosts.forEach(ghost=> {
    let { element, speed, position: { x, y }, status: { mode } } = ghost;
    if (mode === 'free' && x % speed > 0) { x += x % speed; element.style.left = x; }
    else if (mode === 'free' && y % speed > 0) { y += y % speed; element.style.top = y; }
  })

  if (stop === false) {
    const filteredGhosts = ghosts.filter(({ status: { mode } }) =>  mode.match(/^free|returning/));
    for (let ghost of filteredGhosts) { ghost.pickDir(); ghost.move(); }
  }

  setTimeout(updateGhosts, 50);
}