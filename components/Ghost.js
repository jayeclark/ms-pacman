import { GamePiece } from './GamePiece.js';
import { Directions } from './Directions.js';
import { Tile } from './Tile.js';
import { msPacMan } from '../mspacman.js';

export const ghosts = [];

export class Ghost extends GamePiece {

  constructor(position, startingDirection, color, id, mode ) {
    super(position, startingDirection);
    this.color = color;
    this.element = this.makeElement('div', 'ghost', this.makeStyle(), id);
    this.addFringe().addEyes().addBlueFeatures();
    this.status = { munchModeActive: false, restarted: false, stop: false, mode };
    ghosts.push(this);
  }
  
  static boxPositions(ghosts) {
    const positions = {};
    for (let ghost of ghosts) {
      const ghostPosition = ghost.boxPosition;
      if (ghostPosition && ghostPosition !== 'none') {
        positions[ghostPosition] = ghost.element.id;
      }
    }
    return positions;
  }

  get boxPosition() {
    const { rcPos: { board }, position: { x } } = this;
    const { ghostContainer: { gateStart: { x: xS }}, tileW } = board;
    if (x > xS + tileW && this.isInBox) { return 'right'; } 
    else if (x < xS + tileW && this.isInBox) { return 'left'; }
    else if (x === xS + tileW && this.isInBox) { return 'center'; }
    return 'none';
  }

  get isInBox() {
    const { position: { x, y }, rcPos: { board: { ghostContainer: { start, end } } } } = this;
    return (y >= start.y && y < end.y && x >= start.x && x <= end.x); 
  }
  
  addFringe() {

    const { board: { tileW, fringeW }, makeElement } = this;
    const fringeMiddle = tileW * 1.5 - fringeW * 10;
    const fringeImage = `radial-gradient(ellipse at top 51% left 50%, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 70%, ${this.color} 70%)`;
    
    let leftPosition = 0;
    for (let i = 1; i < 8; i++) {
      const style = { backgroundColor: i % 2 === 0 ? 'transparent' : this.color,
                      backgroundImage: i % 2 === 0 ? fringeImage : 'none',
                      width: (i === 1 || i === 7) ? fringeW + 'px' : i === 4 ? fringeMiddle + 'px' : fringeW * 2,
                      left: leftPosition};
          
      let classNames = ['fringe'];
      switch (i) {
          case i === 1: classNames.push('fringe-left'); break;
          case i === 7: classNames.push('fringe-right'); break;
          default: classNames.push('fringe-inner');
        }
  
      this.element.appendChild(makeElement('div', classNames, style));
      leftPosition += parseFloat(style.width);
    }
    return this;
  }

  addEyes() {
    const { eyetop, eyeleft, pupiltop, pupilleft } = new Directions(this.board)[this.direction]; 
    const { makeElement, board: { fringeW } } =  this;
    
    this.element.appendChild(makeElement('div', 'eyeball', { top: eyetop, left: eyeleft }));
    this.element.appendChild(makeElement('div', 'eyeball', { top: eyetop, left: fringeW * 5 + eyeleft } ));
    this.element.appendChild(makeElement('div', 'pupil', { top: pupiltop, left: pupilleft }));
    this.element.appendChild(makeElement('div', 'pupil', { top : pupiltop, left: fringeW * 5 + pupilleft }));
    return this;
  }

  addBlueFeatures() {
    const { makeElement, board: { fringeW, tileW } } =  this;
    
    // eyes and mouth for munch mode, display = none
    this.element.appendChild(makeElement('div', 'blue-pupil', { display: 'none', left: fringeW * 3 }));
    this.element.appendChild(makeElement('div', 'blue-pupil', { display: 'none', left: fringeW * 8 }));
  
    // frown for munch mode, display = none
    const adjustment = Math.round(tileW * 0.75 - fringeW * 5)/4;
    for (let i = 1; i < 5; i++) {
      this.element.appendChild(makeElement('div', 'blue-frown', { display: 'none', left: adjustment * (3 - i) + fringeW * (3 * i - 2) }));
    }
  }

