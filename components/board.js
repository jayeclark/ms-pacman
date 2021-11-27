import { Directions } from './Directions.js';
import { Ghost, ghosts } from './Ghost.js';
import { GhostBox, MessageDiv } from './GhostBox.js';
import { Wall } from './Wall.js';
import { Tile } from './Tile.js';
import { PacDot } from './PacDot.js';
import { loadBoards } from '../data/boards.js';

const boardObj = await loadBoards().then(res => res.board1);
const board = await boardObj.array;
const speed = await boardObj.speed;

// create additional stylesheet for changing properties
const styleSheet = document.createElement('style');
styleSheet.innerHTML = 'body {background-color: black;}';
styleSheet.innerHTML += '@media only screen and (max-width: 760px) {#test-div { display: none; }}';
document.head.appendChild(styleSheet);

export class RcPos {
  constructor(row,col,board) { this.row = row; this.col = col; this.board = board;}
  get left() { return (new RcPos(this.row, this.col - 1, this.board)) }
  get right() { return (new RcPos(this.row, this.col + 1, this.board)) }
  get bottom() { return (new RcPos(this.row + 1, this.col, this.board)) }
  get down() { return (new RcPos(this.row + 1, this.col, this.board)) }
  get top() { return (new RcPos(this.row - 1, this.col, this.board)) }
  get up() { return (new RcPos(this.row - 1, this.col, this.board)) } 
  get findXY() { return { x: this.col * this.board.tileW, y: this.row * this.board.tileW } }
  get xyCoordinates() { return { x: this.col * this.board.tileW, y: this.row * this.board.tileW } }

  checkRunLength(direction) {
    if (direction === 'same') {return 0;}
    const [{ typeOf }, d] = [Tile, new Directions(this.board)];
    let pos = new RcPos(this.row, this.col, this.board);
    let [hitWall, runCount] = [false, 0];
    while (hitWall === false && pos.col > 0 && pos.col < this.board.cols - 1) {
      if (typeOf(Tile.at(pos)).isBarrier()) {
        hitWall = true;
      } else {
        runCount++; 
        pos.row += d[direction].row;
        pos.col += d[direction].col;
      }
    }
    return runCount;
  }
}

class Board {
  constructor(arr, speed) {
    this.layout = arr;
    this.rows = arr.length;
    this.cols = arr[0].length;
    this.speed = speed;
    this.tileW = Math.min(this.rowHeight, this.colHeight) 
    this.portals = [];
    this.ghostContainer = this.calculateGhostContainer();
    this.ghostPositions = [];
    this.ghostsInBox = [];

    this.adjustStyleSheet(styleSheet)

  }

  get fringeW() { return Math.floor(this.tileW * 1.5 / 12) }
  get cornerW() { return this.tileW / 2}
  get pacDotW() { return Math.floor(this.tileW / 9) * 2 }
  get pacWidth() { return this.tileW * 1.5 }
  get boardWidth() { return this.tileW * this.cols;}
  get boardHeight() { return this.tileW * this.rows;}
  get rowHeight() { return Math.floor((+window.innerHeight - 40) / ((this.rows + 3) * this.speed)) * this.speed;}
  get colHeight() { return Math.floor((+window.innerWidth - 40) / (this.cols * this.speed)) * this.speed;}

