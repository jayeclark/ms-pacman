import { Element } from "./Element.js";

export class PacDot extends Element {
  constructor(position, big = false) {
    super();
    this.position = position;
    this.big = big;
    const {
      row,
      col,
      board: { pacDotW, tileW },
    } = position;

    const classNames = ["pac-dot", `pac-dot-${col}-${row}`];
    if (big) {
      classNames.push("big");
    }
    let dot = this.makeElement("div", classNames, this.makeStyle(big));
    dot.id = "dot-" + col + "-" + row;
    this.element = dot;
  }

  makeStyle(big) {
    let {
      row,
      col,
      board: { pacDotW, tileW },
    } = this.position;
    let style = {
      top: big ? ++row * tileW - pacDotW * 2 : ++row * tileW - pacDotW / 2,
      left: big ? ++col * tileW - pacDotW * 2 : ++col * tileW - pacDotW / 2,
    };
    if (big) {
      style.width = pacDotW * 4;
      style.height = pacDotW * 4;
      style.borderRadius = "50%";
    }
    return style;
  }
}
