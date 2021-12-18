/* eslint-disable import/extensions */
import Element from './Element.js';

export default class ExtraLives extends Element {
  constructor(board) {
    super();
    const { boardHeight, tileW } = board;
    const containerStyle = {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'flex-start',
      position: 'absolute',
      top: boardHeight + 10,
    };
    this.element = this.makeElement('div', 'extra-life-area', containerStyle);
    this.element.innerHTML = '<div class="extra-lives">Lives: </div>';
    const style = { width: tileW * 1.5, height: tileW * 1.5, margin: '5px' };
    const extraLife1 = this.makeElement('img', 'extra-life', style, 'extra-1');
    const extraLife2 = this.makeElement('img', 'extra-life', style, 'extra-2');
    const extraLife3 = this.makeElement('img', 'extra-life', style, 'extra-3');
    extraLife1.src = './images/mspacman1.png';
    extraLife2.src = './images/mspacman1.png';
    extraLife3.src = './images/mspacman1.png';
    this.element.appendChild(extraLife1);
    this.element.appendChild(extraLife2);
    this.element.appendChild(extraLife3);
  }
}
