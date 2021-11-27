import { Directions } from './Directions.js';
import { Ghost, ghosts } from './Ghost.js';
import { GhostBox, MessageDiv, Arrow, ScoreDiv } from './GhostBox.js';
import { RcPos } from './RcPos.js';
import { Wall } from './Wall.js';
import { Tile } from './Tile.js';
import { PacDot } from './PacDot.js';
import { loadBoards } from '../data/boards.js';

const boardObj = await loadBoards().then(res => res.board1);
const [board, speed] = [await boardObj.array, await boardObj.speed];

//create inline stylesheet for changing properties
const styleSheet = document.createElement('style');
document.head.appendChild(styleSheet);

class Board {
  constructor(arr, speed) {
    this.layout = arr;
    this.rows = arr.length;
    this.cols = arr[0].length;
    this.speed = speed;
    this.tileW = Math.min(this.rowHeight, this.colHeight) 
    this.portals = this.portalPositions;
    this.ghostContainer = this.calculateGhostContainer();
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

  get portalPositions() {
    return this.layout.map((cols, row) => cols.startsWith('-') || cols.endsWith('-') ? row : null)
                      .filter(x => x);
  }

  adjustStyleSheet(styleSheet) {
    const { tileW, cornerW, pacDotW, fringeW } = this;

    styleSheet.innerHTML += `.wall {height: ${tileW + 1}; width: ${tileW + 1}}`;
    styleSheet.innerHTML += `.inner-corner {height: ${tileW / 2}; width: ${tileW / 2}}`;

    let radial = `radial-gradient(circle ${cornerW}px at POSITION,`
    radial += `rgba(0,0,0,0) 0%, rgba(0,0,0,0) ${cornerW - 3}px,`
    radial += ` #e33022 ${cornerW - 3}px, #e33022 100%, #f4bb9c 100%)`;

    let positions = {'top-left': 'right 100% bottom 100%',
                     'top-right': 'left 100% bottom 100%', 
                     'bottom-left': 'right 100% top 100%', 
                     'bottom-right': 'left 100% top 100%'};
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
    const side = Math.floor((((fringeW * 3) ** 2) / 2) ** 0.5);
    styleSheet.innerHTML += `.blue-frown {width: ${side}px; height: ${side}px; top: ${tileW / 6 + fringeW * 6}px}`;
  }

  addToGame(dots) {
    let game = document.getElementById('game');

    // Add the basic board elements
    this.layout.forEach((cols, row) => {

      for (let col = 0; col < cols.length; col++) {
        const [pos, char] = [new RcPos(row, col, this), cols.charAt(col)];
        const { cornerTypesAt } = Tile;
  
        if (char === 'X') { game.appendChild(new Wall(pos).element) /* Add a wall */ }
        else if (char.match(/[^GSP]/) && cornerTypesAt(pos).bottomRight === 'outer') {
          // Add a pacDot
          const [current , right , below] = [Tile.at(pos), Tile.at(pos.right), Tile.at(pos.bottom)];
          if (current.match(/[^P]/) && right.match(/[^SP]/) && below.match(/[^S]/)) {
              game.appendChild(new PacDot(pos, current === 'B').element);
              dots.dotCount++;
          } 
        }
      }
    })  
    
    // Add the ghost box
    game.appendChild(new GhostBox(this).element);
  
    // Add the message divs
    const { tileW, boardWidth: width, boardHeight, ghostContainer : { start, end } } = this;
    const [top, height] = [start.y, (end.y - start.y) + 'px'];
    let msgs = [  [ { fontSize: '2rem', top, width, height },
                    'ready', 
                    '<div class="message-inner"><br><br><br><br>READY!</div>' ],
                  [ { fontSize: '3rem', display: 'none', top, width, height },
                    'game-over', 
                    `<div class="message-inner message-inner-shadow">GAME&nbsp;OVER!</div>`], 
                  [ { fontSize: '3.5rem', display: 'none', top, width, height },
                    'winner', 
                    `<div class="message-inner message-inner-shadow">WINNER!!</div>`]]; 
    msgs.forEach(msg => game.append(new MessageDiv(...msg).element))
  
    // Add the ghosts
    new Ghost(new RcPos(11, 14, this), 'left', 'red', 'inky', 'free');
    new Ghost(new RcPos(14, 12, this), 'up', 'aqua', 'blinky', 'notfree');
    new Ghost(new RcPos(14, 14, this), 'down', 'plum', 'pinky', 'notfree');
    new Ghost(new RcPos(14, 16, this), 'right', 'orange', 'clyde', 'notfree');
  
    // if there are ghosts in the box from a prior run, remove them
    if (this.ghostsInBox.length > 0) {this.ghostsInBox.splice(0,this.ghostsInBox.length - 1);}
  
    for (let ghost of ghosts) {
      game.appendChild(ghost.element);
      if (ghost.boxPosition !== 'none') { this.ghostsInBox.push(ghost.element.id) };
    }
  
    // Make arrow divs and put them below the main game
    const arrowAreaStyle = { top: (boardHeight + tileW * 2) + 'px', width: width + 'px' }
    const arrowArea = new Arrow('arrow-div', arrowAreaStyle, 'arrow-div-area').element;
    const arrowH = Math.floor((window.innerHeight - parseInt(boardHeight) - 130) / 4);
    const positions = { up:    parseInt(width) / 2 - arrowH, 
                        down:  parseInt(width) / 2 - arrowH, 
                        left:  parseInt(width) / 2 - arrowH * 2.75, 
                        right: parseInt(width) / 2 + arrowH * 0.75 };              
    for (let dir in positions) { 
      const arrowStyle = { left: positions[dir] + 'px', 
                           top: (arrowH + new Directions(board)[dir].row * 1.75 * arrowH) + 'px' };
      const arrow = new Arrow('arrow', arrowStyle, dir + '-arrow').element;
      arrow.appendChild(makeArrowImg(arrowH * 2, dir));
      arrow.setAttribute('onclick',`cache(${dir})`);
      arrowArea.appendChild(arrow);
    }
  
    game.appendChild(arrowArea);
  
    function makeArrowImg(arrowW, dir='down') {
      const rotate = { up: 'rotate(180deg)', down: '', left: 'rotate(90deg)', right: 'rotate(-90deg)'}
      const img = document.createElement('img');
      [img.src, img.width, img.height, img.style.transform] = ['./images/arrow.png', arrowW, arrowW / 2, rotate[dir]];
      return img;
    }
  }

  calculateGhostContainer() {

    const { tileW } = this;
    let start, end;
    this.layout.forEach((cols, row)=>{
      if (cols.includes('G') && board[row - 1].includes('G') === false) {
        start = { y: row * tileW, x: cols.indexOf('G') * tileW };
      } else if (cols.includes('G') && board[row + 1].includes('G') === false) {
        end = { y: (row + 1 ) * tileW, x: (cols.lastIndexOf('G') + 1 ) * tileW };
      }
    })
    
    const gateStart = { x: (start.x + end.x - tileW * 3) / 2, y: start.y };
    const gateEnd = { x: (start.x + end.x + tileW * 3) / 2, y: start.y };

    return { start, end, gateStart, gateEnd };
  }

  scoreDivAdd(pos) {
    const style = { width: pos.board.tileW * 2, height: pos.board.tileW * 2, left: pos.x, top: pos.y }
    let ghostScore = new ScoreDiv('ghost-score', style, 'ghost-score-div', '200');
    document.getElementById('game').appendChild(ghostScore);
    setTimeout(function() { document.getElementById('game').removeChild(ghostScore) }, 1500);
  }
}

// make a board out of the map, with speed set to 6
export const board2 = new Board(board, speed);
export const dots = { dotCount: 0 };