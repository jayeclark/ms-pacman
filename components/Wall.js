import Element from "./Element.js";
import Tile from "./Tile.js";
import { camelCase } from "../utilities/lib.js";

let [ref, game] = [0, document.getElementById("game")];

export default class Wall extends Element {
  constructor(position) {
    super();
    this.position = position;
    this.element = this.makeElement("div", "wall", this.makeStyle(position));
    this.ref = ref++;
    this.innerCorners = this.addInnerCorners(position);
  }

  get top() {
    return this.position.row * this.position.board.tileW;
  }

  get left() {
    return this.position.col * this.position.board.tileW;
  }

  makeStyle(position) {
    const [
      {
        board: { tileW },
      },
      { typeOf, cornerTypesAt },
    ] = [position, Tile];
    const style = {
      top: this.top,
      left: this.left,
      width: tileW + 1 + "px",
      height: tileW + 1 + "px",
    };

    // Add outer corners
    const outerCorners = Object.entries(cornerTypesAt(position)).filter(
      ([__, v]) => v === "outer"
    );
    outerCorners.forEach(([k, __]) => {
      style[camelCase(`border-${k}-radius`)] = tileW / 2 + "px";
    });

    // Remove unneeded borders
    for (let adjacent of ["top", "bottom", "left", "right"]) {
      if (typeOf(Tile.at(position[adjacent])) !== "hall") {
        style[camelCase(`border-${adjacent}`)] = "none";
      }
    }
    return style;
  }

  addInnerCorners(position) {
    const [{ cornerTypesAt }, { tileW }] = [Tile, position.board];
    const innerCorners = Object.entries(cornerTypesAt(position)).filter(
      ([__, v]) => v === "inner"
    );
    for (let [location, __] of innerCorners) {
      const [yDirection, xDirection] = location
        .split(/(?=[LR])/)
        .map((x) => x.toLowerCase());
      const style = {
        margin: "-1px",
        top:
          yDirection === "top"
            ? this.top - tileW / 2 + 3 + "px"
            : this.top + tileW - 2 + "px",
        left:
          xDirection === "left"
            ? this.left - tileW / 2 + 3 + "px"
            : this.left + tileW - 2 + "px",
      };
      const innerCorner = this.makeElement(
        "div",
        ["inner-corner", `inner-${yDirection}-${xDirection}`],
        style
      );
      game.appendChild(innerCorner);
    }
  }
}
