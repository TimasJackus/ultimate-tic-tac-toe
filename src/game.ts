import State from "./state";
import { zeros, array, diag } from "numjs";
import { showBoard } from ".";
import { stat } from "fs";

class Game {
    isEnd = false;

    start() {
        const board = zeros<any>([9, 3, 3]).tolist();

        return new State(board, 1);
    }

    availableTilePositions(tile): Array<Array<number>> {
        const positions = [];
        tile.map((row, rowIndex) => {
            row.map((col, colIndex) => {
                if(col === 0) {
                    positions.push([rowIndex, colIndex]);
                }
            });
        });
        return positions;
    }

    getPossibleMoves(state: State): Array<Array<number>> {
        if (this.isEnd) {
            return [];
        }
        const positions = [];
        const board = state.board;
        board.map((tile, tileIndex) => {
            if (this.tileWinner(tile) === null) {
                if (state.activeTile !== null && this.tileWinner(board[state.activeTile]) === null) {
                    if (state.activeTile === tileIndex) {
                        tile.map((row, rowIndex) => {
                            row.map((col, colIndex) => {
                                if(col === 0) {
                                    positions.push([tileIndex, rowIndex, colIndex]);
                                }
                            });
                        });
                    }
                } else {
                    tile.map((row, rowIndex) => {
                        row.map((col, colIndex) => {
                            if(col === 0) {
                                positions.push([tileIndex, rowIndex, colIndex]);
                            }
                        });
                    });
                }
            }
        });
        // console.log(positions.length);
        return positions;
    }

    tileWinner(tile): number {
        // Rows
        for (let i = 0; i < 3; i++) {
            const rowSum = tile[i][0] + tile[i][1] + tile[i][2];
            if (rowSum === 3) {
                return 1;
            }
            if (rowSum === -3) {
                return -1;
            }
        }

        // Columns
        for (let i = 0; i < 3; i++) {
            const colSum =  tile[0][i] + tile[1][i] + tile[2][i];
            if (colSum === 3) {
                return 1;
            }
            if (colSum === -3) {
                return -1;
            }
        }

        // Diagonals
        const diag_sum1 = tile[0][0] + tile[1][1] + tile[2][2];
        const diag_sum2 = tile[0][2] + tile[1][1] + tile[2][0];
        if (diag_sum1 === 3 || diag_sum2 === 3) {
            return 1;
        }
        if (diag_sum1 === -3 || diag_sum2 === -3) {
            return -1;
        }

        // tie
        if (this.availableTilePositions(tile).length === 0) {
            return 0;
        }

        return null;
    }

    updateState(state, move) {
        // const history = state.history.slice();
        // history.push(move);
        const newBoard = array(state.board);
        newBoard.set(...move, state.player);
        const nextPlayer = -state.player;
        const activeTile = move[1] * 3 + move[2];
        return new State(newBoard.tolist(), nextPlayer, activeTile)
    }

    winner(state: State) {
        // Rows
        for (let i = 0; i < 3; i++) {
            const tile1 = state.board[i * 3];
            const tile2 = state.board[i * 3 + 1];
            const tile3 = state.board[i * 3 + 2]; 
            const rowSum = this.tileWinner(tile1) + this.tileWinner(tile2) + this.tileWinner(tile3);
            if (rowSum === 3) {
                this.isEnd = true;
                return 1;
            }
            if (rowSum === -3) {
                this.isEnd = true;
                return -1;
            }
        }

        // Columns
        for (let i = 0; i < 3; i++) {
            const tile1 = state.board[i];
            const tile2 = state.board[i + 3];
            const tile3 = state.board[i + 6]; 
            const colSum =  this.tileWinner(tile1) + this.tileWinner(tile2) + this.tileWinner(tile3);
            if (colSum === 3) {
                this.isEnd = true;
                return 1;
            }
            if (colSum === -3) {
                this.isEnd = true;
                return -1;
            }
        }

        // Diagonals
        const diag_sum1 = this.tileWinner(state.board[0]) + this.tileWinner(state.board[4]) + this.tileWinner(state.board[8]);
        const diag_sum2 = this.tileWinner(state.board[2]) + this.tileWinner(state.board[4]) + this.tileWinner(state.board[6]);
        if (diag_sum1 === 3 || diag_sum2 === 3) {
            this.isEnd = true;
            return 1;
        }
        if (diag_sum1 === -3 || diag_sum2 === -3) {
            this.isEnd = true;
            return -1;
        }

        // tie
        if (this.getPossibleMoves(state).length === 0) {
            this.isEnd = true;
            return 0;
        }

        this.isEnd = false;
        return null;
    }

