let board = ['XXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
             'X-------X-----------X-------X',
             'XB------X-----------X-----B-X',
             'X--XXX--X--XXXXXXX--X--XXX--X',
             'X---------------------------X',
             'X---------------------------X',
             'XXX--X--XXXX--X--XXXX--X--XXX',
             'XXX--X--XXXX--X--XXXX--X--XXX',
             '-----X--------X--------X-----',
             '-----X--------X--------X-----',
             'XXX--XXXX--XXXXXXX--XXXX--XXX',
             'SSX------SSSSSSSSSSS------XSS',
             'SSX------SSSSSSSSSSS------XSS',
             'SSX--XXXXSSGGGGGGGSSXXXX--XSS',
             'SSX--X---SSGGGGGGGSS---X--XSS',
             'SSX--X---SSGGGGGGGSS---X--XSS',
             'XXX--X--XSSGGGGGGGSSX--X--XXX',
             '-P------XSSSSSSSSSSSX--------',
             '--------XSSSSSSSSSSSX--------',
             'XXX--XXXXXXX--X--XXXXXXX--XXX',
             'SSX-----------X-----------XSS',
             'SSX-----------X-----------XSS',
             'XXX--XXXX--XXXXXXX--XXXX--XXX',
             'X---------------------------X',    
             'X---------------------------X',  
             'X--XXX--XXXX--X--XXXX--XXX--X',    
             'X--XXX--X-----X-----X--XXX--X',    
             'XB-XXX--X-----X-----X--XXXB-X',    
             'X--XXX--X--XXXXXXX--X--XXX--X',    
             'X---------------------------X',    
             'X---------------------------X',    
             'XXXXXXXXXXXXXXXXXXXXXXXXXXXXX'];
const speed = 6;

// create additional stylesheet for changing properties
const styleSheet = document.createElement('style');
styleSheet.innerHTML = 'body {background-color: black;}';
styleSheet.innerHTML += '@media only screen and (max-width: 760px) {#test-div { display: none; }}';
document.head.appendChild(styleSheet);

class RcPos {
  constructor(row,col) { this.row = row; this.col = col;}
  get left() { return (new RcPos(this.row, this.col - 1)) }
  get right() { return (new RcPos(this.row, this.col + 1)) }
  get bottom() { return (new RcPos(this.row + 1, this.col)) }
  get top() { return (new RcPos(this.row - 1, this.col)) }
}

class Directions {
  constructor(board) {
    const {tileW: tile, fringeW: fringe} = board;
    this.left = {transform: 'rotateY(180deg)', reverse: 'right'};
    this.right = {transform: 'rotate(0deg)', reverse: 'left'};
    this.up = {transform: 'rotate(90deg) rotateY(180deg)', reverse: 'down'};
    this.down = {transform: 'rotate(90deg)', reverse: 'up'};

    for (let dir of ['left', 'right','up','down']) {
      const obj = this[dir];
      obj.row = (dir === 'left' || dir === 'right') ? 0 : dir === 'up' ? -1 : 1
      obj.col = (dir === 'up' || dir === 'down') ? 0 : dir === 'left' ? -1 : 1
      obj.speed = (dir == 'up' || dir === 'left') ? -board.speed : board.speed
      obj.eyetop = (tile / 6 + fringe) + 'px';
      obj.eyeleft = fringe * 2.5 + obj.col * fringe * 0.5;
      obj.pupiltop = dir === 'down' ? (tile / 6 + fringe * 3 ) + 'px' : (tile / 6 + fringe * 2.5 + obj.row * fringe * 2) + 'px'
      obj.pupilleft = (fringe * 3 + fringe * obj.col) +'px';
    }
  }
}

