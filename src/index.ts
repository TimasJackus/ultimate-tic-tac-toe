import Game from './game';
import { chooseTileAction, chooseRowAction, chooseColAction } from './humanPlayer';
import { Minimax } from './minimax';

export const getString = (tile, row) => {
    // const tile = this.board.tolist()[tileIndex];
    let out = '| ';
    for (let j = 0; j < 3; j++) {
        let token;
        switch(tile[row][j]) {
            case 1:
                token = 'x';
                break;
            case -1:
                token = 'o';
                break;
            default:
                token = ' ';
                break;
        }
        out += token + ' | ';
    }
    return out;
}

export const showBoard = (board) => {
    const t = [];
    for (let i = 0; i < 9; i += 3) {
        for (let j = 0;  j < 3; j++) {
            t.push([getString(board[i], j), getString(board[i + 1], j), getString(board[i + 2], j)])
        }
    }
    
    for (let row = 0; row < 9; row++) {
        let out = '';
        for (let col = 0; col < 3; col++) {
            out += t[row][col] + '     ';
        }
        if(row % 3 === 0) {
            console.log('---------------------------------------------------');
        }
        console.log(out);
    }
    console.log('---------------------------------------------------');
}

async function getPlayerMove(positions) {
    let move = [];
    while (positions.some(arr => JSON.stringify(move) === JSON.stringify(arr)) === false) {
        move = [];
        const tile = await chooseTileAction();
        const row = await chooseRowAction();
        const col = await chooseColAction();
        move = [tile, row, col];
        if (positions.some(arr => JSON.stringify(move) === JSON.stringify(arr)) === false) {
            console.log(positions);
        }
    }
    return move;
}

 async function init() {
    let game = new Game();
    // let mcts = new MCTS(game)
    let minimax = new Minimax(game);
    
    let state = game.start()
    let winner = game.winner(state)
    // mcts.runSearch(state, 10);
    
    // console.log();
    
    while (winner === null) {
        // const move = mcts.bestMove(state);
        const move = minimax.findBestMove(state);
        state = game.updateState(state, move);
        showBoard(state.board);
        winner = game.winner(state);
        const smallboardScore = game.calculateSmallBoardScore(state, state.board[4], true);
        console.log({ smallboardScore });
        if (winner === null) {
            const playerMove = await getPlayerMove(game.getPossibleMoves(state));
            state = game.updateState(state, playerMove);
            showBoard(state.board);
            winner = game.winner(state);
        }
    }
    if (winner === 0) {
        console.log('tie');
    } else {
        console.log(winner === 1 ? 'X wins' : 'O wins');
    }
}

init();
// From initial state, play games until end

// while (winner === null) {

//   console.log()
//   console.log("player: " + (state.player === 1 ? 1 : 2))
//   showBoard(state.board);
//   console.log(state.board.map((row) => row.map((cell) => cell === -1 ? 2 : cell)))


//   mcts.runSearch(state, 1)

//   let stats = mcts.getStats(state)
//   console.log(util.inspect(stats, {showHidden: false, depth: null}))

//   let play = mcts.bestMove(state)
//   console.log("chosen play: " + util.inspect(play, {showHidden: false, depth: null}))
//   if (play) {
//     state = game.updateState(state, play)
//     winner = game.winner(state)
//   }
// }
// showBoard(state.board);