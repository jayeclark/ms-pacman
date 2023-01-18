/* eslint-disable import/extensions */
import Element from './Element.js';

export default class GhostBox extends Element {
  constructor(board) {
    super();
    this.board = board;
    this.element = this.makeElement({
      tag: 'div',
      classNames: 'outer-ghostbox',
      style: this.makeStyle(),
      id: 'outer-ghost-box',
    });
    this.addInner();
    this.addGate();
  }

  get tileW() {
    return this.board.tileW;
  }

  makeStyle() {
    const {
      ghostContainer: { start, end },
    } = this.board;

    return {
      top: start.y,
      left: start.x,
      height: `${end.y - start.y}px`,
      width: `${end.x - start.x}px`,
    };
  }

  addInner() {
    const innerStyle = {
      top: `${this.tileW / 3 - 3}px`,
      left: `${this.tileW / 3 - 3}px`,
      height: `${(this.tileW * 10) / 3}px`,
      width: `${(this.tileW * 19) / 3}px`,
    };
    const inner = this.makeElement({
      tag: 'div',
      classNames: 'inner-ghostbox',
      style: innerStyle,
      id: 'inner-ghostbox',
    });
    this.element.appendChild(inner);
  }

  addGate() {
    const gateStyle = {
      left: `${(this.tileW * 9) / 4}px`,
      height: `${this.tileW / 3 + 3}px`,
      width: `${this.tileW * 2 + 3}px`,
    };
    const gate = this.makeElement({
      tag: 'div',
      classNames: 'door',
      style: gateStyle,
      id: 'ghost-gate',
    });
    this.element.appendChild(gate);
  }
}