class Board {
  constructor(arr,speed) {
    const rowHeight = Math.floor((+window.innerHeight - 40) / ((arr.length + 2) * speed)) * speed;
    const colHeight = Math.floor((+window.innerWidth - 40) / (arr[0].length * speed)) * speed;
    [this.layout,this.rows,this.cols] = [arr, arr.length, arr[0].length];
    [this.tileW, this.speed, this.portals] = [Math.min(rowHeight,colHeight), speed, []];

    [this.ghostStart, this.ghostEnd, this.ghostGateX, this.ghostGateY] = [{row:-1,col:-1}, {row:-1,col:-1}, '', {}]
    this.ghostPositions = [], this.ghostsInBox = [];

    // set dynamic style sheet properties, based on board size, for walls, corners, pacDots, and more
    const {tileW: tile, cornerW: corner, pacDotW: pacDot, fringeW: fringe} = this;

    styleSheet.innerHTML += `.wall {height: ${tile + 1}; width: ${tile + 1}}`;
    styleSheet.innerHTML += `.inner-corner {height: ${tile / 2}; width: ${tile / 2}}`;

    let radial = `radial-gradient(circle ${corner}px at POSITION,`
    radial += `rgba(0,0,0,0) 0%, rgba(0,0,0,0) ${corner - 3}px,`
    radial += ` #e33022 ${corner - 3}px, #e33022 100%, #f4bb9c 100%)`;

    let positions = {'top-left': 'right 100% bottom 100%','top-right': 'left 100% bottom 100%', 'bottom-left': 'right 100% top 100%', 'bottom-right': 'left 100% top 100%'};
    for (let dir in positions) {styleSheet.innerHTML += `.inner-${dir} {background-image: ${radial.replace('POSITION',positions[dir])}}`;}

    styleSheet.innerHTML += `.pac-dot {width: ${pacDot}px;height: ${pacDot}px}`;
    styleSheet.innerHTML += `.ms-pac-man {width: ${tile * 1.5};margin: ${Math.floor((tile * 0.5) / 2)}px}`;
    styleSheet.innerHTML += `.ghost {width: ${tile * 1.5}px; height: ${tile * 1.5 - fringe * 2}px; margin: ${tile / 4}px}`;
    styleSheet.innerHTML += `.fringe {width: ${fringe * 2}px; height: ${fringe * 2}px; top: ${(tile * 1.75) - fringe * 4}px}`;
    styleSheet.innerHTML += `.eyeball {width: ${fringe * 3}px;height:${fringe * 4}px}`;
    styleSheet.innerHTML += `.pupil {width: ${fringe * 2}px;height:${fringe * 2}px}`;
    styleSheet.innerHTML += `.blue-pupil {width: ${fringe * 2}px;height: ${fringe * 2}px; top: ${tile / 6 + fringe * 2}px}`;
    const sideSq = ((fringe * 3) ** 2) / 2;
    const side = Math.floor(sideSq ** 0.5);
    styleSheet.innerHTML += `.blue-frown {width: ${side}px; height: ${side}px; top: ${tile / 6 + fringe * 6}px}`;
  
  }

  get fringeW() {return Math.floor(this.tileW * 1.5 / 12)}
  get cornerW() {return this.tileW / 2}
  get pacDotW() {return Math.floor(this.tileW / 9) * 2}
  get pacWidth() {return this.tileW * 1.5}

  tile(rcPos) {
    let [row, col] = [rcPos.row, rcPos.col];
    return row >= 0 && row < this.rows && col >= 0 && col < this.cols ? this.layout[row].charAt(col) : 'E';
  }

  isWall(rcPos) {
    return (this.layout[rcPos.row].charAt(rcPos.col) === 'X' || this.layout[rcPos.row].charAt(rcPos.col) === 'G');
  }

  isFree(rcPos) {
    str = this.layout[rcPos.row].charAt(rcPos.col);
    return str.search(/[\-SPB]/) > -1 
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

  type(str) {
    if (str.search(/[\-SPB]/) > -1 ) {return 'hall'} else if (str === 'X') {return 'wall'}
    return 'off-board';
  }

  tileCorners(rcPos) {

    let res = {'topLeft' : 'none', 'topRight' : 'none', 'bottomLeft' : 'none', 'bottomRight' : 'none'};
    let n = this.tileContext(rcPos);

    for (let dir in res) {
      const split = dir.search(/[LR]/);
      const upDown = dir.substr(0,split).toLowerCase();
      const leftRight = dir.slice(split).toLowerCase();
      if (this.type(n[dir]) === 'hall') {
        if (this.type(n[upDown]) === 'hall' && this.type(n[leftRight]) === 'hall') {res[dir] = 'outer'}
        else if (this.type(n[upDown]) === 'wall' && this.type(n[leftRight]) === 'wall') {res[dir] = 'inner'}
      }
    }
    return res;
  
  }
  
  tileContext(rcPos) {
  
    const col = rcPos.col;
    const row = rcPos.row;
    
    return {'top' : row > 0 ? this.tile(rcPos.top) : 'E', 
            'topRight' : row > 0 && col + 1 < this.cols ? this.tile((rcPos.top).right) : 'E', 
            'right' : col + 1 < this.cols ? this.tile(rcPos.right) : 'E', 
            'bottomRight' : col + 1 < this.cols && row + 1 < this.rows ? this.tile((rcPos.bottom).right) : 'E',
            'bottom' : row + 1 < this.rows? this.tile(rcPos.bottom) : 'E', 
            'bottomLeft' : col > 0 && row + 1 < this.rows ? this.tile((rcPos.bottom).left) : 'E', 
            'left' : col > 0 ? this.tile(rcPos.left) : 'E', 
            'topLeft' : col > 0 && row > 0 ? this.tile((rcPos.top).left) : 'E'};
  }
  
}

class Wall {
  constructor(rcPos,board) {

    let block = document.createElement('div');
    block.classList.add('wall');
    block.style.top = board.tileW * rcPos.row;
    block.style.left = board.tileW * rcPos.col;

    // add inner and outer corner rounding
    let corners = board.tileCorners(rcPos);
    for (let c in corners) {
      if (corners[c] === 'outer') {
        let borderRadius = 'border' + c.substr(0,1).toUpperCase() + c.slice(1) + 'Radius';
        block.style[borderRadius] = (board.tileW / 2) + "px";
      } else if (corners[c] === 'inner') {
        const split = c.search(/[LR]/);
        const upDown = c.substr(0,split).toLowerCase();
        const leftRight = c.slice(split).toLowerCase();
        let inner = this.makeInnerCorner(upDown,leftRight,block,board);
        game.appendChild(inner);
      }
    }
    // remove borders as needed
    for (let dir of ['top','bottom','left','right']) {
      if (board.type(board.tile(rcPos[dir])) !== 'hall') {block.style['border'+(dir.charAt(0)).toUpperCase()+dir.slice(1)] = 'none';}
    }
    return block;
  }

