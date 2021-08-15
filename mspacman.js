let count = 0;
let gCount = 0;
let dCount = 0;
let powerCount = 0;
let eatenCount = 0;
let munchModeActive = false;
let stop = false;
let started = false;
let restarted = false;
let restartGhosts = false;
let restartRelease = false;
let score = 0;

// Deprioritize a button after it has been clicked
const buttonSwap = () => {

  let start = document.getElementById('start');
  if (start.style.display.includes('none')) { start.style.display = ''; } 
  else { start.style.display = 'none'; }

  let stop = document.getElementById('stop');
  if (stop.style.display.includes('none')) { stop.style.display = ''; } 
  else { stop.style.display = 'none'; }
}

function startGame() {

  if (stop === false && started === false) {
    
    restarted = false;
    update();
    setTimeout(updateGhosts,1000);
    setTimeout(function() {restartRelease = false; release(board2);},7000)

    started = true;
    let readyDiv = document.getElementById('ready');
    readyDiv.style.display = 'none';

  }
  else {
    stop = !stop;
  }

  buttonSwap(`start`);

}

function restartGame() {

  started = false;
  stop = false;
  restarted = true;
  restartRelease = true;
  restartGhosts = false;
  
  // erase board, ghosts, and msPacMan
  const oldGame = document.getElementById('game');

  while (oldGame.firstChild) {
    oldGame.removeChild(oldGame.lastChild);
  }

  const oldScore = document.getElementById('score');
  oldScore.innerHTML = 0;
  score = 0;

  const msPacKeys = Object.keys(msPacMan);
  msPacKeys.forEach(key=> {
    delete msPacMan[key];
  })

  ghosts.splice(0,ghosts.length);

  function redraw() {
    drawBoardNew(board2);
    msPacMan = new MsPacMan(board2);
  }
  
  setTimeout(redraw,500);


  let restart = document.getElementById('restart');
  restart.style.display = 'none';

  let start = document.getElementById('start');
  start.style.display = ''; 

}

function cache(dir) {
  msPacMan.cache = dir;
  let el = dir + '-arrow';
  let arrow = document.getElementById(el);
  arrow.style.opacity = '60%';
  arrow.style.transform = 'translate(0px, 2px)';
  let unclick = () => {
    arrow.style.opacity = '';
    arrow.style.transform = '';
  }
  setTimeout(unclick,100);
}

// Update the position of Ms PacMan
function update(board=board2) {

  if (restarted === true) {return false;}
  count++;
  dCount++;

  if (stop === false) {

    document.onkeydown = checkKey;

    function checkKey(e) {
    
        e = e || window.event;
        if (e.keyCode == '38' || e.keyCode == '87') { msPacMan.cache = 'up'; } 
        else if (e.keyCode == '40' || e.keyCode == '83') { msPacMan.cache = 'down'; } 
        else if (e.keyCode == '37' || e.keyCode == '65') { msPacMan.cache = 'left'; } 
        else if (e.keyCode == '39' || e.keyCode == '68') { msPacMan.cache = 'right'; }
    
    }
  
    checkGhostCollision();

    if (msPacMan.speed !== 0 || msPacMan.cache !== '') {
  
      checkCollisions(msPacMan);

      checkDots(msPacMan);
  
      if (msPacMan.direction === 'left' || msPacMan.direction === 'right' ) {
          msPacMan.position.x += msPacMan.speed;
          msPacMan.el.style.left = msPacMan.position.x;
      } else if (msPacMan.direction === 'up' || msPacMan.direction === 'down' ){
          msPacMan.position.y += msPacMan.speed;
          msPacMan.el.style.top = msPacMan.position.y;
      }
  
      msPacMan.rcPos.row = Math.floor(msPacMan.position.y / board.tileW);
      msPacMan.rcPos.col = Math.floor(msPacMan.position.x / board.tileW);
    }

  }

  if (count === 3) {
      msPacMan.el.src = msPacMan.el.src.includes('mspacman1.png') ? 
                        './images/mspacman2.png' : './images/mspacman1.png'  
      count = 0;
    }

  if (dCount === 9) {
    let bigDots = Array.from(document.getElementsByClassName('big'));
    bigDots.forEach(dot=>{
      if (dot.style.display === '') {dot.style.display = 'none';} else {dot.style.display = '';}
    })
    dCount = 0;
  }

  setTimeout(update, 50);

}

