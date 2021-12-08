import { Directions } from "./Directions.js";
import { Ghost, ghosts } from "./Ghost.js";
import {
  GhostBox,
  MessageDiv,
  Arrow,
  ArrowImg,
  ScoreDiv,
  ExtraLives,
} from "./Element.js";
import { RcPos } from "./RcPos.js";
import { Wall } from "./Wall.js";
import { Tile } from "./Tile.js";
import { PacDot } from "./PacDot.js";

export class Board {
  constructor(arr, speed) {
    this.layout = arr;
    this.rows = arr.length;
    this.cols = arr[0].length;
    this.speed = speed;
    this.tileW = Math.min(this.rowHeight, this.colHeight);
    this.portals = this.portalPositions;
    this.ghostContainer = this.calculateGhostContainer();
    this.ghostsInBox = [];
    this.adjustStyleSheet(document.getElementById("header-style-sheet"));
  }

  get fringeW() {
    return Math.floor((this.tileW * 1.5) / 12);
  }

  get cornerW() {
    return this.tileW / 2;
  }

  get pacDotW() {
    return Math.floor(this.tileW / 9) * 2;
  }

  get pacWidth() {
    return this.tileW * 1.5;
  }

  get boardWidth() {
    return this.tileW * this.cols;
  }

  get boardHeight() {
    return this.tileW * this.rows;
  }

  get rowHeight() {
    return (
      Math.floor((+window.innerHeight - 40) / ((this.rows + 3) * this.speed)) *
      this.speed
    );
  }

  get colHeight() {
    return (
      Math.floor((+window.innerWidth - 40) / (this.cols * this.speed)) *
      this.speed
    );
  }

  get portalPositions() {
    return this.layout
      .map((cols, row) =>
        cols.startsWith("-") || cols.endsWith("-") ? row : null
      )
      .filter((x) => x);
  }

  adjustStyleSheet(styleSheet) {
    const { tileW: t, cornerW: c, pacDotW: p, fringeW: f } = this;
    const [black, side] = [
      "rgba(0,0,0,0)",
      Math.floor(((f * 3) ** 2 / 2) ** 0.5),
    ];
    let innerHTML = "";
    innerHTML += `.wall {height: ${t + 1}; width: ${t + 1}}`;
    innerHTML += `.inner-corner {height: ${t / 2}; width: ${t / 2}}`;

    let radial = `radial-gradient(circle ${c}px at POSITION, ${black} 0%, `;
    radial += `${black} ${c - 3}px, #e33022 ${c - 3}px,`;
    radial += `#e33022 100%, #f4bb9c 100%)`;

    let positions = {
      "top-left": "right 100% bottom 100%",
      "top-right": "left 100% bottom 100%",
      "bottom-left": "right 100% top 100%",
      "bottom-right": "left 100% top 100%",
    };

    for (let dir in positions) {
      innerHTML += `.inner-${dir} {background-image: ${radial.replace(
        "POSITION",
        positions[dir]
      )}}`;
    }

    innerHTML += `.pac-dot {width: ${p}px;height: ${p}px}`;
    innerHTML += `.ms-pac-man {width: ${t * 1.5};margin: ${Math.floor(
      (t * 0.5) / 2
    )}px}`;
    innerHTML += `.ghost {width: ${t * 1.5}px; height: ${
      t * 1.5 - f * 2
    }px; margin: ${t / 4}px}`;
    innerHTML += `.fringe {width: ${f * 2}px; height: ${f * 2}px; top: ${
      t * 1.75 - f * 4
    }px}`;
    innerHTML += `.eyeball {width: ${f * 3}px;height:${f * 4}px}`;
    innerHTML += `.pupil {width: ${f * 2}px;height:${f * 2}px}`;
    innerHTML += `.blue-pupil {width: ${f * 2}px;height: ${f * 2}px; top: ${
      t / 6 + f * 2
    }px}`;
    innerHTML += `.blue-frown {width: ${side}px; height: ${side}px; top: ${
      t / 6 + f * 6
    }px}`;
    styleSheet.innerHTML = innerHTML;
  }