  makeInnerCorner(upDown,leftRight,block,board) {
    let [top, left] = [parseFloat(block.style.top), parseFloat(block.style.left)];
    let innerCorner = document.createElement('div');
    innerCorner.style.top = upDown === 'top' ? (top - (board.tileW / 2) + 4) + 'px' : (top + board.tileW - 1) + 'px';
    innerCorner.style.left = leftRight === 'left' ? (left - (board.tileW / 2) + 4) + 'px' : (left + board.tileW - 1) + 'px';
    innerCorner.classList.add('inner-corner');
    innerCorner.classList.add(`inner-${upDown}-${leftRight}`);
    return innerCorner;
  }

}

class PacDot {

  constructor(rcPos, board, big = false) {

    let dot = document.createElement('div');
    dot.id = 'dot-'+rcPos.col+'-'+rcPos.row; 
    dot.classList.add('pac-dot'), dot.classList.add('pac-dot-'+rcPos.col+'-'+rcPos.row);

    dot.style.top = board.tileW * (rcPos.row + 1) - board.pacDotW / 2;
    dot.style.left = board.tileW * (rcPos.col + 1) - board.pacDotW / 2;

    if (big === true) {
      dot.style.width = board.pacDotW * 4;
      dot.style.height = board.pacDotW * 4;
      dot.style.top = board.tileW * (rcPos.row + 1) - board.pacDotW * 4 / 2;
      dot.style.left = board.tileW * (rcPos.col + 1) - board.pacDotW * 4 / 2;
      dot.style.borderRadius = '50%';
      dot.classList.add('big');
    }   

    return dot;

  }
}

class GhostBox {

  constructor(startPos,endPos,board) {
      // Make the ghost div
  let tileW = board.tileW;

  let targetX = startPos.col * tileW - tileW / 2;
  if (targetX % Math.abs(speed) > 0) {targetX -= targetX % Math.abs(speed);}
  board.ghostGateX = (startPos.col + (endPos.col - startPos.col) / 2 - 0.5) * tileW;
  board.ghostGateY.start = tileW * (startPos.row - 2);
  board.ghostGateY.end = board.ghostGateY.start + tileW * (endPos.row - startPos.row);

  let block = document.createElement('div');
  block.classList.add('outer-ghostbox');
  block.style.top = tileW * startPos.row;
  block.style.left = tileW * startPos.col;
  block.style.height = tileW * (endPos.row - startPos.row + 1);
  block.style.width = tileW * (endPos.col - startPos.col + 1);

  let innerDiv = document.createElement('div');
  innerDiv.classList.add('inner-ghostbox');
  innerDiv.style.top = tileW / 3 - 3;
  innerDiv.style.left = tileW / 3 - 3;
  innerDiv.style.height = tileW * 4 - (tileW * 2/ 3);
  innerDiv.style.width = tileW * 7 - (tileW * 2 / 3);

  let door = document.createElement('div');
  door.id = 'ghost-gate';
  door.classList.add('door');
  door.style.left = tileW * 2 + tileW / 4;
  door.style.height = tileW / 3 + 3;
  door.style.width = tileW * 2 + 3;

  block.appendChild(innerDiv);
  block.appendChild(door);

  return block;

  }

}

class MessageDiv {
  constructor(args,board) {
    // args passed are id, top, left, height, width, str, board
    let messageDiv = document.createElement('div');
    messageDiv.id = args.id;
    messageDiv.classList.add('message');
    messageDiv.innerHTML = `<p style='align: center;'>${args.innerHTML}</p>`;
    messageDiv.style.padding = board.tileW / 4;

    for (let param in args.style) {messageDiv.style[param] = args.style[param];}
    return messageDiv;
  }
}

class Ghost {
  constructor(pos,gColor,dir,id,free,board=board2) {

      const {row, col} = pos;
      const {tileW, fringeW} = board;
      const fringeWex = tileW * 1.5 - fringeW * 10;
  
      const ghostDiv = document.createElement('div');
      ghostDiv.id = id;
      ghostDiv.classList.add('ghost');
      ghostDiv.style.backgroundColor = gColor;
      ghostDiv.style.top = tileW * (row);
      ghostDiv.style.left = tileW * (col) - tileW / 2;
  
      let childDivArr = [];
      let leftCache = 0;

      for (let i = 1; i < 8; i++) {
        let props = {classes: ['fringe'], left: leftCache, width: (fringeW * 2) + 'px'};
        if (i % 2 > 0) {props.backgroundColor = gColor;} else {
          props.backgroundColor = 'transparent';
          props.backgroundImage = 'radial-gradient(ellipse at top 51% left 50%, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 70%, '+gColor+' 70%)';
        }

        if (i === 1 || i === 7) {props.width = fringeW + 'px';} else if (i === 4) {props.width = fringeWex + 'px';}  
        if (i === 1) {props.classes.push('fringe-left')} else if (i === 7) {props.classes.push('fringe-right')}
        else {props.classes.push('fringe-inner')}

        leftCache += parseFloat(props.width);
        childDivArr.push(props);
      }

      childDivArr.push({classes: ['eyeball'], top: d[dir].eyetop, left: d[dir].eyeleft});
      childDivArr.push({classes: ['eyeball'], top: d[dir].eyetop, left: (fringeW * 5 + parseInt(d[dir].eyeleft)) + 'px'});
      childDivArr.push({classes: ['pupil'], top: d[dir].pupiltop, left: d[dir].pupilleft});
      childDivArr.push({classes : ['pupil'], top : d[dir].pupiltop, left: (fringeW * 5 + parseInt(d[dir].pupilleft)) + 'px'});

      // eyes and mouth for blue mode, display = none
      childDivArr.push({classes: ['blue-pupil'],display:'none',left: (fringeW * 3) + 'px'});
      childDivArr.push({classes: ['blue-pupil'],display:'none',left: (fringeW * 8) + 'px'});

      // frown for blue mode
      const adj = Math.round(tileW * 0.75 - fringeW * 5)/4;
      for (let i = 1; i < 5; i++) {
        let frown = {classes: ['blue-frown'],display:'none',left: adj * (3 - i) + fringeW * (3 * i - 2)};
        childDivArr.push(frown);
      }
    
      childDivArr.forEach(div => ghostDiv.appendChild( createChild(div)))

      this.rcPos = new RcPos(row,col);
      this.position = findXY(this.rcPos);
      const [el, color, direction] = [ghostDiv, gColor, dir, (dir === 'left' || dir === 'up') ? -board.speed : board.speed ];
      Object.assign(this, {el, color, direction, speed, free, board});

      function createChild(args) {
        const item = document.createElement('div');
        for (let property in args) {property === 'classes' ? item.classList.add(...args[property]) : item.style[property] = args[property]}
        return item;
      }

  }