    calculateBigBoardScore(state) {
        let score = 0;
        let winnerCounts = {
            'X': 0,
            'O': 0
        };

        // Rows
        for (let i = 0; i < 3; i++) {
            const tile1 = this.tileWinner(state.board[i * 3]);
            const tile2 = this.tileWinner(state.board[i * 3 + 1]);
            const tile3 = this.tileWinner(state.board[i * 3 + 2]); 
            const rowSum = tile1 + tile2 + tile3;
            const rowFilled = tile1 !== 0 && tile2 !== 0 && tile3 !== 0;
            if (rowFilled) {
                if (rowSum === 3) {
                    winnerCounts['X'] += rowSum;
                }
                if (rowSum === -3) {
                    winnerCounts['O'] -= rowSum;
                }
            } else {
                if (rowSum > 0) {
                    winnerCounts['X'] += rowSum;
                }
                if (rowSum < 0) {
                    winnerCounts['O'] -= rowSum
                }
            }
        }

        // Columns
        for (let i = 0; i < 3; i++) {
            const tile1 = this.tileWinner(state.board[i]);
            const tile2 = this.tileWinner(state.board[i + 3]);
            const tile3 = this.tileWinner(state.board[i + 6]); 
            const colSum = tile1 + tile2 + tile3;
            const colFilled = tile1 !== 0 && tile2 !== 0 && tile3 !== 0;
            if (colFilled) {
                if (colSum === 3) {
                    winnerCounts['X'] += colSum;
                }
                if (colSum === -3) {
                    winnerCounts['O'] -= colSum;
                }
            } else {
                if (colSum > 0) {
                    winnerCounts['X'] += colSum;
                }
                if (colSum < 0) {
                    winnerCounts['O'] -= colSum;
                }
            }
        }

        const tile0 = this.tileWinner(state.board[0]);
        const tile2 = this.tileWinner(state.board[2]);
        const tile4 = this.tileWinner(state.board[4]);
        const tile6 = this.tileWinner(state.board[6]);
        const tile8 = this.tileWinner(state.board[8]);
        // Diagonals
        const diag_sum1 = tile0 + tile4 + tile8;
        const diag_sum2 = tile2 + tile4 + tile6;
        const diag1_filled = tile0 !== 0 && tile4 !== 0 && tile8 !== 0;
        const diag2_filled = tile2 !== 0 && tile4 !== 0 && tile6 !== 0;

        if (diag1_filled) {
            if (diag_sum1 === 3) {
                winnerCounts['X'] += diag_sum1;
            }
            if (diag_sum1 === -3) {
                winnerCounts['O'] -= diag_sum1;
            }
        } else {
            if (diag_sum1 > 0) {
                winnerCounts['X'] += diag_sum1;
            }
            if (diag_sum1 < 0) {
                winnerCounts['O'] -= diag_sum1
            }
        }
        if (diag2_filled) {
            if (diag_sum2 === 3) {
                winnerCounts['X'] += diag_sum2;
            }
            if (diag_sum2 === -3) {
                winnerCounts['O'] -= diag_sum2;
            }
        } else {
            if (diag_sum2 > 0) {
                winnerCounts['X'] += diag_sum2;
            }
            if (diag_sum2 < 0) {
                winnerCounts['O'] -= diag_sum2;
            }
        }

        if (winnerCounts['O'] > 0 && winnerCounts['X'] > 0) {
            score = 0;
        } else if (winnerCounts['X'] > 0) {
            score += Math.pow(10, winnerCounts['X'] + 1);
        } else if (winnerCounts['O'] > 0) {
            score -= Math.pow(10, winnerCounts['O'] + 1);
        }

        // score += Math.pow(10, winnerCounts['X'] - winnerCounts['O']);
        return score;
    }

