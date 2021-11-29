import { Directions } from './Directions.js';
import { Ghost, ghosts } from './Ghost.js';
import { GhostBox, MessageDiv, Arrow, ArrowImg, ScoreDiv } from './Element.js';
import { RcPos } from './RcPos.js';
import { Wall } from './Wall.js';
import { Tile } from './Tile.js';
import { PacDot } from './PacDot.js';

export class Board {
  constructor(arr, speed) {
    this.layout = arr;
    this.rows = arr.length;
    this.cols = arr[0].length;
    this.speed = speed;
    this.tileW = Math.min(this.rowHeight, this.colHeight) 
    this.portals = this.portalPositions;
    this.ghostContainer = this.calculateGhostContainer();
    this.ghostsInBox = [];
    this.adjustStyleSheet(document.getElementById('header-style-sheet'));
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

    let radial = `radial-gradient(circle ${cornerW}px at POSITION, rgba(0,0,0,0) 0%, `
    radial += `rgba(0,0,0,0) ${cornerW - 3}px, #e33022 ${cornerW - 3}px, #e33022 100%, #f4bb9c 100%)`;

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
    // Add the basic board elements
    this.layout.forEach((cols, row) => {

      for (let col = 0; col < cols.length; col++) {

        const [pos, char, { cornerTypesAt }] = [new RcPos(row, col, this), cols.charAt(col), Tile];
        if (char === 'X') { new Wall(pos).addTo('game') /* Add a wall */ }
        else if (char.match(/[^GSP]/) && cornerTypesAt(pos).bottomRight === 'outer') {
          // Add a pacDot
          const [current , right , below] = [Tile.at(pos), Tile.at(pos.right), Tile.at(pos.bottom)];
          if (current.match(/[^P]/) && right.match(/[^SP]/) && below.match(/[^S]/)) {
              new PacDot(pos, current === 'B').addTo('game');
              dots.dotCount++;
          } 
        }
      }
    })  
    
    // Add the ghost box
    new GhostBox(this).addTo('game');
  
    // Add the message divs
    const { tileW, boardWidth: width, boardHeight, ghostContainer : { start, end } } = this;
    const [top, height] = [start.y, (end.y - start.y) + 'px'];
    let msgs = [  [ { fontSize: '2rem', top, width, height }, 'ready', 
                    '<div class="message-inner"><br><br><br><br>READY!</div>' ],
                  [ { fontSize: '3rem', display: 'none', top, width, height }, 'game-over', 
                    `<div class="message-inner message-inner-shadow">GAME&nbsp;OVER!</div>`], 
                  [ { fontSize: '3.5rem', display: 'none', top, width, height }, 'winner', 
                    `<div class="message-inner message-inner-shadow">WINNER!!</div>`]]; 
    msgs.forEach(msg => new MessageDiv(...msg).addTo('game'));
  
    // Add the ghosts
    new Ghost(new RcPos(11, 14, this), 'left', 'red', 'inky', 'free').addTo('game');
    new Ghost(new RcPos(14, 12, this), 'up', 'aqua', 'blinky', 'notfree').addTo('game');
    new Ghost(new RcPos(14, 14, this), 'down', 'plum', 'pinky', 'notfree').addTo('game');
    new Ghost(new RcPos(14, 16, this), 'right', 'orange', 'clyde', 'notfree').addTo('game');
  
    // if there are ghosts in the box from a prior run, remove them
    if (this.ghostsInBox.length > 0) { this.ghostsInBox.splice(0,this.ghostsInBox.length - 1); }
    this.ghostsInBox.push(...ghosts.filter(g => g.boxPosition !== 'none'));

    // Make arrow divs and put them below the main game
    const arrowAreaStyle = { top: (boardHeight + tileW * 2) + 'px', width: width + 'px' }
    new Arrow('arrow-div', arrowAreaStyle, 'arrow-div-area').addTo('game');

    const arrowH = Math.floor((window.innerHeight - parseInt(boardHeight) - 130) / 4);
    const positions = { up:    parseInt(width) / 2 - arrowH, 
                        down:  parseInt(width) / 2 - arrowH, 
                        left:  parseInt(width) / 2 - arrowH * 2.75, 
                        right: parseInt(width) / 2 + arrowH * 0.75 };     
    const rotate = { up: '180deg', down: '0deg', left: '90deg', right: '-90deg'};
               
    for (let dir in positions) { 
      const arrowStyle = { left: positions[dir] + 'px', 
                           top: (arrowH + new Directions(this)[dir].row * 1.75 * arrowH) + 'px' };
      new Arrow('arrow', arrowStyle, dir + '-arrow').addTo('arrow-div-area');
      const imgStyle = { width: arrowH * 2, height: arrowH, transform: `rotate(${rotate[dir]})` };
      new ArrowImg('./images/arrow.png', 'arrow-img', imgStyle).addTo(dir + '-arrow');
    }
  }

  calculateGhostContainer() {
    let [{ tileW, layout }, start, end] = [this, null, null];

    layout.forEach((cols, row) => {
      if (cols.includes('G') && !start ) {
        start = { y: row * tileW, x: cols.indexOf('G') * tileW };
      } else if (cols.includes('G') && layout[row + 1].includes('G') === false) {
        end = { y: (row + 1 ) * tileW, x: (cols.lastIndexOf('G') + 1 ) * tileW };
      }
    })
    
    const gateStart = { x: (start.x + end.x - tileW * 3) / 2, y: start.y };
    const gateEnd = { x: (start.x + end.x + tileW * 3) / 2, y: start.y };

    return { start, end, gateStart, gateEnd };
  }

  scoreDivAdd({ x, y }) {
    const style = { width: this.tileW * 2, height: this.tileW * 2, left: x, top: y }
    const ghostScore = new ScoreDiv('ghost-score', style, 'ghost-score-div', '200');
    ghostScore.addTo('game');
    setTimeout(function() { document.getElementById('game').removeChild(ghostScore.element) }, 1500);
  }
}