// Update the position of free ghosts
function updateGhosts() {

  if (restarted === true && restartGhosts === false) {return false;}

  // correct starting position if applicable

  ghosts.forEach(ghost=> {
    if (ghost.free === 'free') {
      if (ghost.position.x % ghost.speed > 0) {
        ghost.position.x = ghost.position.x + ghost.position.x % ghost.speed;
        ghost.el.style.left = ghost.position.x;
      }
      if (ghost.position.y % ghost.speed > 0) {
        ghost.position.y = ghost.position.y + ghost.position.y % ghost.speed;
        ghost.el.style.top = ghost.position.y;
      }
    }
  })

  if (stop === false) {

    for (let ghost of ghosts) {

      if(ghost.free === 'free' || ghost.free === 'returning') {
        // check if the ghost can change directions
        ghost.pickDir();
        ghost.move(ghost.direction);
      }
    }
  }
  setTimeout(updateGhosts, 50);
}

function checkDots(item) {
  // find all dots in the current cell
  let classCode = 'dot-'+item.rcPos.col + '-' + item.rcPos.row;
  let next = nextPos(item.rcPos,item.direction);
  let classCode2 = 'dot-'+ next.col + '-' + next.row;
 
  if (item.direction === 'right') {classCode2 = 'pac-dot-' + (next.col + 1) + '-' + next.row;}
  if (item.direction === 'down') {classCode2 = 'pac-dot-' + next.col + '-' + (next.row + 1);}

  let dots = [document.getElementById(classCode),document.getElementById(classCode2)].filter(x => x !== null);

  // check if any are in the mouth
  for (let i = 0; i < dots.length; i++) {

    const dot = dots[i];
    let {tileW, pacDotW, pacWidth} = board2; 
    if (dot.classList.contains('big')) {pacDotW = parseInt(dot.style.width);} 

    let dotLeft = parseInt(dot.style.left);
    let dotRight = dotLeft + pacDotW;
    let dotTop = parseInt(dot.style.top);
    let dotBottom = dotTop + pacDotW;
    let itemLeft = parseInt(item.el.style.left);
    let itemTop = parseInt(item.el.style.top);


    let leftBoundary = itemLeft + tileW - pacWidth / 2;
    let rightBoundary = leftBoundary + pacWidth;
    let topBoundary = itemTop + tileW - pacWidth / 2;
    let bottomBoundary = topBoundary + pacWidth;

    function removeDot(id) {
      let dotToRemove = document.getElementById(id);
      let game = document.getElementById('game');
      let removedDot = game.removeChild(dotToRemove);
      if (removedDot !== '') {
        if (removedDot.classList.contains('big')) {
          score += 50;
          if (munchModeActive === true) {powerCount = 0;} else {munchMode();}
        }
        else {score += 10;}
        let scoreDiv = document.getElementById('score');
        scoreDiv.innerHTML = score;
      }
    }

    if (dotLeft > leftBoundary && dotRight < rightBoundary && dotTop > topBoundary && dotBottom < bottomBoundary) {
      removeDot(dot.id); eatenCount++;
      if (eatenCount === dotCount) {

            // stop movement
            stop = true;

            // disappear ghosts
            ghosts.forEach(ghost => {
              if (ghost.free === 'free') {
                ghost.el.style.display = 'none';
              }
            })

            // appear 'winner'
            let win = document.getElementById('winner');
            win.style.display = '';

            // change button to 'restart'
            let stopButton = document.getElementById('stop');
            stopButton.style.display = 'none';

            let restart = document.getElementById('restart');
            restart.style.display = '';

      }
    }

  }

}

