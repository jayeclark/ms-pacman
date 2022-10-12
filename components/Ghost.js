/* eslint-disable import/extensions */
import GamePiece from './GamePiece.js';
import Directions from './Directions.js';
import {
  startEntry, ghostGateCoords,
} from '../utilities/lib.js';
import { isOpen } from '../utilities/helpers.js';
// eslint-disable-next-line no-unused-vars
import Coordinates from './Coordinates.js';

export const ghosts = [];

export default class Ghost extends GamePiece {
  /**
   * Represents a ghost in the game
   * @constructor
   * @param {Coordinates} position - the position of the ghost
   * @param {string} startingDirection - the direction the ghost is traveling
   * @param {string} color - the color of the ghost
   * @param {string} id - unique identifier for the ghost
   * @param {string} mode - what mode the ghost should be in when created
   */
  constructor(position, startingDirection, color, id, mode) {
    super(position, startingDirection);
    this.color = color;
    this.status = {
      munchModeActive: false,
      restarted: false,
      stop: false,
      mode,
    };

    this.element = this.makeElement('div', 'ghost', this.makeStyle(), id);
    this.addFringe().addEyes().addBlueFeatures();

    ghosts.push(this);
  }

  /**
   * Function to determine what ghosts occupy the three available slots in the
   * ghost box at the center of the board
   * @param {Array} ghostArray - the set of ghosts whose positions should be evaluated
   * @returns an object with the three box positions (left, center, right) and,
   * if applicable, what ghost is in them (or 'none' if unoccupied)
   */
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

