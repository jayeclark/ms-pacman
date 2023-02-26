/* eslint-disable import/extensions */
import GamePiece from './GamePiece.js';

export default class MsPacMan extends GamePiece {
  constructor(position, startingDirection) {
    super(position, startingDirection);
    this.cache = '';

    // Add image
    const {
      position: { x, y },
      coordinates: {
        board: { tileW },
      },
    } = this;
    const style = { left: x - tileW / 2, top: y };

    this.element = this.makeElement({
      tag: 'img',
      classNames: 'ms-pac-man',
      style,
      id: 'mspacman',
    });
    this.element.src = './images/mspacman1.png';
    this.addTo('game');
  }
}