    calculateSmallBoardScore(state, tile, print = false) {
        let score = 0;
        let winnerCounts = {
            'X': 0,
            'O': 0
        };

        // Rows
        for (let i = 0; i < 3; i++) {
            const rowSum = tile[i][0] + tile[i][1] + tile[i][2];
            const rowFilled = tile[i][0] !== 0 && tile[i][1] !== 0 && tile[i][2] !== 0;
            if (rowFilled) {
                if (rowSum === 3) {
                    winnerCounts['X'] += rowSum;
                }
                if (rowSum === -3) {
                    winnerCounts['O'] -= rowSum;
                }
            } else {
                if (rowSum > 1) {
                    winnerCounts['X'] += rowSum;
                }
                if (rowSum < -1) {
                    winnerCounts['O'] -= rowSum
                }
            }
        }

        // Columns
        for (let i = 0; i < 3; i++) {
            const colSum =  tile[0][i] + tile[1][i] + tile[2][i];
            const colFilled = tile[0][i] !== 0 && tile[1][i] !== 0 && tile[2][i] !== 0;
            if (colFilled) {
                if (colSum === 3) {
                    winnerCounts['X'] += colSum;
                }
                if (colSum === -3) {
                    winnerCounts['O'] -= colSum;
                }
            } else {
                if (colSum > 1) {
                    winnerCounts['X'] += colSum;
                }
                if (colSum < -1) {
                    winnerCounts['O'] -= colSum
                }
            }
        }

        // Diagonals
        const diag_sum1 = tile[0][0] + tile[1][1] + tile[2][2];
        const diag_sum2 = tile[0][2] + tile[1][1] + tile[2][0];
        const diag1_filled = tile[0][0] !== 0 && tile[1][1] !== 0 && tile[2][2] !== 0;
        const diag2_filled = tile[0][2] !== 0 && tile[1][1] !== 0 && tile[2][0] !== 0;


        if (diag1_filled) {
            if (diag_sum1 === 3) {
                winnerCounts['X'] += diag_sum1;
            }
            if (diag_sum1 === -3) {
                winnerCounts['O'] -= diag_sum1;
            }
        } else {
            if (diag_sum1 > 1) {
                winnerCounts['X'] += diag_sum1;
            }
            if (diag_sum1 < -1) {
                winnerCounts['O'] -= diag_sum1
            }
        }
        if (diag2_filled) {
            if (diag_sum2 === 3) {
                winnerCounts['X'] += diag_sum2;
            }
            if (diag_sum2 === -3) {
                winnerCounts['O'] -= diag_sum2;
            }
        } else {
            if (diag_sum2 > 1) {
                winnerCounts['X'] += diag_sum2;
            }
            if (diag_sum2 < -1) {
                winnerCounts['O'] -= diag_sum2;
            }
        }

        if (winnerCounts['O'] > 0 && winnerCounts['X'] > 0) {
            score = 0;
        } else if (winnerCounts['X'] > 0) {
            score += Math.pow(10, winnerCounts['X'] - 1);
        } else if (winnerCounts['O'] > 0) {
            score -= Math.pow(10, winnerCounts['O'] - 1);
        }
        
        // const difference = winnerCounts['X'] - winnerCounts['O'];
        // const multiplier = difference < 0 ? -1 : 1;
        // if (print) console.log({ winnerCounts, difference, multiplier, score, tile });

        return score;
    }

    getScore(state): number {
        let score = 0;
        score += this.calculateBigBoardScore(state);
        for (let i = 0; i < 9; i++) {
            let winner = this.tileWinner(state.board[i]);
            if (winner !== null) {
                score += Math.pow(10, 4) * winner;
            } else {
                score += this.calculateSmallBoardScore(state, state.board[i]);
            }
        }
        return score;
    }
}

export default Game;