  adjustStyleSheet(styleSheet) {
    const { tileW, cornerW, pacDotW, fringeW } = this;

    styleSheet.innerHTML += `.wall {height: ${tileW + 1}; width: ${tileW + 1}}`;
    styleSheet.innerHTML += `.inner-corner {height: ${tileW / 2}; width: ${tileW / 2}}`;

    let radial = `radial-gradient(circle ${cornerW}px at POSITION,`
    radial += `rgba(0,0,0,0) 0%, rgba(0,0,0,0) ${cornerW - 3}px,`
    radial += ` #e33022 ${cornerW - 3}px, #e33022 100%, #f4bb9c 100%)`;

    let positions = {'top-left': 'right 100% bottom 100%','top-right': 'left 100% bottom 100%', 'bottom-left': 'right 100% top 100%', 'bottom-right': 'left 100% top 100%'};
    for (let dir in positions) {
      styleSheet.innerHTML += `.inner-${dir} {background-image: ${radial.replace('POSITION', positions[dir])}}`;
    }

    styleSheet.innerHTML += `.pac-dot {width: ${pacDotW}px;height: ${pacDotW}px}`;
    styleSheet.innerHTML += `.ms-pac-man {width: ${tileW * 1.5};margin: ${Math.floor((tileW * 0.5) / 2)}px}`;
    styleSheet.innerHTML += `.ghost {width: ${tileW * 1.5}px; height: ${tileW * 1.5 - fringeW * 2}px; margin: ${tileW / 4}px}`;
    styleSheet.innerHTML += `.fringe {width: ${fringeW * 2}px; height: ${fringeW * 2}px; top: ${(tileW * 1.75) - fringeW * 4}px}`;
    styleSheet.innerHTML += `.eyeball {width: ${fringeW * 3}px;height:${fringeW * 4}px}`;
    styleSheet.innerHTML += `.pupil {width: ${fringeW * 2}px;height:${fringeW * 2}px}`;
    styleSheet.innerHTML += `.blue-pupil {width: ${fringeW * 2}px;height: ${fringeW * 2}px; top: ${tileW / 6 + fringeW * 2}px}`;
    const sideSq = ((fringeW * 3) ** 2) / 2;
    const side = Math.floor(sideSq ** 0.5);
    styleSheet.innerHTML += `.blue-frown {width: ${side}px; height: ${side}px; top: ${tileW / 6 + fringeW * 6}px}`;
  
  }

  calculateGhostContainer() {

    const { tileW } = this;
    let start, end;
    this.layout.forEach((cols, row)=>{

      // record ghost box positions, if applicable
      if (cols.includes('G') && board[row - 1].includes('G') === false) {
        start = { y: row * tileW, x: cols.indexOf('G') * tileW };
      }
      else if (cols.includes('G') && board[row + 1].includes('G') === false) {
        end = { y: (row + 1 ) * tileW, x: (cols.lastIndexOf('G') + 1 ) * tileW };
      }
    })
    
    const gateStart = { x: (start.x + end.x - tileW * 3) / 2, y: start.y };
    const gateEnd = { x: (start.x + end.x + tileW * 3) / 2, y: start.y };

    return { start, end, gateStart, gateEnd };

  }

  scoreDivAdd(pos) {

    const tile = this.tileW;
    let ghostScore = document.createElement('div');
    ghostScore.classList.add('ghost-score');
    ghostScore.style.width = tile * 2;
    ghostScore.style.height = tile * 2;
    ghostScore.style.left = pos.x;
    ghostScore.style.top = pos.y;
    ghostScore.innerHTML = '200';
  
    let game = document.getElementById('game');
    game.appendChild(ghostScore);
  
    setTimeout(function() {game.removeChild(ghostScore)},1500);

  }
  
}



// make a board out of the map, with speed set to 6
export const board2 = new Board(board,6);
export const d = new Directions(board2);

export const portals = [];
let isMobile = false;
export const dots = { dotCount: 0 };