  addToGame(dots) {
    // Add the basic board elements
    this.layout.forEach((cols, row) => {
      for (let col = 0; col < cols.length; col++) {
        const [pos, char, { cornerTypesAt }] = [
          new RcPos({ row, col, board: this }),
          cols.charAt(col),
          Tile,
        ];
        if (char === "X") {
          new Wall(pos).addTo("game"); /* Add a wall */
        } else if (
          char.match(/[^GSP]/) &&
          cornerTypesAt(pos).bottomRight === "outer"
        ) {
          // Add a pacDot
          const [current, right, below] = [
            Tile.at(pos),
            Tile.at(pos.right),
            Tile.at(pos.down),
          ];
          if (
            current.match(/[^P]/) &&
            right.match(/[^SP]/) &&
            below.match(/[^S]/)
          ) {
            new PacDot(pos, current === "B").addTo("game");
            dots.dotCount++;
          }
        }
      }
    });

    // Add the ghost box
    new GhostBox(this).addTo("game");

    // Add the message divs
    const {
      tileW,
      boardWidth: width,
      boardHeight,
      ghostContainer: { start, end },
    } = this;
    const [top, height] = [start.y, end.y - start.y + "px"];
    let msgs = [
      [
        { fontSize: "2rem", top, width, height },
        "ready",
        '<div class="message-inner"><br><br><br><br>READY!</div>',
      ],
      [
        { fontSize: "3rem", display: "none", top, width, height },
        "game-over",
        `<div class="message-inner message-inner-shadow">GAME&nbsp;OVER!</div>`,
      ],
      [
        { fontSize: "3.5rem", display: "none", top, width, height },
        "winner",
        `<div class="message-inner message-inner-shadow">WINNER!!</div>`,
      ],
    ];
    msgs.forEach((msg) => new MessageDiv(...msg).addTo("game"));

    // Add the ghosts
    const inky = new RcPos({ row: 11, col: 14, board: this });
    const blinky = new RcPos({ row: 14, col: 12, board: this });
    const pinky = new RcPos({ row: 14, col: 14, board: this });
    const clyde = new RcPos({ row: 14, col: 16, board: this });
    new Ghost(inky, "left", "red", "inky", "free").addTo("game");
    new Ghost(blinky, "up", "aqua", "blinky", "notfree").addTo("game");
    new Ghost(pinky, "down", "plum", "pinky", "notfree").addTo("game");
    new Ghost(clyde, "right", "orange", "clyde", "notfree").addTo("game");

    // if there are ghosts in the box from a prior run, remove them
    if (this.ghostsInBox.length > 0) {
      this.ghostsInBox.splice(0, this.ghostsInBox.length - 1);
    }
    this.ghostsInBox.push(
      ...ghosts.filter((g) => g.boxPosition !== "none").map((g) => g.element.id)
    );

    // Make arrow divs and put them below the main game
    const arrowAreaStyle = {
      top: boardHeight + tileW * 2 + "px",
      width: width + "px",
    };
    new Arrow("arrow-div", arrowAreaStyle, "arrow-div-area").addTo("game");

    const arrowH = Math.floor(
      (window.innerHeight - parseInt(boardHeight) - 130) / 4
    );
    const positions = {
      up: parseInt(width) / 2 - arrowH,
      down: parseInt(width) / 2 - arrowH,
      left: parseInt(width) / 2 - arrowH * 2.75,
      right: parseInt(width) / 2 + arrowH * 0.75,
    };
    const rotate = {
      up: "180deg",
      down: "0deg",
      left: "90deg",
      right: "-90deg",
    };

    for (let dir in positions) {
      const arrowStyle = {
        left: positions[dir] + "px",
        top: arrowH + new Directions(this)[dir].row * 1.75 * arrowH + "px",
      };
      new Arrow("arrow", arrowStyle, dir + "-arrow").addTo("arrow-div-area");
      const imgStyle = {
        width: arrowH * 2,
        height: arrowH,
        transform: `rotate(${rotate[dir]})`,
      };
      new ArrowImg("./images/arrow.png", "arrow-img", imgStyle).addTo(
        dir + "-arrow"
      );
    }

    // Add extra lives
    new ExtraLives(this).addTo("game");
  }

  calculateGhostContainer() {
    let [{ tileW, layout }, start, end] = [this, null, null];

    layout.forEach((cols, row) => {
      if (cols.includes("G") && !start) {
        start = { y: row * tileW, x: cols.indexOf("G") * tileW };
      } else if (
        cols.includes("G") &&
        layout[row + 1].includes("G") === false
      ) {
        end = { y: (row + 1) * tileW, x: (cols.lastIndexOf("G") + 1) * tileW };
      }
    });

    const gateStart = { x: (start.x + end.x - tileW * 3) / 2, y: start.y };
    const gateEnd = {
      x: (start.x + end.x + tileW * 3) / 2,
      y: start.y + tileW,
    };

    return { start, end, gateStart, gateEnd };
  }

  scoreDivAdd({ x, y }) {
    const style = {
      width: this.tileW * 2,
      height: this.tileW * 2,
      left: x,
      top: y,
    };
    const ghostScore = new ScoreDiv(
      "ghost-score",
      style,
      "ghost-score-div",
      "200"
    );
    ghostScore.addTo("game");
    setTimeout(function () {
      document.getElementById("game").removeChild(ghostScore.element);
    }, 1500);
  }
}