function checkGhostCollision() {

  // if collided with a ghost, end game
 
  let collidedGhosts = [];

  //const style = window.getComputedStyle(msPacMan.el)
  const {left, margin, top, width} = window.getComputedStyle(msPacMan.el);

  let pacL = parseInt(left) + parseInt(margin);
  let pacR = parseInt(left) + parseInt(margin) + parseInt(width);
  let pacT = parseInt(top) + parseInt(margin);
  let pacB = parseInt(top) + parseInt(margin) + parseInt(width);
  let pacDir = msPacMan.direction;

  ghosts.forEach(ghost => {

    let ghostCollision = false;
    if (ghost.free === 'free') {

      const {margin: gMargin, left: gLeft, top: gTop, width: gWidth, height: gHeight} = window.getComputedStyle(ghost.el);

      const ghostL = parseFloat(gLeft) + parseFloat(gMargin);
      const ghostR = parseFloat(gLeft) + parseFloat(gMargin) + parseFloat(gWidth);
      const ghostT = parseFloat(gTop) + parseFloat(gMargin);
      const ghostB = parseFloat(gTop) + parseFloat(gMargin) + parseFloat(gHeight);
      const ghostCx = (ghostL + ghostR) / 2;
      const ghostCy = (ghostT + ghostB) / 2;

      if ((ghostR >= pacL && ghostR <= pacR) || (ghostL <= pacR && ghostL >= pacL)) {
        if (ghostCy <= pacB && ghostCy >= pacT) {ghostCollision = true;}
        else if (ghostT <= pacB && ghostT >= pacT) { ghostCollision = true; } 
        else if (ghostB >= pacT && ghostB <= pacB) { ghostCollision = true; }
      }
      else if ((ghostB >= pacT && ghostB <= pacB) || (ghostT <= pacB && ghostT >= pacT)) {
        if (ghostCx <= pacR && ghostCx >= pacL) {ghostCollision = true;}
        else if (ghostL <= pacR && ghostL >= pacL) { ghostCollision = true; } 
        else if (ghostR >= pacL && ghostR <= pacR) { ghostCollision = true; }
      }

      if (ghostCollision === true) {
        collidedGhosts.push(ghost.el.id); 
      }
    }

  })

  if (collidedGhosts.length > 0 && powerCount === 0) {
    
    // stop movement
    stop = true;
    eatenCount = 0;
    dotCount = 0;

    // disappear msPacMan
    msPacMan.el.style.display = 'none';

    // appear 'game over'
    let over = document.getElementById('game-over');
    over.style.display = '';

    // change button to 'restart'
    let stopButton = document.getElementById('stop');
    stopButton.style.display = 'none';

    let restart = document.getElementById('restart');
    restart.style.display = '';

  }
  else if (collidedGhosts.length > 0 && powerCount > 0) {

    collidedGhosts.forEach(id=>{
      let ghostEl = document.getElementById(id);
      const {margin: gMargin, left: gLeft, top: gTop, width: gWidth, height: gHeight} = window.getComputedStyle(ghostEl);

      let ghostL = parseFloat(gLeft) + parseFloat(gMargin);
      let ghostT = parseFloat(gTop) + parseFloat(gMargin);
      let ghostEaten = false;

      if ((ghostL <= pacL && pacDir === 'left') || (ghostL >= pacL && pacDir === 'right') ||
          (ghostT <= pacT && pacDir === 'up') || (ghostT >= pacT && pacDir === 'down')) {
            ghosts.forEach(x => {
              if (x.el.id === id && x.free === 'free') ghostEaten = true
            })
      }

      if (ghostEaten === true) { 

        ghosts.forEach(x => {

          if (x.el.id === id && x.free === 'free') {

            x.free = 'returning';
            x.el.style.backgroundColor = 'transparent';

            const divs = [];
            const classTypes = ['fringe','eyeball','pupil','blue-frown','blue-pupil'];
            classTypes.forEach(classtype => divs.push(...Array.from(x.el.getElementsByClassName(classtype))));
            divs.forEach(div => toggleDisplay(div));

            scoreDivAdd({'x': x.el.style.left, 'y':x.el.style.top});
            score += 200;
            document.getElementById('score').innerHTML = score;

          }
        })

      }

    })

  }

}