export function drawBoardNew(board) {

  let game = document.getElementById('game');
  let scoreDiv = document.getElementById('score-board');

  scoreDiv.style.left = (board.cols * board.tileW - parseInt(scoreDiv.style.width)) + "px";

  board.layout.forEach((cols, row)=>{

    // record portal positions, if applicable
    if (cols.startsWith('-')) {board.portals.push(row);}

    for (let col = 0; col < cols.length; col++) {

      const pos = new RcPos(row,col,board);

      if (cols.charAt(col) === 'X') {

        // make a wall, if applicable
        const thisBlock = new Wall(pos);
        game.appendChild(thisBlock.block);

      } else if (cols.charAt(col) !== 'G' && cols.charAt(col) !== 'S' && cols.charAt(col) !== 'P') {

        // Make a pacDot, if applicable
        const { cornerTypesAt: cornerTypeAt } = Tile;

        if (cornerTypeAt(pos).bottomRight === 'outer') {
          const [current , right , below] = [Tile.at(pos), Tile.at(pos.right), Tile.at(pos.bottom)];

          if (!/P/.test(current) && !/[SP]/.test(right) && !/S/.test(below)) {
            const big = current === 'B' ? true : false; 
            game.appendChild(new PacDot(pos, big).element);
            dots.dotCount++;
          } 
        }
      }
    }
  })  
  
  // Make the ghost div
  let ghostArea = new GhostBox(board);
  game.appendChild(ghostArea.element);

  // Make the message divs
  //id, top, left, height, width, str, board, visibility
  const {tileW, boardWidth, boardHeight, ghostContainer : { start, end }} = board;
  const [top, width, height] = [start.y, boardWidth, (end.y - start.y) + 'px'];
  let mgs = [{id: 'ready', 
              innerHTML: '<div class="message-inner"><br><br><br><br>READY!</div>', 
              style: { fontSize: '2rem', top, width, height }},
             {id: 'game-over', 
              innerHTML: `<div class="message-inner message-inner-shadow">GAME&nbsp;OVER!</div>`, 
              style: { fontSize: '3rem', display: 'none', top, width, height }},
             {id: 'winner', 
              innerHTML: `<div class="message-inner message-inner-shadow">WINNER!!</div>`, 
              style: { fontSize: '3.5rem', display: 'none', top, width, height }}];

  mgs.forEach(msg => {
    const message = new MessageDiv(msg, board);
    game.append(message.element);
  })

    const inky = new Ghost(new RcPos(11, 14, board),'left', 'red', 'inky', 'free');
    const blinky = new Ghost(new RcPos(14, 12, board),'up', 'aqua', 'blinky', 'notfree');
    const pinky = new Ghost(new RcPos(14, 14, board),'down', 'plum', 'pinky', 'notfree');
    const clyde = new Ghost(new RcPos(14, 16, board),'right', 'orange', 'clyde', 'notfree');

    // if there are ghosts in the box from a prior run, remove them
    if (board.ghostsInBox.length > 0) {board.ghostsInBox.splice(0,board.ghostsInBox.length - 1);}

    for (let ghost of ghosts) {
      game.appendChild(ghost.element);
      if (ghost.boxPosition !== 'none') {board.ghostsInBox.push(ghost.element.id)};
    }

    // Make arrow divs
      // make arrow divs and put them below the main game
  let arrowsDiv = document.createElement('div');
  let arrowH = Math.floor((window.innerHeight - boardHeight - 130) / 4);
  let arrowW = arrowH * 2;
  let upArrowL = (boardWidth - arrowW) / 2 ;

  arrowsDiv.style.top = (boardHeight + tileW * 2) + 'px';
  arrowsDiv.style.width = boardWidth + 'px'
  arrowsDiv.classList.add('arrow-div');

  //if (isMobile === false) {arrowsDiv.style.display = 'none';}

  const positions = {up: upArrowL, down: upArrowL, left: upArrowL - arrowH * 1.75, right: upArrowL + arrowH * 1.75};              

  for (let dir in positions) {
    const tempArrow = makeArrow(dir,arrowW); 
    arrowsDiv.appendChild(tempArrow);
  }

  function makeArrow(dir,arrowW) {
    const arrow = document.createElement('div');
    const arrowImg = makeArrowImg(arrowW,dir);
    arrow.appendChild(arrowImg);
    arrow.classList.add('arrow');
    [arrow.id, arrow.style.left, arrow.style.top] = [dir + '-arrow', positions[dir] + 'px', (arrowH + d[dir].row * 1.75 * arrowH) + 'px'];
    arrow.setAttribute('onclick','cache(\''+dir+'\')');
    return arrow;
  }

  function makeArrowImg(arrowW,dir='down') {
    const rotate = { up: 'rotate(180deg)', down: '', left: 'rotate(90deg)', right: 'rotate(-90deg)'}
    const img = document.createElement('img');
    [img.src, img.width, img.height, img.style.transform] = ['./images/arrow.png', arrowW, arrowW / 2, rotate[dir]];
    return img;
  }
  game.appendChild(arrowsDiv);
}