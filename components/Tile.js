export class Tile {
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
    let {
      row,
      col,
      board: { rows, cols, layout },
    } = position;
    return row.isBetween(0, rows - 1) && col.isBetween(0, cols - 1)
      ? layout[row].charAt(col)
      : "E";
  }

  static cornerTypesAt(position) {
    let cornerTypes = {
      topLeft: "",
      topRight: "",
      bottomLeft: "",
      bottomRight: "",
    };
    let [cornerTypeOf, { typeOf }, tile] = [
      cornerTypes,
      Tile,
      Tile.adjacentTiles(position),
    ];

    for (let thisCorner in cornerTypes) {
      const [inYDirection, inXDirection] = thisCorner
        .split(/(?=[LR])/)
        .map((x) => x.toLowerCase());
      if (typeOf(tile[thisCorner]).isHall()) {
        if (
          typeOf(tile[inYDirection]).isHall() &&
          typeOf(tile[inXDirection]).isHall()
        ) {
          cornerTypeOf[thisCorner] = "outer";
        } else if (
          typeOf(tile[inYDirection]).isWall() &&
          typeOf(tile[inXDirection]).isWall()
        ) {
          cornerTypeOf[thisCorner] = "inner";
        }
      } else {
        cornerTypeOf[thisCorner] = "none";
      }
    }
    return cornerTypes;
  }

  static typeOf(tile) {
    return /[\-SPGBX]/.test(tile)
      ? tile
          .replace(/[\-SPB]/, "hall")
          .replace("X", "wall")
          .replace("G", "ghostbox")
      : "off-board";
  }
}
