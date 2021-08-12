// Check if the free ghost can move, and move him closer to pacman if so
function checkGhostMovesOld(item) {

    let targPos;
  
    if (item.free === 'free') {
      targPos = msPacMan.rcPos;
      targPos.x = msPacMan.position.x;
      targPos.y = msPacMan.position.y;
    }

    // only do the calculations if the ghost has hit a tile square-on
    if (item.position.x % cellW === 0 && item.position.y % cellW === 0) {
  
      let dirs = ['left','right','up','down'];
  
      // remove reversing direction as an option
      let rev = d[item.direction].reverse;
  
      dirs.splice(dirs.indexOf(rev),1);
  
      // filter out any directions that have walls
      dirs = dirs.filter(dir => isWall(nextPos(item.rcPos,dir),dir) === false)
  
      if (dirs.length === 1) {
        if (item.direction != dirs[0]) {ghostEyes(item.el,dirs[0])};
        item.direction = dirs[0]; 
        item.speed = d[dirs[0]].speed;
      }
      else {
  
        newDir = '';
        // find target position relative to item
        let targRowDir = targPos.y > item.position.y ? 'down' : targPos.y < item.position.y ? 'up' : 'same'
        let targColDir = targPos.x > item.position.x ? 'right' : targPos.x < item.position.x ? 'left' : 'same'
  
        // if the item is in a portal row, see if it would be better to go through the portal
        if (portals.includes(item.rcPos.row)) {
          let optA = Math.abs(targPos.col - item.rcPos.col);
          let optB = Math.min(targPos.col, (board[0].length - targPos.col));
          optB += Math.min(item.rcPos.col,(board[0].length - item.rcPos.col));
  
          if (optB < optA && targColDir !== 'same') { targColDir = d[targColDir].reverse; }
        }
  
        // if both directions are available, pick the one with the longest run 
  
        if (dirs.includes(targRowDir) && dirs.includes(targColDir)) {
  
          let checkRun = (pos,dir) => {
            let hitWall = false;
            let tempPos = pos;
            let runCount = 0;
            while (hitWall == false) {
              if (board[tempPos.row].charAt(tempPos.col) === 'X' || board[tempPos.row].charAt(tempPos.col) === 'G' ) {
                hitWall = true;
              }
              else {runCount++; tempPos.row += d[dir].row; tempPos.col += d[dir].col;}
            }
            return runCount;
          }
  
          if (checkRun(item.rcPos,targRowDir) > checkRun(item.rcPos,targColDir)) {
            newDir = targRowDir;
          }
          else if (checkRun(item.rcPos,targRowDir) < checkRun(item.rcPos,targColDir)) {
            newDir = targColDir;
          }
          // if both runs are equal, pick at random
          else if (Math.random() < 0.5) {newDir = targRowDir} else {newDir = targColDir}
  
        }
        else if (dirs.includes(targRowDir)) {newDir = targRowDir}
        else if (dirs.includes(targColDir)) {newDir = targColDir}
        else if (dirs.includes(item.direction)) {newDir = item.direction}
        else {
          let index = Math.floor(Math.random() * dirs.length);
          newDir = dirs[index];
        }
  
        if (item.direction != newDir) {ghostEyes(item.el,newDir)};
        item.direction = newDir;
        item.speed = d[newDir].speed;
  
      }
      teleport(item);
  
    }
  
  }