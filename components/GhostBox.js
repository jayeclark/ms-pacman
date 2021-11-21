import { Element } from './Element.js';

export class GhostBox extends Element {

  constructor(board) {
  
    super();
    this.board = board;
    this.element = this.makeElement('div', 'outer-ghostbox', this.makeStyle());
    this.addInner();
    this.addGate();
  }

  get tileW() { return this.board.tileW; }

  makeStyle() {
    const { ghostContainer: { start , end } } = this.board;

    return {top: start.y, 
            left: start.x,
            height: (end.y - start.y) + 'px',
            width: (end.x - start.x) + 'px'};

  }

  addInner() {
    const innerStyle = {top: this.tileW / 3 - 3,
                        left: this.tileW / 3 - 3,
                        height: this.tileW * 10 / 3,
                        width: this.tileW * 19 / 3 };
    const inner = this.makeElement('div', 'inner-ghostbox', innerStyle, 'inner-ghostbox');
    this.element.appendChild(inner);
  }

  addGate() {
    const gateStyle = { left: this.tileW * 9 / 4,
                        height: this.tileW / 3 + 3,
                        width: this.tileW * 2 + 3};
    const gate = this.makeElement('div', 'door', gateStyle, 'ghost-gate');
    this.element.appendChild(gate);
  }

}

export class MessageDiv extends Element {

  constructor({style, id, innerHTML}) {
    super();
    this.element = this.makeElement('div', 'message', style, id);
    this.element.innerHTML = innerHTML;
  }

}