  static boxPositions() {
  
    const positions = {left: '', center: '', right: ''}
    for (let ghost of ghosts) {if (ghost.boxPosition !== 'none' && ghost.boxPosition !== '') {
      positions[ghost.boxPosition] = ghost.el.id;}
    }
    return positions;
  }

  leaveBox() {


    if (restarted === true) {return false;}

    if (stop === false) {

      const board = this.board;
      const xS = board.ghostGateX;
      const yS = board.ghostGateY.start;
      const xG = this.position.x;
      const yG = this.position.y;

      if (xG === xS && yG > yS && this.free === 'notfree') { this.move('up');}
      else if (xG > xS && xS - xG < this.speed && this.free === 'notfree') {
        this.position.x = xS;
        this.el.style.left = this.position.x;
        this.rcPos.col = Math.floor(this.position.x / board.tileW);
      }
      else if (xG === xS && yG === yS && this.free === 'notfree') {
        this.free = 'free';
        this.board.ghostsInBox.splice(this.board.ghostsInBox.indexOf(this.el.id),1);

        if (this.position.x % board.tileW > 0) {
          this.position.x -= this.position.x % board.tileW;
          this.el.style.left = this.position.x;
          this.rcPos.col = Math.floor(this.position.x/board.tileW);
        }
        
        setTimeout(function() {
          const ghostGate = document.getElementById('ghost-gate');
          ghostGate.style.backgroundColor = '#e1e1fb';
        },500)
        
      }
      else if (xG < xS && this.free === 'notfree') {this.move('right')}
      else if (xG > xS && this.free === 'notfree') {this.move('left')}  

    }

  }

  reShuffle() {

    const board = this.board;
    const xS = board.ghostGateX;
    const right = xS + board.tileW * 2;
    const left = xS - board.tileW * 2;

    if (this.boxPosition === 'center' && boxPositions().right === false) {
      this.move('right');
    }
    else if (this.boxPosition === 'center' && boxPositions().left === false) {
      this.move('left');
    }
    else if (this.boxPosition === 'right' && this.position.x < right) {
      this.move('right');
    }
    else if (this.boxPosition === 'left' && this.position.x > left) {
      this.move('left');
    }
    else {
      this.moveEyes('up');
      return true;
    }

  }

  get boxPosition() {

      const board = this.board;
      const xS = board.ghostGateX;

      if (this.position.x > xS && this.isInBox) {
        return 'right';

      } else if (this.position.x < xS && this.isInBox) {
        return 'left';
      }
      else if (this.position.x === xS && this.isInBox) {
        return 'center';
      }
      return 'none';

  }

