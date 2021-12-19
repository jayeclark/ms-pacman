/* eslint-disable import/extensions */
import GamePiece from './GamePiece.js';
import Directions from './Directions.js';
import {
  startEntry, endEntry, startReshuffle, ghostGateCoords,
} from '../utilities/lib.js';

function isOpen(str) {
  return str !== 'wall' && str !== 'ghostbox';
}

export const ghosts = [];

export default class Ghost extends GamePiece {
  constructor(position, startingDirection, color, id, mode) {
    super(position, startingDirection);
    this.color = color;
    this.element = this.makeElement('div', 'ghost', this.makeStyle(), id);
    this.addFringe().addEyes().addBlueFeatures();
    this.status = {
      munchModeActive: false,
      restarted: false,
      stop: false,
      mode,
    };
    ghosts.push(this);
  }

  static boxPositions(ghostArray) {
    const positions = {};
    ghostArray.forEach((ghost) => {
      const ghostPosition = ghost.boxPosition;
      if (ghostPosition && ghostPosition !== 'none') {
        positions[ghostPosition] = ghost.element.id;
      }
    });

    return positions;
  }

  get boxPosition() {
    const {
      rcPos: { board },
      position: { x },
    } = this;
    const {
      ghostContainer: {
        gateStart: { x: xS },
      },
      tileW,
    } = board;
    if (x > xS + tileW && this.isInBox) {
      return 'right';
    }
    if (x < xS + tileW && this.isInBox) {
      return 'left';
    }
    if (x === xS + tileW && this.isInBox) {
      return 'center';
    }
    return 'none';
  }

  get isInBox() {
    const {
      position: { x, y },
      rcPos: {
        board: {
          ghostContainer: { start, end },
        },
      },
    } = this;
    return y >= start.y && y < end.y && x >= start.x && x <= end.x;
  }

  addFringe() {
    const {
      board: { tileW, fringeW },
      makeElement,
    } = this;
    const fringeMiddle = tileW * 1.5 - fringeW * 10;
    const fringeImage = `radial-gradient(ellipse at top 51% left 50%, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 70%, ${this.color} 70%)`;

    let leftPosition = 0;
    for (let i = 1; i < 8; i += 1) {
      const style = {
        backgroundColor: i % 2 === 0 ? 'transparent' : this.color,
        backgroundImage: i % 2 === 0 ? fringeImage : 'none',
        width: ((i === 1 || i === 7) && `${fringeW}px`)
                || (i === 4 && `${fringeMiddle}px`)
                || `${fringeW * 2}px`,
        left: leftPosition,
      };

      const classNames = ['fringe'];
      switch (i) {
        case 1:
          classNames.push('fringe-left');
          break;
        case 7:
          classNames.push('fringe-right');
          break;
        default:
          classNames.push('fringe-inner');
      }

      this.element.appendChild(makeElement('div', classNames, style));
      leftPosition += parseFloat(style.width);
    }
    return this;
  }

  addEyes() {
    const {
      eyeTop, eyeLeft, pupilTop, pupilLeft,
    } = new Directions(this.board)[
      this.direction
    ];
    const {
      makeElement,
      board: { fringeW },
    } = this;

    this.element.appendChild(
      makeElement('div', 'eyeball', { top: eyeTop, left: eyeLeft }),
    );
    this.element.appendChild(
      makeElement('div', 'eyeball', {
        top: eyeTop,
        left: fringeW * 5 + eyeLeft,
      }),
    );
    this.element.appendChild(
      makeElement('div', 'pupil', { top: pupilTop, left: pupilLeft }),
    );
    this.element.appendChild(
      makeElement('div', 'pupil', {
        top: pupilTop,
        left: fringeW * 5 + pupilLeft,
      }),
    );
    return this;
  }