  /**
   * Gets the position of the ghost inside the ghostbox
   * @getter
   * @returns {string} left, center, right, or none
   */
  get boxPosition() {
    const {
      coordinates: { board },
      position: { x },
    } = this;
    const {
      ghostContainer: {
        channelBottom: { x: xS },
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

  /**
   * Gets whether the ghost is inside the ghostbox
   * @getter
   * @returns {boolean}
   */
  get isInBox() {
    const {
      position: { x, y },
      coordinates: {
        board: {
          ghostContainer: { start, end },
        },
      },
    } = this;
    return y >= start.y && y < end.y && x >= start.x && x <= end.x;
  }

  /**
   * Creates divs for the lower 'fringe' of a ghost, and appends it to the parent div
   * @returns {Ghost} - returns the same object to allow for chaining methods
   */
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

  /**
   * Creates divs for the eyes of a ghost, and appends them to the parent div
   * @returns {Ghost} - returns the same object to allow for chaining methods
   */
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

  /**
   * Creates divs for the features that are visible when a ghost is munchable, and
   * appends them to the parent div
   * @returns {Ghost} - returns the same object to allow for chaining methods
   */
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
    return this;
  }

  /**
   * Marks the end of the ghost's re-entry into the ghost box.
   * @returns {boolean} - returns true if the code executes successfully
   */
  endBoxEntry(finalDirection) {
    this.setDirection(finalDirection);
    this.speed = 0;
    this.spawn(this.isInBox ? 'notfree' : 'free');
    return true;
  }

  /**
   * Creates a style object for the ghost element constructor.
   * @returns {object} - returns true if the code executes successfully
   */
  makeStyle() {
    const {
      color,
      coordinates: {
        row,
        col,
        board: { tileW },
      },
    } = this;
    return {
      backgroundColor: color,
      top: `${(tileW * row)}px`,
      left: `${(tileW * col - tileW / 2)}px`,
    };
  }

  /**
   * Initiates the process of a ghost leaving the box.
   * @returns {boolean} - returns true if the code executes successfully
   */
  leaveBox() {
    // If the function is called while the board is resetting or stopped, return false
    if (this.status.restarted === true || this.status.stop) {
      return false;
    }

    // Extract details on the speed, board, position, and mode of the ghost
    const {
      speed,
      board,
      position: { x: xG, y: yG },
      status: { mode },
    } = this;

    // Extract information on the tile dimension and the start of the gate on the board
    const {
      tileW,
      ghostContainer: {
        channelTop: { x: xS, y: yS },
      },
    } = board;

    if (xG === xS && yG > yS && mode === 'notfree') {
      // If the ghost is in position to leave, move him up til he's at the top of the exit channel
      this.setDirection('up');
      this.speed = new Directions(this.board).up.speed;
      this.move();
    } else if (
      (xG > xS || xG < xS)
      && xS - xG < parseInt(speed, 10)
      && mode === 'notfree'
    ) {
      // If the ghost is almost in position, put him in position
      this.position.x = xS;
      this.element.style.left = this.position.x;
    } else if (xG === xS && yG === yS && mode === 'notfree') {
      // If the ghost has finished leaving, remove it from the ghostsInBox array and change mode
      const index = this.board.ghostsInBox.findIndex((g) => g === this.element.id);
      this.board.ghostsInBox.splice(index, 1);
      this.setMode('free');

      // If the ghost isn't squarely on a tile, adjust position
      if (this.position.x % tileW > 0) {
        this.position.x -= this.position.x % board.tileW;
        this.element.style.left = this.position.x;
      }

      // Close the gate to the box, after a delay
      setTimeout(() => {
        const ghostGate = document.getElementById('ghost-gate');
        ghostGate.style.backgroundColor = '#e1e1fb';
      }, 500);
    } else if (mode === 'notfree') {
      // If the host is not near the exit channel, move toward the center to exit.
      const options = new Directions(this.board);
      this.setDirection(xG < xS ? 'right' : 'left');
      this.speed = xG < xS ? options.right.speed : options.left.speed;
      this.move();
    }

    return true;
  }

  /**
   * Redistributes ghosts inside the ghost box.
   * @returns {boolean} - returns true if the ghost is finished moving and false if not
   */
  reShuffle(ghostArray) {
    const { board } = this;
    const { x: xS } = board.ghostContainer.channelTop;
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

  /**
   * Determines the x/y coordinates of the ghost's target position. Target position will
   * very based on what mode the ghost is in
   * @returns {object} - returns true if the ghost is finished moving and false if not
   */
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

  /**
   * Sets the ghost's direction
   * @returns {boolean} - returns true if the direction changed and false if not
   */
  setDirection(direction) {
    if (this.direction !== direction && this.direction !== 'same') {
      this.moveEyes(direction);
      this.direction = direction;
      this.speed = new Directions(this.board)[direction].speed;
      return true;
    }
    return false;
  }

  /**
   * Filters an array of available directions to move based on the location of walls on the board
   * @returns {Array} - returns an array of strings
   */
  filterDirections(options = ['left', 'right', 'up', 'down']) {
    const d = new Directions(this.board);
    const nextArray = options.map((x) => this.coordinates.check(x, 2, 2));
    return options.filter((dir, i) => (
      nextArray[i].every((tile) => isOpen(tile))
      && dir !== d[this.direction].reverse
    ));
  }

  /**
   * Decides which way a ghost should turn when reentering the box
   * @returns {boolean} - returns true if a direction was picked, and false if not
   */
  pickReenteringDir() {
    // figure out if ghost has hit the end on the y axis. if so pick left, right, or stay
    const { xS, yE } = ghostGateCoords(this.board);
    const { x: xG, y: yG } = this.position;
    if (xG === xS && yG >= yE) {
      // decide which way to turn based on whether another ghost is in that area
      let [leftOccupied, rightOccupied] = [false, false];

      ghosts.forEach(({ element: { id }, isInBox, position: { x: xPos } }) => {
        if (id !== this.element.id && isInBox && xPos > xS) {
          rightOccupied = true;
        } else if (id !== this.element.id && isInBox && xPos < xS) {
          leftOccupied = true;
        }
      });

      if (!rightOccupied || !leftOccupied) {
        this.startReshuffle(!rightOccupied ? 'right' : 'left');
      } else {
        this.endBoxEntry('up');
      }
      return true;
    }
    return false;
  }

  /**
   * Decides which way a ghost should turn
   * @returns {bool} - returns true if completed
   */
  pickDir(player) {
    const pacDir = player.direction;
    const {
      status: { mode },
      position: { x: currX, y: currY },
      coordinates: { row },
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
        this.endBoxEntry('left');
      } else {
        startEntry(this);
      }
    } else if (mode === 'reentering') {
      this.pickReenteringDir();
    } else if (mode === 'reshuffling') {
      // Determing if ghost has hit the edge of the box and, if so, stop
      const { leftPos, rightPos } = ghostGateCoords(this.board);
      const { x: xG } = this.position;
      if (this.direction === 'left' && xG <= leftPos) {
        this.endBoxEntry('right');
      } else if (this.direction === 'right' && xG >= rightPos) {
        this.endBoxEntry('left');
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
        coordinates,
        element: { id },
      } = this;
      const dirPreference = coordinates.resolveDirection(yDir, xDir);

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
    return true;
  }

  /**
   * Makes a ghost transparent except for its eyes
   * @returns {bool} - returns true if completed
   */
  disAppear() {
    this.setMode('returning');
    this.element.style.backgroundColor = 'transparent';
    const classes = ['fringe', 'eyeball', 'pupil', 'blue-frown', 'blue-pupil'];
    classes.forEach((type) => {
      Array.from(this.element.getElementsByClassName(type))
        .forEach((div) => {
          const { style } = div;
          style.display = div.style.display === 'none' ? '' : 'none';
        });
    });
    return true;
  }

  /**
   * Makes a ghost no longer transparent
   * @returns {bool} - returns true if completed
   */
  reAppear() {
    const { element, munchModeActive } = this;
    const color = munchModeActive ? 'blue' : this.color;
    const classes = ['eyeball', 'pupil', 'blue-frown', 'blue-pupil'];
    const display = munchModeActive ? ['none', 'none', '', ''] : ['', '', 'none', 'none'];

    this.element.style.backgroundColor = color;

    const fringes = this.element.getElementsByClassName('fringe');
    for (let i = 0; i < fringes.length; i += 1) {
      if (fringes.item(i).style.backgroundColor !== 'transparent') {
        fringes.item(i).style.backgroundColor = color;
      } else {
        fringes.item(i).style.backgroundImage = fringes.item(i).style.backgroundImage.replace(
          /blue|white/,
          color,
        );
      }
    }

    for (let i = 0; i < classes.length; i += 1) {
      [...element.getElementsByClassName(classes[i])].forEach((item) => {
        const { style } = item;
        style.display = display[i];
      });
    }

    return true;
  }

  /**
   * Initiates the spawn sequence for a ghost
   * @returns {bool} - returns true if completed
   */
  spawn(freeStatusOnSpawn) {
    // Change appearance back to normal
    this.setMode('spawning');
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
      item.setMode(freeStatusOnSpawn);
      item.reAppear();
    };

    this.blink(handleReappearance);
    return true;
  }

  /**
   * Changes the direction of a ghost's eyes
   * @returns {bool} - returns true if completed
   */
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
    return true;
  }

  /**
   * Sets the mode that the ghost is in
   * @returns {bool} - returns true if mode changed, false if not
   */
  setMode(val) {
    if (this.status.mode === val) {
      return false;
    }
    this.status.mode = val;
    return true;
  }

  /**
   * Toggles status.stop to the opposite value
   * @returns {bool} - returns the value of status.stop
   */
  toggleStop() {
    this.status.stop = !this.status.stop;
    return this.status.stop;
  }

  /**
   * Initiates the process of reentering the bo
   * @returns {bool} - returns true if completed
   */
  startEntry() {
    const { xS } = ghostGateCoords(this.board);
    this.setDirection('down');
    this.position.x = xS;
    this.element.style.left = `${xS}px`;
    this.setMode('reentering');
    document.getElementById('ghost-gate').style.backgroundColor = 'black';

    const { element: { id }, board: { ghostsInBox } } = this;
    if (ghostsInBox.includes(id) === false) {
      ghostsInBox.push(id);
    }

    setTimeout(() => {
      document.getElementById('ghost-gate').style.backgroundColor = '#e1e1fb';
    }, 500);
    return true;
  }

  /**
   * Initiates the reshuffling process
   * @returns {bool} - returns true if completed
   */
  startReshuffle(direction) {
    this.setDirection(direction);
    this.setMode('reshuffling');
    return true;
  }
}