  enterBox() {

    if (stop === false) {

      const board = this.board;
      const [xS, yS, yE, xG, yG] = [board.ghostGateX, board.ghostGateY.start, board.ghostGateY.end, this.position.x, this.position.y];
      const leftPos = xS - parseInt(this.el.style.width) - parseFloat(this.el.style.margin) * 2;
      const rightPos = xS + parseInt(this.el.style.width) + parseFloat(this.el.style.margin) * 2;
        
      if (xG === xS && yG >= yS && this.free === 'returning') {this.move('down'); this.free = 'notfree';}
      else if (xG === xS && this.free === 'notfree' && yG < yE) {this.move('down');}
      else if (xG === xS && this.free === 'notfree' && yG >= yE) {

        // decide which way to turn based on whether another ghost is in that area
        let [leftOccupied, rightOccupied] = [false, false];
  
        ghosts.forEach(obj => {
          if (obj.el.id !== this.el.id && obj.isInBox && obj.position.x > xS) {rightOccupied = true;}
          else if (obj.el.id !== this.el.id && obj.isInBox && obj.position.x > xS) {leftOccupied = true;}
        })
  
        if (rightOccupied === false) {this.move('right');}
        else if (leftOccupied === false) {this.move('left');}
        else {

          this.speed = 0;
          this.direction = 'up';
          
          // make visible again
          this.reAppear();
    
          return true;
  
        }
      }
      else if (this.direction === 'right' && this.free === 'notfree' && this.position.x < rightPos) {
        this.move('right');
      }
      else if (this.direction === 'left' && this.free === 'notfree' && this.position.x > leftPos) {
        this.move('left')
      }
      else {
        this.speed = 0;
        this.direction = 'down';
        // make visible again
        this.reAppear();
        return true;
      }

    }
 
    if (restarted === true) {return false;}

  }

  pickDir() {
    
      let startDir = this.direction;
      let targPos;
      const tileW = this.board.tileW;
    
      // set the target for the ghost - either toward or away from pacman, or toward the box
      if (this.free === 'free' && munchModeActive == false) {
        targPos = {row: msPacMan.rcPos.row, col: msPacMan.rcPos.col};
        targPos.x = msPacMan.position.x;
        targPos.y = msPacMan.position.y;
        if (this.el.id === 'clyde') {
          let tilesFromPac = Math.abs(targPos.row - this.rcPos.row) + Math.abs(targPos.col - this.rcPos.col);
          if (tilesFromPac > (this.board.cols + this.board.rows)/3) {
            targPos.col = this.board.cols;
            targPos.row = this.board.rows;
            targPos.x = targPos.col * this.board.tileW;
            targPos.y = targPos.row * this.board.tileW;
          }
        }
      } else if (this.free === 'free' && munchModeActive == true) {
        targPos = {row: this.board.rows - msPacMan.rcPos.row, col: this.board.cols - msPacMan.rcPos.col};
        targPos.x = targPos.row * tileW;
        targPos.y = targPos.col * tileW;
      } else if (this.free === 'returning') {
        let targetX = this.board.ghostGateX;
        if (targetX % Math.abs(speed) > 0) {targetX -= targetX % Math.abs(speed);}
        targPos = { row: Math.floor(this.board.ghostGateY.start) / tileW, col: Math.round(targetX/tileW), x: targetX, y: this.board.ghostGateY.start};
      }
    
      if (this.position.x === targPos.x && this.position.y === targPos.y && this.free === 'returning') {

        // what to do if a returning ghost has hit the way to get into the ghost box
        
        let boxCount = this.board.ghostsInBox.length;
    
        if (boxCount >= 3) {
    
          // what to do if there are already three ghosts in the box
          this.free = 'spawning';
    
          this.el.style.backgroundColor = this.color;
    
          let fringes = Array.from(this.el.getElementsByClassName('fringe'))

          fringes.forEach(fringe => {
            if (fringe.style.backgroundColor !== '' && fringe.style.backgroundColor !== 'transparent') {
              fringe.style.backgroundColor = this.color;
              fringe.style.display = '';
            } else {
              let bgImage = fringe.style.backgroundImage;
              let newBgImage = bgImage.replace('blue',this.color);
              newBgImage = newBgImage.replace('white',this.color);
              fringe.style.backgroundImage = newBgImage;
              fringe.style.display = '';
            }
          })
          let frowns = Array.from(this.el.getElementsByClassName('blue-frown'));
          frowns.forEach(frown => frown.style.display = 'none')
          let blueeyes = Array.from(this.el.getElementsByClassName('blue-pupil'));
          blueeyes.forEach(eye => eye.style.display = 'none')
          this.speed = 0;
          if (this.direction != 'left') {this.moveEyes('left',this.board)};
          this.direction = 'left';
    
          this.spawn();
    
        } else {
    
          // what to do if there is room to enter the box
          if (this.direction != 'down') {this.moveEyes('down',this.board)};
          this.direction = 'down';
          this.speed = d['down'].speed;
          this.position.x = 14 * tileW - tileW / 2;
          this.el.style.left = this.position.x + "px";
    
          let ghostGate = document.getElementById('ghost-gate');
          ghostGate.style.backgroundColor = 'black';
    
          this.board.ghostsInBox.push(this.el.id);

          reEnter(this);
    
          function reEnter(ghost) {
            
            if (ghost.enterBox() === true) {
              setTimeout(function() {
                ghostGate.style.backgroundColor = '#e1e1fb';
              },500)
              return true;}
    
            setTimeout(function() { reEnter(ghost) }, 50);
    
          }
    
        }
    
      }
    
      // do these calculations if the ghost has hit a tile square-on
      else if (this.position.x % tileW === 0 && this.position.y % tileW === 0 && this.isInBox === false) {
    
        let rev = d[this.direction].reverse;
        let dirs = ['left','right','up','down'];
        dirs.splice(dirs.indexOf(rev),1);
    
        // filter out any directions that have walls
        dirs = dirs.filter(dir => isWall(nextPos(this.rcPos,dir),dir,this.board) === false)
    
        if (dirs.length === 1) {
          // if there is only one option (i.e. in a corner), go in that direction
          if (dirs[0] !== this.direction) {
            this.moveEyes(dirs[0],this.board)
            this.direction = dirs[0]; 
            this.speed = d[dirs[0]].speed;
          }
        }
        else if (this.free !== 'returning' && dirs.includes(msPacMan.direction) && (this.el.id === 'blinky' ||  this.el.id === 'pinky') && this.rcPos.col > 3 && this.rcPos.col < this.board.cols - 3) {
          // if it is possible to go in the direction msPacMan is facing, do it
          this.moveEyes(msPacMan.direction,this.board)
          this.direction = msPacMan.direction; 
          this.speed = d[msPacMan.direction].speed;
        }
        else {
    
          let newDir = '';

          // find target row and column direction relative to ghost
          let targRowDir = targPos.y > this.position.y ? 'down' : targPos.y < this.position.y ? 'up' : 'same'
          let targColDir = targPos.x > this.position.x ? 'right' : targPos.x < this.position.x ? 'left' : 'same'
    
          // if the item is in a portal row, see if it would be better to go through the portal
          if (portals.includes(this.rcPos.row)) {
            let optA = Math.abs(targPos.col - this.rcPos.col);
            let optB = Math.min(targPos.col, (this.board.cols - targPos.col));
            optB += Math.min(this.rcPos.col,(this.board.cols - this.rcPos.col));
    
            if (optB < optA && targColDir !== 'same') { targColDir = d[targColDir].reverse; }
          }
    
          // if both directions are available, pick the one with the longest run available
          if (dirs.includes(targRowDir) && dirs.includes(targColDir)) {
    
            function checkRun(pos,dir,board=board2) {
              let hitWall = false;
              let tempPos = {row: pos.row, col: pos.col};
              let runCount = 0;
              while (hitWall === false && tempPos.col > 0 && tempPos.col < board.cols - 1) {
                if (isWall(tempPos,dir,board)) {hitWall = true;} 
                else {runCount++; tempPos.row += d[dir].row; tempPos.col += d[dir].col;}
              }
              return runCount;
            }
    
            if (checkRun(this.rcPos,targRowDir) > checkRun(this.rcPos,targColDir)) {
              newDir = targRowDir;
            }
            else if (checkRun(this.rcPos,targRowDir) < checkRun(this.rcPos,targColDir)) {
              newDir = targColDir;
            }
            // if both runs are equal, pick at random
            else if (Math.random() < 0.5) {newDir = targRowDir} else {newDir = targColDir}
    
          }
          else if (dirs.includes(targRowDir)) {newDir = targRowDir}
          else if (dirs.includes(targColDir)) {newDir = targColDir}
          else if (dirs.includes(this.direction)) {newDir = this.direction}
          else {
            let index = Math.floor(Math.random() * dirs.length);
            newDir = dirs[index];
          }
          this.direction = newDir;
          this.speed = d[newDir].speed;
    
        }

        teleport(this);
    
        if (this.direction !== startDir) {this.moveEyes(this.direction,this.board)}

        let fast = true;
        if (targPos.row === this.rcPos.row && this.rcPos.col > targPos.col - 2 && this.rcPos.col < targPos.col + 2) {
          fast = false;
        }
        if (this.free === 'returning' && fast === true) {
          let item = this;
          setTimeout(function() {item.move(item.direction);},25);
        }
    
      }
    
  }

