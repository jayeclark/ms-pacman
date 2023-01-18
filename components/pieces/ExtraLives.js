/* eslint-disable import/extensions */
import Element from '../board/Element.js';

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
    this.element = this.makeElement({
      tag: 'div',
      classNames: 'extra-life-area',
      style: containerStyle,
    });
    this.element.innerHTML = '<div class="extra-lives">Lives: </div>';
    const style = { width: tileW * 1.5, height: tileW * 1.5, margin: '5px' };
    [1, 2, 3].forEach((number) => {
      const childElement = this.makeElement({
        tag: 'img',
        classNames: 'extra-life',
        style,
        id: `extra-${number}`,
      });
      childElement.src = './images/mspacman1.png';
      this.element.appendChild(childElement);
    });
  }
}
