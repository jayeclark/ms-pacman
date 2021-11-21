import { GamePiece } from './GamePiece.js';

export class MsPacMan extends GamePiece {

  constructor(position, startingDirection) {
    super(position, startingDirection);
    this.cache = '';
  
    // Add image
    let game = document.getElementById('game');
    const { position: { x, y }, rcPos: { board : { tileW } } } = this; 
    let style = { left: x - tileW / 2, top: y }
    let msPacMan = this.makeElement('img','ms-pac-man', style);
    msPacMan.id = 'mspacman';
    msPacMan.src = './images/mspacman1.png';

    game.appendChild(msPacMan);
    this.element = msPacMan;
  }
}