  disAppear() {
    this.free = 'returning', this.el.style.backgroundColor = 'transparent';
    const [classTypes, divs] = [['fringe','eyeball','pupil','blue-frown','blue-pupil'],[]];
    classTypes.forEach(classType => divs.push(...Array.from(this.el.getElementsByClassName(classType))));
    divs.forEach(div => div.style.display = div.style.display === 'none' ? '' : 'none');
  }

  reAppear() {
    let [color, showDivs] = [this.color, {eyeball: '', pupil: '', fringe: '', 'blue-frown': 'none', 'blue-pupil': 'none'}];
    if (munchModeActive === true) {
      [color, showDivs] = ['blue', {'blue-frown': '', 'blue-pupil': '', fringe: '', eyeball: 'none', pupil: 'none'}]
    }

    this.el.style.backgroundColor = color;
    const fringes = Array.from(this.el.getElementsByClassName('fringe'))
    fringes.forEach(fringe => {
      if (fringe.style.backgroundColor !== 'transparent') {fringe.style.backgroundColor = color;} 
      else {fringe.style.backgroundImage = fringe.style.backgroundImage.replace(/blue|white/, color);}
    })

    for (let dClass in showDivs) {
      Array.from(this.el.getElementsByClassName(dClass)).forEach(d => d.style.display = showDivs[dClass]);
    }

  }