function toggleDisplay(item) {
  if (item.style.display === 'none') {item.style.display = ''} else {item.style.display = 'none'}
}

// Check prosimity to edges and reverse direction and image if needed
function checkCollisions(item) {

  if (item.cache !== '') {

    // figure out the next position based on the desired direction
    let next = nextPos(item.rcPos,item.cache);

    // if there is no wall there, AND the item is at a transition point, change the direction and speed and clear the cache
    let canTurn = false;
    if (findXY(item.rcPos).x === item.position.x && findXY(item.rcPos).y === item.position.y) {
      canTurn = true;}

    let canReverse = false;
    if (item.cache === d[item.direction].reverse) {canReverse = true;}

    if (isWall(next, item.cache) === false && (canTurn === true || canReverse === true)) {

          let stats = d[item.cache];
          let transformStr = stats.transform;

          let currDir = item.direction;

          let currTransform = item.el.style.transform;
          if (item.cache === 'down' && currDir === 'left') {transformStr = 'rotate(270deg) rotateY(180deg)';}
          else if (item.cache === 'down' && currDir === 'right') {transformStr = 'rotate(90deg)';}
          else if (item.cache === 'up' && currDir === 'left') {transformStr = 'rotate(90deg) rotateY(180deg)';}
          else if (item.cache === 'up' && currDir === 'right') {transformStr = 'rotate(-90deg)';}
          else if (item.cache === 'up' && currDir === 'down') {
            if (currTransform.includes('rotate(270deg) rotateY(180deg)')) {transformStr = 'rotate(270deg)';}
          }
          else if (item.cache === 'down' && currDir === 'up') {
            if (currTransform.includes('rotate(90deg) rotateY(180deg)')) {transformStr = 'rotate(90deg)';}
          }
          item.el.style.transform = transformStr;
          item.speed = stats.speed;
          item.direction = item.cache;
          item.cache = '';

          return true;
   
    } 
  
  }

  // if there is no cache, or it wasn't cleared, check whether Ms PacMan is up against a wall
  let next = nextPos(item.rcPos, item.direction);
  let xy = findXY(item.rcPos);
  if (isWall(next,item.direction) === true && xy.x === item.position.x && findXY(item.rcPos).y === item.position.y) {
    item.speed = 0;
    item.cache = '';
  }

  teleport(item);

}

function spawn(item) {

  let blinkCount = 0;

  function blink(item) {

    if (blinkCount === 44) {
               item.speed = d[item.direction].speed; item.free = 'free'; 
               if (munchModeActive === true) {
                      item.el.style.backgroundColor = 'blue';
                      let fringes = Array.from(item.el.getElementsByClassName('fringe'));
                      fringes.forEach(fringe=> {
                                 
                       if (fringe.style.backgroundColor === item.color) {fringe.style.backgroundColor = 'blue';}
                       else if (fringe.style.backgroundColor === 'white') {fringe.style.backgroundColor = 'blue';}
                       else {
                         let gradient = fringe.style.backgroundImage;
                         let newGradient = gradient.replace(item.color,'blue');
                         newGradient = newGradient.replace('white','blue');
                         fringe.style.backgroundImage = newGradient;
                       }

                     })

                     let eyes = [...Array.from(item.el.getElementsByClassName('eyeball')),
                                 ...Array.from(item.el.getElementsByClassName('pupil'))];
                     eyes.forEach(eye => eye.style.display = 'none');

                     let frowns = [...Array.from(item.el.getElementsByClassName('blue-frown')),
                                   ...Array.from(item.el.getElementsByClassName('blue-pupil'))];
                     frowns.forEach(frown=> frown.style.display = '');
                          
               }      
               return true;}
             
      let display = 'none';
      if (blinkCount % 8 === 0 || blinkCount === 0) {display = '';}
      if (blinkCount % 4 === 0) {

      item.el.style.display = display;

    }
    blinkCount++;
    setTimeout(function() {blink(item);},50);
  }

  blink(item);

}

