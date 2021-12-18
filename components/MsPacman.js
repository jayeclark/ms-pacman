import GamePiece from "./GamePiece.js";

export default class MsPacMan extends GamePiece {
  constructor(position, startingDirection) {
    super(position, startingDirection);
    this.cache = "";

    // Add image
    const {
      position: { x, y },
      rcPos: {
        board: { tileW },
      },
    } = this;
    let style = { left: x - tileW / 2, top: y };
    this.element = this.makeElement("img", "ms-pac-man", style, "mspacman");
    this.element.src = "./images/mspacman1.png";
    this.addTo("game");
  }
}