  spawn() {

    let blinkCount = 0;
  
    function blink(item) {
      if (blinkCount === 44) {
                 item.speed = d[item.direction].speed; item.free = 'free'; 
                 item.reAppear();
                 return true;
      }
      let display = 'none';
      if (blinkCount % 8 === 0 || blinkCount === 0) {display = '';}
      if (blinkCount % 4 === 0) {item.el.style.display = display;}
      blinkCount++;
      setTimeout(function() {blink(item);},50);
    }
  
    blink(this);
    
  }

  get isInBox() {
    const board = this.board;
    if (this.rcPos.row >= board.ghostStart.row && this.rcPos.row < board.ghostEnd.row - 1) {
      if (this.rcPos.col >= board.ghostStart.col && this.rcPos.col <= board.ghostEnd.col) {
        return true;
      }
    }
    return false;
  }

  move(dir) {

    const board = this.board;
    const fringeW = Math.floor(board.tileW * 1.5 / 12);
    let ds = {left: {row: 0, col: -1,
                     eyeleft: fringeW * 2,
                     pupiltop: (board.tileW / 6) + fringeW * 2.5,
                     pupilleft: fringeW * 2},
              right: {row: 0, col: 1,
                      eyeleft: fringeW * 3,
                      pupiltop: (board.tileW / 6) + fringeW * 2.5,
                      pupilleft: fringeW * 4},
              up: {row: -1, col: 0,
                   eyeleft: fringeW * 2.5,
                   pupiltop: (board.tileW / 6) + fringeW * 0.5,
                   pupilleft: fringeW * 3},
              down: {row: 1, col: 0,
                     eyeleft: fringeW * 2.5,
                     pupiltop: (board.tileW / 6) + fringeW * 2.5,
                     pupilleft: fringeW * 3}};

    if (this.direction !== dir) {
      this.moveEyes(dir,board,d);
    }
    this.direction = dir;
    this.speed = board.speed * ds[dir].row + board.speed * ds[dir].col;

    this.position.x = this.position.x + board.speed * ds[dir].col, this.position.y = this.position.y + board.speed * ds[dir].row;
    this.el.style.left = this.position.x, this.el.style.top = this.position.y;
    this.rcPos.col = Math.floor(this.position.x / board.tileW), this.rcPos.row = Math.floor(this.position.y / board.tileW);

  }

  moveEyes(dir,board=board2,dirArray=d) {
    console.log(dirArray);
    const {fringeW} = board;
    let eyes = Array.from(this.el.getElementsByClassName('eyeball'));
    let pupils = Array.from(this.el.getElementsByClassName('pupil'));
  
    eyes[0].style.left = dirArray[dir].eyeleft + 'px';
    eyes[1].style.left = (dirArray[dir].eyeleft + fringeW * 5) + 'px';
  
    pupils[0].style.left = parseFloat(dirArray[dir].pupilleft) + 'px';
    pupils[1].style.left = (parseFloat(dirArray[dir].pupilleft) + fringeW * 5) + 'px';

    pupils[0].style.top = pupils[1].style.top = dirArray[dir].pupiltop;

  }

}

class MsPacMan {

  constructor(board) {
  
    let row = board.layout.findIndex(x => x.includes('P'));
    let col = board.layout[row].indexOf('P');
    let pacPos = {row, col};

    this.position = findXY(pacPos);
    this.speed = board.speed;
    this.rcPos = pacPos;
    this.cache = '';
    this.direction = 'right';

    // Add image
    let game = document.getElementById('game');
    let el = document.createElement('img');
    el.id = 'mspacman';
    el.classList.add('ms-pac-man');
    el.src = './images/mspacman1.png';
  
    // Set position
    el.style.left = this.position.x - board.tileW / 2;
    el.style.top = this.position.y;
  
    game.appendChild(el);

    this.el = el;

  }