  addBlueFeatures() {
    const {
      makeElement,
      board: { fringeW, tileW },
    } = this;

    // eyes and mouth for munch mode, display = none
    this.element.appendChild(
      makeElement('div', 'blue-pupil', { display: 'none', left: fringeW * 3 }),
    );
    this.element.appendChild(
      makeElement('div', 'blue-pupil', { display: 'none', left: fringeW * 8 }),
    );

    // frown for munch mode, display = none
    const adjustment = Math.round(tileW * 0.75 - fringeW * 5) / 4;
    for (let i = 1; i < 5; i += 1) {
      this.element.appendChild(
        makeElement('div', 'blue-frown', {
          display: 'none',
          left: adjustment * (3 - i) + fringeW * (3 * i - 2),
        }),
      );
    }
  }

  makeStyle() {
    const {
      color,
      rcPos: {
        row,
        col,
        board: { tileW },
      },
    } = this;
    return {
      backgroundColor: color,
      top: tileW * row,
      left: tileW * col - tileW / 2,
    };
  }

  leaveBox() {
    if (this.status.restarted === true) {
      return false;
    }

    if (this.status.stop === false) {
      const {
        speed,
        board,
        position: { x: xG, y: yG },
        status: { mode },
      } = this;
      const {
        tileW,
        ghostContainer: {
          gateStart: { x, y },
        },
      } = board;
      const [xS, yS] = [x + tileW / 2, y - tileW * 2];
      if (xG === xS && yG > yS && mode === 'notfree') {
        this.setDirection('up');
        this.speed = new Directions(this.board).up.speed;
        this.move();
      } else if (
        (xG > xS || xG > xS)
        && xS - xG < parseInt(speed, 10)
        && mode === 'notfree'
      ) {
        this.position.x = xS;
        this.element.style.left = this.position.x;
      } else if (xG === xS && yG === yS && mode === 'notfree') {
        this.status.mode = 'free';
        this.board.ghostsInBox.splice(
          this.board.ghostsInBox.indexOf(this.element.id),
          1,
        );

        if (this.position.x % tileW > 0) {
          this.position.x -= this.position.x % board.tileW;
          this.element.style.left = this.position.x;
        }

        setTimeout(() => {
          const ghostGate = document.getElementById('ghost-gate');
          ghostGate.style.backgroundColor = '#e1e1fb';
        }, 500);
      } else if (mode === 'notfree') {
        const options = new Directions(this.board);
        this.setDirection(xG < xS ? 'right' : 'left');
        this.speed = xG < xS ? options.right.speed : options.left.speed;
        this.move();
      }
    }

    return true;
  }

  reShuffle(ghostArray) {
    const { board } = this;
    const xS = board.ghostGateX;
    const right = xS + board.tileW * 2;
    const left = xS - board.tileW * 2;

    if (this.boxPosition === 'center' && Ghost.boxPositions(ghostArray).right === false) {
      this.move('right');
    } else if (this.boxPosition === 'center' && Ghost.boxPositions(ghostArray).left === false) {
      this.move('left');
    } else if (this.boxPosition === 'right' && this.position.x < right) {
      this.move('right');
    } else if (this.boxPosition === 'left' && this.position.x > left) {
      this.move('left');
    } else {
      this.moveEyes('up');
      return true;
    }
    return false;
  }

