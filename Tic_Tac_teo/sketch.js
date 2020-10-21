let grid;
let rows = 3;
let cols = 3;

let blockSize;
let initPos;

let stepSizeRatio = 1/3;

let step;
let gameStatue; //[gameEnd?, playerWon?]
let gameStatText = "Start";

let transpose = m => m[0].map((x,i) => m.map(x => x[i]));

let playWithAI = false;
let aIPiece = 1;
let mouseIsClicked = false;

function initialize() {
  let margin = 0.00;
  gameStatue = [false, false];
  step = 0;

  blockSize = floor(min(width,height)/(max(rows,cols) * (1+margin)));
  initPos = createVector((width - blockSize*cols)/2, (height - blockSize*rows)/2);

  // initialize grid (full of -1)
  grid = []

  for (let row=0;row<rows;row++) {
    grid.push([]);
    for (let col=0;col<cols;col++) {
      grid[row].push(-1);
    }
  }
}

function choosePlayAI(){
  var checkBox = document.getElementById("AICheckBox");
  var aiOderBox = document.getElementById("AIOrderContainer");
  if (checkBox.checked == true){
    playWithAI = true;
    aiOderBox.style.display = "block";
  } else {
     playWithAI = false;
     aiOderBox.style.display = "none";
  }
}

function aIMoveOrder() {
  var checkBox = document.getElementById("AIOrderCheckBox");
  if (checkBox.checked == true){
    aIPiece = 0;
  } else {
     aIPiece = 1;
  }
}

function setup() {
  var canvas = createCanvas(400, 400);
  canvas.parent('game');

  initialize();

  document.getElementById("p1Display").innerHTML = "O";
  document.getElementById("p2Display").innerHTML = "X";
}

function draw() {
  background(0);

  gamePlay();
  drawGrid();
  gameCheck();

  document.getElementById("stepText").innerHTML = step;
}

function gameCheck() {
  gameStatue = ticTacEnd(grid);

  if (gameStatue[0]) {
    if (gameStatue[1]) { // if last player won
      let playerN = playerDetermine(step-1)+1;
      gameStatText = "player " + playerN +" won!";

    } else {
      gameStatText = "Draw!";
    }
  } else {gameStatText = "Playing..."}
  document.getElementById("gameStatText").innerHTML = gameStatText;

}

function gamePlay(){
  if (!gameStatue[0]){
    if (playWithAI) {
      if (mouseIsClicked && (aIPiece + step)%2 !=0) { //when its not ai's move
        playerMove();

      } else if ((aIPiece + step)%2 ==0) {
        aIMove();
      }
    }
    else {
      if (mouseIsClicked){
        playerMove();
      }
    }
  }
  mouseIsClicked = false;

}

function playerMove() {
  if (!gameStatue[0]){
    n = playerDetermine(step);
    let validStep = changeGrid(mouseX, mouseY, n);
    if (validStep) {
      step++;
    }
  }
}

function aIMove() {
  let validStep = aIPlay(aIPiece, step, grid);
  if (validStep) {
    step++;
  }
}

function mouseClicked() {
  // if (playWithAI) {
  //   if ((aIPiece + step)%2 !=0) { //when its not ai's move
  //     playerMove();
  //   }
  // }
  // else {
  //   playerMove();
  // }
  mouseIsClicked = true;
}

function playerDetermine(currentStep){
  if (currentStep%2 == 0){
    return 0;
  }
  return 1;
}

function drawGrid() {
    //boundary
  noFill();
  stroke(255);

  for (let row=0;row<rows;row++) {
    for (let col=0;col<cols;col++) {
      // draw boudary
      line(initPos.x+col*blockSize, initPos.y,
          initPos.x+col*blockSize, initPos.y + rows*blockSize);
      line(initPos.x, initPos.y+row*blockSize,
          initPos.x+cols*blockSize, initPos.y + row*blockSize);

        // draw step
      n = grid[row][col];
      x = initPos.x+col*blockSize+blockSize/2;
      y = initPos.y+row*blockSize+blockSize/2;
      stepSize = blockSize*stepSizeRatio;
        if (n==0) {
        ellipse(x,y,2*stepSize, 2*stepSize);
        } else if (n==1) {
        line(x-stepSize,y-stepSize,x+stepSize, y+stepSize);
        line(x-stepSize,y+stepSize,x+stepSize, y-stepSize);
        }
    }
  }

  // final boundaries
  line(initPos.x+cols*blockSize, initPos.y,
          initPos.x+cols*blockSize, initPos.y + rows*blockSize);
  line(initPos.x, initPos.y+rows*blockSize,
          initPos.x + cols*blockSize, initPos.y + rows*blockSize);
}

function changeGrid(x, y, n){
  for (let row=0;row<rows;row++) {
    for (let col=0;col<cols;col++) {
      let inThisBlock = (initPos.x+col*blockSize<x && x<initPos.x+(col+1)*blockSize) && (initPos.y+row*blockSize<y && y<initPos.y+(row+1)*blockSize);

      if (inThisBlock){
        // if the grid is blank
        if (grid[row][col] == -1) {
          grid[row][col] = n;
          return true; // the step is valid
        }
      }
    }
  }
  return false; //step is invalid
}

function ticTacEnd(inGrid) {
  let bool3 = inGrid[0][0] == inGrid[1][1] && inGrid[0][0] == inGrid[2][2] && inGrid[0][0]!=-1;
  let bool4 = inGrid[2][0] ==inGrid[1][1] && inGrid[2][0] == inGrid[0][2] && inGrid[2][0]!=-1;

  let bool1 = inGrid.some(row=>(row.every(col=>col==row[0]&&col!=-1)));
  let bool2 = transpose(inGrid).some(row=>(row.every(col=>col==row[0]&&col!=-1)));

  let bool5 = inGrid.every(row=>(row.every(col=>col!=-1))); // if the grid is filled



    if (bool1||bool2||bool3||bool4) {
      return [true, true]; // game end and last player won
    }
    else if (bool5){
      return [true, false]; // game end but draw
    }

  return [false, false]; // game not end
}