  move(board=board2) {

    if (this.direction === 'left' || this.direction === 'right' ) {
      this.position.x += this.speed;
      this.el.style.left = this.position.x;
    } else if (this.direction === 'up' || this.direction === 'down' ){
        this.position.y += this.speed;
        this.el.style.top = this.position.y;
    }

    this.rcPos.row = Math.floor(this.position.y / board.tileW);
    this.rcPos.col = Math.floor(this.position.x / board.tileW);

  }

}

// make a board out of the map, with speed set to 6
const board2 = new Board(board,6);
const d = new Directions(board2);

const [ghosts,portals] = [[],[]];
let isMobile = false;
let dotCount = 0;

function drawBoardNew(board) {

  let game = document.getElementById('game');
  let scoreDiv = document.getElementById('score-board');

  scoreDiv.style.left = (board.cols * board.tileW - parseInt(scoreDiv.style.width)) + "px";

  board.layout.forEach((cols,row)=>{

    // record ghost box positions, if applicable
    if (cols.includes('G') && board.ghostStart.row === -1) {
      board.ghostStart.col = cols.indexOf('G'); 
      board.ghostStart.row = row;
      board.ghostEnd.col = cols.lastIndexOf('G');
    }
    else if (cols.includes('G') && board.ghostEnd.row < row) {
      board.ghostEnd.row = row;
    }

    // record portal positions, if applicable
    if (cols.startsWith('-')) {board.portals.push(row);}

    for (let col = 0; col < cols.length; col++) {

      const pos = new RcPos(row,col);

      if (cols.charAt(col) === 'X') {

        // make a wall, if applicable
        const thisBlock = new Wall(pos,board);
        game.appendChild(thisBlock);

      } else if (cols.charAt(col) !== 'G' && cols.charAt(col) !== 'S' && cols.charAt(col) !== 'P') {

        // Make a pacDot, if applicable
        const corners = board.tileCorners(pos);

        if (corners.bottomRight === 'outer') {

          const [ n , r , d ] = [board.tile(pos), board.tile(pos.right), board.tile(pos.bottom)];

          if (n !== 'P' && r !== 'P' && r !== 'S' && d !== 'S') {
            let big = false;
            if (board.tile(pos) === 'B') { big = true; }
            game.appendChild(new PacDot(pos, board, big));
            dotCount++;

          } 

        }

      }

    }
  })  
  
  // Make the ghost div
  let ghostArea = new GhostBox(board.ghostStart,board.ghostEnd,board2);
  game.appendChild(ghostArea);

  // Make the message divs
  //id, top, left, height, width, str, board, visibility
  const {tileW, ghostStart : {row, col}} = board;
  let [ready, over, winner] = [{id: 'ready', innerHTML: 'READY!', style: {top: tileW * (row + 4), left: tileW * col, fontSize: '2rem'}},
                               {id: 'game-over', style: {top: tileW * (row - 1), left: tileW * (col - 1), fontSize: '4rem', display: 'none'},
                                innerHTML: 'GAME OVER!',},
                               {id: 'winner', style: {top: tileW * (row + 1), left: board.tileW * (col - 4),fontSize: '3.5rem', display: 'none'},
                                innerHTML: 'WINNER!!',}];
    let [readyDiv, overDiv, winnerDiv] = [new MessageDiv(ready,board),new MessageDiv(over,board),new MessageDiv(winner,board)];

    game.append(readyDiv, overDiv, winnerDiv);

    const inky = new Ghost({'row':11,'col':14},'red','left','inky','free',board);
    const blinky = new Ghost({'row':14,'col':12},'aqua','up','blinky','notfree',board);
    const pinky = new Ghost({'row':14,'col':14},'plum','down','pinky','notfree',board);
    const clyde = new Ghost({'row':14,'col':16},'orange','right','clyde','notfree',board);

    ghosts.push(inky, blinky, pinky, clyde);
    for (let ghost of ghosts) {game.appendChild(ghost.el)}

    // if there are ghosts in the box from a prior run, remove them
    if (board.ghostsInBox.length > 0) {board.ghostsInBox.splice(0,board.ghostsInBox.length - 1);}

    // Add any relevant ghosts to the 'ghosts in box' list
    for(let ghost of ghosts) {if (ghost.boxPosition !== 'none') {board.ghostsInBox.push(ghost.el.id)}}

    // Make arrow divs
      // make arrow divs and put them below the main game
  let arrowsDiv = document.createElement('div');
  let height = window.innerHeight - (board2.rows) * board2.tileW - 20;
  let [arrowW,arrowH] = [(Math.floor(height/3 - 40)) * 2, (Math.floor(height/3 - 40))];
  let upArrowL = (board2.cols * board2.tileW - arrowW) / 2 ;

  arrowsDiv.style.top = (board2.rows * board2.tileW) + 'px';
  arrowsDiv.style.width = (board2.cols * board2.tileW) + 'px'
  arrowsDiv.classList.add('arrow-div');

  //if (isMobile === false) {arrowsDiv.style.display = 'none';}

  const positions = {up: upArrowL, down: upArrowL, left: upArrowL - arrowW / 2 - 40, right: upArrowL + arrowW};              

  for (let dir in positions) {const tempArrow = makeArrow(dir,arrowW); arrowsDiv.appendChild(tempArrow);}

  function makeArrow(dir,arrowW) {
    const arrow = document.createElement('div');
    const arrowImg = makeArrowImg(arrowW,dir);
    arrow.appendChild(arrowImg);
    arrow.classList.add('arrow');
    [arrow.id, arrow.style.left, arrow.style.top] = [dir + '-arrow', positions[dir] + 'px', (arrowH + d[dir].row * arrowH) + 'px'];
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

window.onload = (event) => {
  let test = document.getElementsByClassName('test-div')
  if (test[0].style.display == 'none') {isMobile = true;}
  drawBoardNew(board2);
  msPacMan = new MsPacMan(board2);
}

function findXY(rcPos,board=board2) {return {x: rcPos.col * board.tileW, y: rcPos.row * board.tileW} }

function nextPos(pos,dir) {return dir === '' ? pos : {col: pos.col + d[dir].col, row: pos.row + d[dir].row} }

function isWall(pos,dir,board=board2) {
  const [row1, row2] = [dir === 'down' ? pos.row + 1 : pos.row, dir === 'up' ? pos.row : pos.row + 1];
  const [col1, col2] = [dir === 'right'? pos.col + 1 : pos.col, dir === 'left' ? pos.col : pos.col + 1];
  const [res1, res2]  = [board.layout[row1].charAt(col1), board.layout[row2].charAt(col2)];
  return (res1.search(/[XG]/) >= 0 || res2.search(/[XG]/) >= 0)
}