function scoreDivAdd(pos,board=board2) {
  const tileW = board.tileW;
  let newDiv = document.createElement('div');
  newDiv.style.width = tileW * 2;
  newDiv.style.height = tileW * 2;
  newDiv.style.position = 'absolute';
  newDiv.style.display = '';
  newDiv.style.backgroundColor = 'transparent';
  newDiv.style.fontFamily = '\'Press Start 2P\',cursive';
  newDiv.style.color = 'lightgray';
  newDiv.style.zIndex = '1000';
  newDiv.style.textAlign = 'center';
  newDiv.style.left = pos.x;
  newDiv.style.top = pos.y;
  newDiv.innerHTML = '200';

  let game = document.getElementById('game');
  game.appendChild(newDiv);

  setTimeout(function() {game.removeChild(newDiv)},1500);

}


// releases new ghosts from the box as applicable
function release(board) {

  // stop function if the game is restarted
  if (restarted === true || restartRelease === true) {return false;}

  // only proceed if there are ghosts in position in the box
  const positions = Ghost.boxPositions();
  if (Object.keys(positions).every(pos => !positions[pos]) === false) {

    let targetBoxPos = '';

    // center leaves first, followed by left and then right
    if (positions.center) {targetBoxPos = 'center'}
    else if (positions.left) {targetBoxPos = 'left'}
    else if (positions.right) {targetBoxPos = 'right'}

    // get the ghost in the target position
    ghost = ghosts.filter(g => g.boxPosition === targetBoxPos)[0];

    // open the gate
    const ghostGate = document.getElementById('ghost-gate');
    ghostGate.style.backgroundColor = 'black';

    leave(ghost,board);

    function leave(ghost) {
      if (restarted === true) {return false;}
      if (ghost.free === 'free') {
        // recalculate box positions
        let newPos = Ghost.boxPositions();
        if (newPos.center !== '' && (newPos.left === false || newPos.right === false)) {
          // find and move center ghost
          otherGhost = ghosts.filter(g => g.boxPosition === 'center')[0];
          reArrange(otherGhost);
        }
        return true;
      }
      ghost.leaveBox();
      setTimeout(function() {leave(ghost)},50);
    }

    function reArrange(ghost) {
      let result = ghost.reshuffle();
      if (result || restarted) {return false;}
      setTimeout(function() {reArrange(ghost)},50)
    }
    
  }

  setTimeout(function() {release(board);},4000)

}

