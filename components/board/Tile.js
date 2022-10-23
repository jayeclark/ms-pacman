/* eslint-disable import/extensions */
import { isHall, isWall, isBetween } from '../../utilities/helpers.js';

export default class Tile {
  static adjacentTiles(position) {
    return {
      top: Tile.at(position.top),
      topRight: Tile.at(position.top.right),
      right: Tile.at(position.right),
      bottomRight: Tile.at(position.bottom.right),
      bottom: Tile.at(position.bottom),
      bottomLeft: Tile.at(position.bottom.left),
      left: Tile.at(position.left),
      topLeft: Tile.at(position.top.left),
    };
  }

  static at(position) {
    if (!position) {
      throw Error('Position: Coordinates position is required!');
    }
    const {
      row,
      col,
      board: { rows, cols, layout },
    } = position;
    return isBetween(row, [0, rows - 1]) && isBetween(col, [0, cols - 1])
      ? layout[row].charAt(col)
      : 'E';
  }

  static cornerTypesAt(position) {
    const cornerTypes = {
      topLeft: '',
      topRight: '',
      bottomLeft: '',
      bottomRight: '',
    };
    const [cornerTypeOf, { typeOf }, tile] = [cornerTypes, Tile, Tile.adjacentTiles(position)];

    Object.keys(cornerTypes).forEach((thisCorner) => {
      const [inYDirection, inXDirection] = thisCorner.split(/(?=[LR])/).map((x) => x.toLowerCase());
      if (isHall(typeOf(tile[thisCorner]))) {
        if (isHall(typeOf(tile[inYDirection])) && isHall(typeOf(tile[inXDirection]))) {
          cornerTypeOf[thisCorner] = 'outer';
        } else if (isWall(typeOf(tile[inYDirection])) && isWall(typeOf(tile[inXDirection]))) {
          cornerTypeOf[thisCorner] = 'inner';
        }
      } else {
        cornerTypeOf[thisCorner] = 'none';
      }
    });

    return cornerTypes;
  }

  static typeOf(tile) {
    return /[-SPGBX]/.test(tile)
      ? tile
        .replace(/[-SPB]/, 'hall')
        .replace('X', 'wall')
        .replace('G', 'ghostbox')
      : 'off-board';
  }
}