  makeStyle() {
    const { color, rcPos: { row, col, board: { tileW } } } = this;
    return { backgroundColor: color, 
             top: tileW * row, 
             left: tileW * col - tileW / 2 };   
  }

  leaveBox() {
  
    if (this.status.restarted === true) { return false; }
  
    if (this.status.stop === false) {
  
      const { speed, board, position: { x: xG, y: yG }, status: { mode } } = this;
      const { tileW, ghostContainer: { gateStart: { x, y } } } = board;
      const [xS, yS] = [x + tileW / 2, y - tileW * 2];
      if (xG === xS && yG > yS && mode === 'notfree') { 
        this.setDirection('up');
        this.speed = new Directions(this.board).up.speed;
        this.move(); 
      }
      else if ((xG > xS || xG > xS) && xS - xG < parseInt(speed) && mode === 'notfree') {
        this.position.x = xS;
        this.element.style.left = this.position.x;
      }
      else if (xG === xS && yG === yS && mode === 'notfree') {
        this.status.mode = 'free';
        this.board.ghostsInBox.splice(this.board.ghostsInBox.indexOf(this.element.id),1);

        if (this.position.x % tileW > 0) {
          this.position.x -= this.position.x % board.tileW;
          this.element.style.left = this.position.x;
        }
        
        setTimeout(function() {
          const ghostGate = document.getElementById('ghost-gate');
          ghostGate.style.backgroundColor = '#e1e1fb';
        }, 500)
          
      }
      else if (mode === 'notfree') {
        const options = new Directions(this.board);
        xG < xS ? this.setDirection('right') : this.setDirection('left');
        this.speed = xG < xS ? options.right.speed : options.left.speed;
        this.move();
      }
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
  
  enterBox() {
  
    const { board: { tileW, ghostContainer: { gateStart: { x, y }, gateEnd: { y: yE } } }, 
            element, 
            status: { mode, stop, restarted },
            direction,
            position: { x: xG, y: yG } } = this;
    const [xS, yS] = [x + tileW / 2, y - tileW * 2];
    const [leftPos, rightPos] = [xS - tileW * 2, xS - tileW * 2];

    if (!stop && xG === xS && yG >= yS && mode === 'returning') {
      this.setDirection('down'); this.move(); this.status.mode = 'notfree';
    } else if (!stop && xG === xS && mode === 'notfree' && yG < yE) {
      this.setDirection('down'); this.move();
    } else if (!stop && xG === xS && mode === 'notfree' && yG >= yE) {

      // decide which way to turn based on whether another ghost is in that area
      let [leftOccupied, rightOccupied] = [false, false];

      ghosts.forEach(({ element: { id }, isInBox, position: { x } }) => {
        if (id !== this.element.id && isInBox && x > xS) { rightOccupied = true; }
        else if (id !== this.element.id && isInBox && x > xS) { leftOccupied = true; }
      })

      if (rightOccupied === false) {this.setDirection('right'); this.move();}
      else if (leftOccupied === false) {this.setDirection('left'); this.move();}
      else {
        this.setDirection('up');
        this.speed = 0;
        this.reAppear();
        return true;
      }
    }
    else if (!stop && mode === 'notfree' && direction === 'right' && xG < rightPos) {
      this.setDirection('right'); this.move();
    }
    else if (!stop && mode === 'notfree' && direction === 'left' && xG > leftPos) {
      this.setDirection('left'); this.move();
    }
    else if (!stop) {
      this.setDirection('down');
      this.speed = 0;
      this.reAppear();
      return true;
    }
    if (restarted === true) { return false; }
  }

  get targetCoordinates() {

    // Destructure this' properties
    const { board: { boardHeight, boardWidth }, 
            status: { munchModeActive, mode }, 
            element: { id }, 
            speed,
            position: { x: xG, y: yG } } = this;
    const [isFree, isReturning] = [mode === 'free', mode === 'returning'];
    
    // Find MsPacMan location
    const [xP, yP] = [parseInt(msPacMan.element.style.left), parseInt(msPacMan.element.style.top)];
    const isCloseToPac = (Math.abs(yP - yG) + Math.abs(yP - yG)) > (boardHeight + boardWidth) / 3;

    if (id === 'clyde' && isCloseToPac && isFree && munchModeActive === false ) {
      return { x: boardWidth, y: boardHeight };
    } 
    else if (isFree && munchModeActive === false) {
      return { x: xP, y: yP };
    } 
    else if (isFree && munchModeActive) {
      return { x: boardWidth - xG, y: boardHeight - yG };
    } 
    else if (isReturning) {
      let { board: { tileW, ghostContainer: { gateStart: { x: xGG, y: yGG } } } } = this;
      if (xGG % Math.abs(speed) > 0) { xGG -= xGG % Math.abs(speed); }
      return { x: xGG + tileW * 2 / 3, y: yGG - tileW * 2 };
    }
    return { x: xP, y: yP };
  }

  setDirection(direction) {
    if (this.direction !== direction && this.direction !== 'same') { 
      this.moveEyes(direction);
      this.direction = direction; 
      this.speed = new Directions(this.board)[direction].speed;
    }    
  }

  reEnter() {

    enter(this);

    function enter(item) {
      if (item.enterBox()) {
        setTimeout(function() {
          document.getElementById('ghost-gate').style.backgroundColor = '#e1e1fb';
        }, 500)
        return true;
      }

      setTimeout(function() { enter(item) }, 50);
    }   
  }

  filterDirections(options=['left','right','up','down']) {
    const d = new Directions(this.board);
    return options.filter(dir => {
      const next = this.rcPos.check(dir, 2, 2);
      return next.every(tile => tile.isOpen()) && dir !== d[this.direction].reverse;
    });
  }

  pickDir() {
      
        const pacDir = msPacMan.direction;
        const { status: { mode }, 
                position: {x: currX , y: currY }, 
                rcPos: { row },
                board: { tileW, boardWidth: { boardW } , portals, ghostsInBox }, 
                targetCoordinates: {x: targX, y: targY} } = this;
            
        if (currX === targX && currY === targY && mode === 'returning' && ghostsInBox.length >= 3) {
          // returning ghost has hit the way to get into the ghost box but there are three ghosts in the box
            this.setDirection('left');
            this.speed = 0;
            this.spawn('free');
        } else if (currX === targX && currY === targY && mode === 'returning' ) {
      
            // returning ghost has hit the way to get into the ghost box and there is room to get into the box
            this.setDirection('down');
            this.position.x = tileW * 14 - tileW / 2;
            this.element.style.left = this.position.x + "px";
      
            document.getElementById('ghost-gate').style.backgroundColor = 'black';
            if (ghostsInBox.includes(this.element.id) === false) {
              this.board.ghostsInBox.push(this.element.id);
            }
            this.reEnter();

        }
            
        // do these calculations if the ghost has hit a tile square-on
        else if (currX % tileW === 0 && currY % tileW === 0 && this.isInBox === false) {
      
          const options = this.filterDirections();

          // find target row and column direction relative to ghost
          const yDir = targY > currY ? 'down' : targY < currY ? 'up' : 'same';
          let xDir = targX > currX ? 'right' : targX < currX ? 'left' : 'same';
          const randNum = Math.random();
    
          // if the item is in a portal row, see if it would be better to go through the portal
          if (portals.includes(row)) {
            const [optA, optB] = [Math.abs(targX - currX), Math.min(targX, (boardW - targX)) + Math.min(currX, (boardW - currX))];
            if (xDir !== 'same' && optB < optA) { xDir = new Directions(this.board)[xDir].reverse; }
          }
    
          const [dirPreference, { element: { id } }] = [this.rcPos.resolveDirection(yDir, xDir), this];
              
          if (mode !== 'returning' && options.includes(pacDir) && id.match(/blinky|pinky/)) { this.setDirection(pacDir); }
          else if (options.includesAll(yDir, xDir)) { this.setDirection(dirPreference); }
          else if (options.includesAny(yDir, xDir)) { 
            const dir = options.filter(x => x === yDir || x === xDir);
            this.setDirection(dir[0]);
          }
          else if (options.includes(xDir)) { this.setDirection(xDir); }
          else if (!options.includes(this.direction)) { this.setDirection(options[Math.floor(Math.random() * options.length)]); }

          this.teleport();

          if (mode === 'returning' && !(targY === currY && currX > targX - 2 * tileW && currX < targX + 2 * tileW)) {
            let item = this;
            setTimeout(function() {item.move();},25);
          }
        }
  }
  
  disAppear() {
      this.status.mode = 'returning', this.element.style.backgroundColor = 'transparent';
      const classes = ['fringe','eyeball','pupil','blue-frown','blue-pupil'];
      classes.forEach(type => Array.from(this.element.getElementsByClassName(type))
                                   .forEach(div => div.style.display = div.style.display === 'none' ? '' : 'none' ));
  }
  
  reAppear() {
      let [ { color, element }, divs] = [this, { eyeball: '', pupil: '', fringe: '', 'blue-frown': 'none', 'blue-pupil': 'none' }];
      if (this.status.munchModeActive === true) {
        [color, divs] = ['blue', { eyeball: 'none', pupil: 'none', fringe: '', 'blue-frown': '', 'blue-pupil': '' }]
      }
  
      this.element.style.backgroundColor = color;
      const fringes = Array.from(this.element.getElementsByClassName('fringe'))
      fringes.forEach(({ style }) => {
        if (style.backgroundColor !== 'transparent') { style.backgroundColor = color; } 
        else { style.backgroundImage = style.backgroundImage.replace(/blue|white/, color); }
      })
  
      for (let key in divs) { [...element.getElementsByClassName(key)].forEach(({ style }) => style.display = divs[key]); }
  }
  
  spawn(freeStatusOnSpawn) {
  
    // Change appearance back to normal
    this.status.mode = 'spawning';
    this.element.style.backgroundColor = this.color;

    let fringes = Array.from(this.element.getElementsByClassName('fringe'))
    fringes.forEach(fringe => {
      if (fringe.style.backgroundColor !== '' && fringe.style.backgroundColor !== 'transparent') {
        fringe.style.backgroundColor = this.color; fringe.style.display = '';
      } else {
        let newBgImage = fringe.style.backgroundImage.replace('blue',this.color).replace('white',this.color);
        fringe.style.backgroundImage = newBgImage; fringe.style.display = '';
      }
    })
    Array.from(this.element.getElementsByClassName('blue-frown')).forEach(frown => frown.style.display = 'none')
    Array.from(this.element.getElementsByClassName('blue-pupil')).forEach(eye => eye.style.display = 'none')
    
    // Blink several times before solidifying

      let blinkCount = 0;
      blink(this);

      function blink(item) {
        if (blinkCount === 44) {
          item.speed = new Directions[item.direction].speed; item.status.mode = freeStatusOnSpawn; 
          item.reAppear();
          return true;
        }
        if (blinkCount % 8 === 0) { item.element.style.display = ''; }
        else if (blinkCount % 4 === 0) { item.element.style.display = 'none'; }
        blinkCount++;
        setTimeout(function() { blink(item); }, 50);
      }
      
  }
    
  moveEyes(dir, dirArray=new Directions(this.board)) {
    const { fringeW } = this.board;
    let eyes = [...this.element.getElementsByClassName('eyeball')];
    let pupils = [...this.element.getElementsByClassName('pupil')];
  
    eyes[0].style.left = dirArray[dir].eyeleft + 'px';
    eyes[1].style.left = (dirArray[dir].eyeleft + fringeW * 5) + 'px';
    pupils[0].style.left = parseFloat(dirArray[dir].pupilleft) + 'px';
    pupils[1].style.left = (parseFloat(dirArray[dir].pupilleft) + fringeW * 5) + 'px';
    pupils[0].style.top = pupils[1].style.top = dirArray[dir].pupiltop;
  }
}
  