  targetCoordinates(player) {
    // Destructure this' properties
    const {
      board: { boardHeight, boardWidth },
      status: { munchModeActive, mode },
      element: { id },
      speed,
      position: { x: xG, y: yG },
    } = this;
    const [isFree, isReturning] = [mode === 'free', mode === 'returning'];

    // Find MsPacMan location
    const [xP, yP] = [
      parseInt(player.element.style.left, 10),
      parseInt(player.element.style.top, 10),
    ];
    const isCloseToPac = Math.abs(yP - yG) + Math.abs(yP - yG) > (boardHeight + boardWidth) / 3;

    if (id === 'clyde' && isCloseToPac && isFree && munchModeActive === false) {
      return { x: boardWidth, y: boardHeight };
    }
    if (isFree && munchModeActive === false) {
      return { x: xP, y: yP };
    }
    if (isFree && munchModeActive) {
      return { x: boardWidth - xG, y: boardHeight - yG };
    }
    if (isReturning) {
      const coords = ghostGateCoords(this.board);

      if (coords.xS % Math.abs(speed) > 0) {
        coords.xS -= coords.xS % Math.abs(speed);
      }
      return { x: coords.xS, y: coords.yS };
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

  filterDirections(options = ['left', 'right', 'up', 'down']) {
    const d = new Directions(this.board);
    const nextArray = options.map((x) => this.rcPos.check(x, 2, 2));
    return options.filter((dir, i) => (
      nextArray[i].every((tile) => isOpen(tile))
      && dir !== d[this.direction].reverse
    ));
  }

  pickDir(player) {
    const pacDir = player.direction;
    const {
      status: { mode },
      position: { x: currX, y: currY },
      rcPos: { row },
      board: {
        tileW,
        boardWidth: { boardW },
        portals,
        ghostsInBox,
      },
    } = this;
    const { x: targX, y: targY } = this.targetCoordinates(player);
    if (currX === targX && currY === targY && mode === 'returning') {
      // If the box is full, spawn in place - otherwise, enter the box
      if (ghostsInBox.length >= 3) {
        endEntry(this, 'left');
      } else {
        startEntry(this);
      }
    } else if (mode === 'reentering') {
      // figure out if ghost has hit the end on the y axis. if so pick left, right, or stay
      const { xS, yE } = ghostGateCoords(this.board);
      const { x: xG, y: yG } = this.position;
      if (xG === xS && mode === 'reentering' && yG >= yE) {
        // decide which way to turn based on whether another ghost is in that area
        let [leftOccupied, rightOccupied] = [false, false];

        ghosts.forEach(({ element: { id }, isInBox, position: { x: xPos } }) => {
          if (id !== this.element.id && isInBox && xPos > xS) {
            rightOccupied = true;
          } else if (id !== this.element.id && isInBox && xPos < xS) {
            leftOccupied = true;
          }
        });

        if (rightOccupied === false) {
          startReshuffle(this, 'right');
        } else if (leftOccupied === false) {
          startReshuffle(this, 'left');
        } else {
          endEntry(this, 'up');
        }
      }
    } else if (mode === 'reshuffling') {
      // Determing if ghost has hit the edge of the box and, if so, stop
      const { leftPos, rightPos } = ghostGateCoords(this.board);
      const { x: xG } = this.position;
      if (this.direction === 'left' && xG <= leftPos) {
        endEntry(this, 'right');
      } else if (this.direction === 'right' && xG >= rightPos) {
        endEntry(this, 'left');
      }
    } else if (
      currX % tileW === 0
      && currY % tileW === 0
      && /^free|returning/.test(mode)
    ) {
      const options = this.filterDirections();

      // find target row and column direction relative to ghost
      const yDir = (targY > currY && 'down') || (targY < currY && 'up') || 'same';
      let xDir = (targX > currX && 'right') || (targX < currX && 'left') || 'same';

      // if the item is in a portal row, see if it would be better to go through the portal
      if (portals.includes(row)) {
        const [optA, optB] = [
          Math.abs(targX - currX),
          Math.min(targX, boardW - targX) + Math.min(currX, boardW - currX),
        ];
        if (xDir !== 'same' && optB < optA) {
          xDir = new Directions(this.board)[xDir].reverse;
        }
      }

      const {
        rcPos,
        element: { id },
      } = this;
      const dirPreference = rcPos.resolveDirection(yDir, xDir);

      if (
        mode !== 'returning'
        && options.includes(pacDir)
        && id.match(/blinky|pinky/)
      ) {
        this.setDirection(pacDir);
      } else if (options.includes(yDir) && options.includes(xDir)) {
        this.setDirection(dirPreference);
      } else if (options.includes(yDir) || options.includes(xDir)) {
        const filteredOpts = options.filter((x) => x === yDir || x === xDir);
        this.setDirection(filteredOpts[0]);
      } else if (!options.includes(this.direction)) {
        this.setDirection(options[Math.floor(Math.random() * options.length)]);
      } else {
        this.setDirection(options[0]);
      }

      this.teleport();

      if (
        this.status.mode === 'returning'
        && !(
          targY === currY
          && currX > targX - 2 * tileW
          && currX < targX + 2 * tileW
        )
      ) {
        const item = this;
        setTimeout(() => {
          item.move();
          item.pickDir(player);
        }, 25);
      }
    }
  }

  disAppear() {
    this.status.mode = 'returning';
    this.element.style.backgroundColor = 'transparent';
    const classes = ['fringe', 'eyeball', 'pupil', 'blue-frown', 'blue-pupil'];
    classes.forEach((type) => {
      Array.from(this.element.getElementsByClassName(type))
        .forEach((div) => {
          const { style } = div;
          style.display = div.style.display === 'none' ? '' : 'none';
        });
    });
  }

  reAppear() {
    const { element } = this;
    let [{ color }, divs] = [
      this,
      {
        eyeball: '',
        pupil: '',
        fringe: '',
        'blue-frown': 'none',
        'blue-pupil': 'none',
      },
    ];
    if (this.status.munchModeActive === true) {
      [color, divs] = [
        'blue',
        {
          eyeball: 'none',
          pupil: 'none',
          fringe: '',
          'blue-frown': '',
          'blue-pupil': '',
        },
      ];
    }

    this.element.style.backgroundColor = color;
    const fringes = Array.from(this.element.getElementsByClassName('fringe'));
    fringes.forEach((item) => {
      const { style } = item;
      if (style.backgroundColor !== 'transparent') {
        style.backgroundColor = color;
      } else {
        style.backgroundImage = style.backgroundImage.replace(
          /blue|white/,
          color,
        );
      }
    });

    Object.keys(divs).forEach((key) => {
      [...element.getElementsByClassName(key)].forEach((item) => {
        const { style } = item;
        style.display = divs[key];
      });
    });
  }

  spawn(freeStatusOnSpawn) {
    // Change appearance back to normal
    this.status.mode = 'spawning';
    this.status.munchModeActive = false;
    this.element.style.backgroundColor = this.color;

    const fringes = Array.from(this.element.getElementsByClassName('fringe'));
    fringes.forEach((fringe) => {
      const { style } = fringe;
      if (
        style.backgroundColor !== ''
        && style.backgroundColor !== 'transparent'
      ) {
        style.backgroundColor = this.color;
        style.display = '';
      } else {
        const newBgImage = style.backgroundImage
          .replace('blue', this.color)
          .replace('white', this.color);
        style.backgroundImage = newBgImage;
        style.display = '';
      }
    });
    [
      ...this.element.getElementsByClassName('blue-frown'),
      ...this.element.getElementsByClassName('blue-pupil'),
    ].forEach((item) => {
      const { style } = item;
      style.display = 'none';
    });

    // Blink several times before solidifying
    const handleReappearance = (x) => {
      const item = x;
      item.speed = new Directions(this.board)[item.direction].speed;
      item.setStatus('mode', freeStatusOnSpawn);
      item.reAppear();
    };

    this.blink(handleReappearance);
  }

  moveEyes(dir) {
    const {
      element,
      board: { fringeW: f },
    } = this;
    const { eyeLeft, pupilLeft, pupilTop } = new Directions(this.board)[dir];
    const [eyes, pupils] = [
      [...element.getElementsByClassName('eyeball')],
      [...element.getElementsByClassName('pupil')],
    ];
    eyes.forEach((eye, i) => {
      const { style } = eye;
      style.left = `${(eyeLeft + f * 5 * i)}px`;
    });
    pupils.forEach((pupil, i) => {
      const { style } = pupil;
      style.left = `${(pupilLeft + f * 5 * i)}px`;
      style.top = `${pupilTop}px`;
    });
  }

  setStatus(prop, val) {
    this.status[prop] = val;
  }
}
