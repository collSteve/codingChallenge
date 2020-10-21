
function AI(n, inGrid, depth) {
  if (n == 0) {
    pieces = [0,1];
  } else if (n==1){
    pieces = [1,0]
  } else {
    console.error("Unexpected piece for AI: " + n+", piece can only be 0 or 1");
  }

  let topNode = constructTree(pieces, inGrid, depth);
  assignOverallScore(topNode);

  // select the best move
  let minn = -999;
  let desiredMove = [null,null];
  topNode.child.forEach((kid) => {
    if (kid.overallScore > minn) {
      minn = kid.overallScore;
      desiredMove = kid.pos;
    }
  });

  return desiredMove;
}

function aIPlay(n, currentStep, currentGrid, depth = 20) { // 7 steps ahead
  if (n==0 || n==1){

    if ((currentStep+n) %2==0) {
      let aImove = AI(n, currentGrid, depth);
      currentGrid[aImove[0]][aImove[1]] = n;
      return true; // played the move
    }
    return false; // not yet played
  } else {
    console.error("aI pieces can only be 0 or 1, Instead recieved: "+n);
  }
  return false;
}

function assignOverallScore(node) {
  if (node.child.some(kid=>kid.overallScore==null)) {
    node.child.forEach(kid => {
      if (kid.overallScore == null) {
        assignOverallScore(kid);
      }
    });
  }

  let summ = 0;
  node.child.forEach((kid)=>summ+=kid.overallScore);
  //node.overallScore = summ;
  node.overallScore = summ/node.child.length;

}

function constructTree(pieces, inGrid, depth) {
  let piece = pieces[1];
  let currentPlayer = "NaN";
  let startNode = new Node(-1, -1, inGrid=inGrid);
  startNode.depth = -1;
  startNode.player = "other";
  startNode.piece = piece;

  let turn = 0; // if turn is even then it's AI's turn

  let oddParents = [];
  let newParents = [startNode];
  for (let i = 0; i < depth; i++) {

    oddParents = cloneArray(newParents);
    newParents = []
    for (let j = 0; j < oddParents.length; j++){

      parentGrid = JSON.parse(JSON.stringify(oddParents[j].grid));
      //console.log(findEmpty(parentGrid));
      allMoves = findEmpty(parentGrid);

      for (k in allMoves) {
        move = allMoves[k];

        // check who played:
        if (turn%2==0){

          currentPlayer = "AI";
          piece = pieces[0];
        } else {
          currentPlayer = "other";
          piece = pieces[1];
        }


        nodeGrid = JSON.parse(JSON.stringify(parentGrid));
        nodeGrid[move[0]][move[1]] = piece;

        let node = new Node(move[0],move[1], inGrid=nodeGrid);
        node.parent = oddParents[j];
        oddParents[j].child.push(node);
        node.depth = i;
        node.player = currentPlayer;
        node.piece = piece;

        // check the impact of the move
        let rawStatue = ticTacEnd(nodeGrid);
        if (rawStatue[0]&&rawStatue[1]) { //this turn won
          if (node.player == "AI") { // AI won
            node.score = 1;
            node.overallScore = 1;
          } else { // other won AI lost
            node.score = -2;
            node.overallScore = -2;
          }
        }
        else if (rawStatue[0]&& !rawStatue[1]) { //draw
          node.score = 1/2;
          node.overallScore = 1/2;
        }
        else { // game continue
          node.score =  -0.1;// yet to be determine
          newParents.push(node);  // can still need to has further moves
        }

      }
    }
    turn ++;
  }
  return startNode;
}


function findEmpty(inGrid) {
  let index = [];
  for (let row=0;row<inGrid.length;row++) {
    for (let col=0;col<inGrid[0].length;col++) {
      if (inGrid[row][col] == -1) {
        index.push([row,col]);
      }
    }
  }
  return index;
}
class Node {
  constructor(row, col, inGrid=null) {
    this.pos = [row,col];
    this.grid = JSON.parse(JSON.stringify(inGrid));
    this.child = [];
    this.parent = null;
    this.depth;
    this.score = 0; // -1 lost, 1 won, 0 draw
    this.player = "NAN"; //AI or other
    this.piece = null;
  }
}

function cloneArray(myArray) {
  return myArray.map(a => Object.assign({}, a));
}