function munchMode() {

  if (stop === false) {

    if (munchModeActive === false) {munchModeActive = true;}
    // make free ghosts blue, turn off their eyes and turn on their frowns
    if (powerCount === 0) {

      ghosts.forEach(ghost=>{

        if (ghost.el.style.backgroundColor !== 'transparent') {

          ghost.el.style.backgroundColor = 'blue';

          let fringes = Array.from(ghost.el.getElementsByClassName('fringe'));
          fringes.forEach(fringe=> {
            if (fringe.style.backgroundColor === ghost.color || fringe.style.backgroundColor === 'white') {fringe.style.backgroundColor = 'blue';}
            else {
              let gradient = fringe.style.backgroundImage;
              let newGradient = gradient.replace(ghost.color,'blue');
              newGradient = newGradient.replace('white','blue');
              fringe.style.backgroundImage = newGradient;
            }
            
          })

          let eyeballs = Array.from(ghost.el.getElementsByClassName('eyeball'));
          eyeballs.forEach(eye => eye.style.display = 'none');

          let pupils = Array.from(ghost.el.getElementsByClassName('pupil'));
          pupils.forEach(pupil=> pupil.style.display = 'none');

          let frowns = Array.from(ghost.el.getElementsByClassName('blue-frown'));
          frowns.forEach(frown=> frown.style.display = '');

          let frownEyes = Array.from(ghost.el.getElementsByClassName('blue-pupil'));
          frownEyes.forEach(eye=> eye.style.display = '');

        }

      })
    }

    else if (powerCount < 80) {
        // animated mouth will go here
    }

    // flashing while winding down - count 80 (4 seconds)
    else if (powerCount < 120 && powerCount >= 80) {
      let tempColor = 'white';
      if (powerCount % 8 === 0) {tempColor = 'blue';}
      if (powerCount % 4 === 0) {

        ghosts.forEach(ghost=>{

          if (ghost.el.style.backgroundColor !== 'transparent') {
  
            if (ghost.el.style.backgroundColor === 'white' || ghost.el.style.backgroundColor === 'blue') {
              ghost.el.style.backgroundColor = tempColor;
            }
  
            let fringes = Array.from(ghost.el.getElementsByClassName('fringe'));
            fringes.forEach(fringe=> {
              if (fringe.style.backgroundColor === 'blue' || fringe.style.backgroundColor === 'white') {
                         fringe.style.backgroundColor = tempColor;
              }
              else {
                let gradient = fringe.style.backgroundImage;
                if (gradient.includes('blue') && tempColor !== 'blue') {
                      let newGradient = gradient.replace('blue',tempColor);
                      fringe.style.backgroundImage = newGradient;
                } else if (gradient.includes('white') && tempColor !== 'white') {
                      let newGradient = gradient.replace('white',tempColor);
                      fringe.style.backgroundImage = newGradient;                         
                }
                           
              }
              
            })
  
          }
  
        })

      }

    }

    // done - count 120 (6 seconds)
    else if (powerCount >= 120) {

      // make everything normal again
      ghosts.forEach(ghost=>{

        if (ghost.el.style.backgroundColor !== 'transparent') {
          ghost.el.style.backgroundColor = ghost.color;

          let fringes = Array.from(ghost.el.getElementsByClassName('fringe'));
          fringes.forEach(fringe=> {
            if (fringe.style.backgroundColor === 'blue' || fringe.style.backgroundColor === 'white' ) {fringe.style.backgroundColor = ghost.color;}
            else {
              let gradient = fringe.style.backgroundImage;
              let newGradient = gradient.replace('blue',ghost.color);
              newGradient = gradient.replace('white',ghost.color);
              fringe.style.backgroundImage = newGradient;
            }
            
          })
          let eyeballs = Array.from(ghost.el.getElementsByClassName('eyeball'));
          eyeballs.forEach(eye => eye.style.display = '');

          let pupils = Array.from(ghost.el.getElementsByClassName('pupil'));
          pupils.forEach(pupil=> pupil.style.display = '');

          let frowns = Array.from(ghost.el.getElementsByClassName('blue-frown'));
          frowns.forEach(frown=> frown.style.display = 'none');

          let frownEyes = Array.from(ghost.el.getElementsByClassName('blue-pupil'));
          frownEyes.forEach(eye=> eye.style.display = 'none');

        }

      })

      // stop function
      powerCount = 0;
      munchModeActive = false;
      return true;

    }

    powerCount++;

  }

  setTimeout(munchMode,50);

}

function ghostEyes(item, dir) {
  let eyes = Array.from(item.getElementsByClassName('eyeball'));
  let pupils = Array.from(item.getElementsByClassName('pupil'));

  eyes.forEach(eye => eye.style.top = d[dir].eyetop);
  eyes[0].style.left = d[dir].eyeleft;
  eyes[1].style.left = (parseInt(d[dir].eyeleft) + fringeW * 5) + 'px';

  pupils.forEach(pupil => pupil.style.top = d[dir].pupiltop);
  pupils[0].style.left = d[dir].pupilleft;
  pupils[1].style.left = (parseInt(d[dir].pupilleft) + fringeW * 5) + 'px'

}

function teleport(item,board=board2) {

  if (item.position.x <= 0 && item.direction === 'left') {
    item.position.x = (board.cols - 2) * board.tileW - board.speed;
    item.rcPos.col = board.cols - 3;
  }

  else if (item.position.x > (board.cols - 2) * board.tileW && item.direction === 'right') {
    item.position.x = 0;
    item.rcPos.col = 0;
  }
}