/* eslint-disable import/extensions */
import Element from './Element.js';

export default class PacDot extends Element {
  constructor(position, big = false) {
    super();
    this.position = position;
    this.big = big;
    const {
      row,
      col,
    } = position;

    const classNames = ['pac-dot', `pac-dot-${col}-${row}`];
    if (big) {
      classNames.push('big');
    }
    const dot = this.makeElement('div', classNames, this.makeStyle(big));
    dot.id = `dot-${col}-${row}`;
    this.element = dot;
  }

  makeStyle(big) {
    const { row, col } = this.position;
    const { board: { pacDotW, tileW } } = this.position;

    const style = {
      top: big ? (row + 1) * tileW - pacDotW * 2 : (row + 1) * tileW - pacDotW / 2,
      left: big ? (col + 1) * tileW - pacDotW * 2 : (col + 1) * tileW - pacDotW / 2,
    };
    if (big) {
      style.width = pacDotW * 4;
      style.height = pacDotW * 4;
      style.borderRadius = '50%';
    }
    return style;
  }
}
