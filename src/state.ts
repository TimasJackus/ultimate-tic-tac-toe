import { zeros, NdArray } from 'numjs';
import Player from './player';
import HumanPlayer from './humanPlayer';
import { sha1 } from 'hash.js';

class State {
    board: NdArray<number[][]>;
    playerOne: Player;
    playerTwo: Player | HumanPlayer;
    isEnd: boolean;
    boardHash: string;
    playerSymbol: number;
    activeTile: number = null;
    ties: number = 0;
    playerOneWins: number = 0;
    playerTwoWins: number = 0;
    

    constructor(playerOne: Player, playerTwo: Player | HumanPlayer) {
        this.board = zeros<any>([9, 3, 3]);
        this.playerOne = playerOne;
        this.playerTwo = playerTwo;
        this.isEnd = false;
        this.boardHash = null;
        this.playerSymbol = 1;
    }

    getHash(): string {
        this.boardHash = JSON.stringify(this.board.reshape(9 * 3 * 3));
        return sha1().update(this.boardHash).digest('hex');
    }

    tileWinner(tileIndex): number {
        const board = this.board.tolist()[tileIndex];

        // Rows
        for (let i = 0; i < 3; i++) {
            const rowSum = board[i][0] + board[i][1] + board[i][2];
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
            const colSum =  board[0][i] + board[1][i] + board[2][i];
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
        const diag_sum1 = board[0][0] + board[1][1] + board[2][2];
        const diag_sum2 = board[0][2] + board[1][1] + board[2][0];
        if (diag_sum1 === 3 || diag_sum2 === 3) {
            this.isEnd = true;
            return 1;
        }
        if (diag_sum1 === -3 || diag_sum2 === -3) {
            this.isEnd = true;
            return -1;
        }

        // tie
        if (this.availableTilePositions(tileIndex).length === 0) {
            this.isEnd = true;
            return 0;
        }

        this.isEnd = false;
        return null;
    }

    winner() {
        // Rows
        for (let i = 0; i < 3; i++) {
            const rowSum = this.tileWinner(i * 3) + this.tileWinner(i * 3 + 1) + this.tileWinner(i * 3 + 2);
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
            const colSum =  this.tileWinner(i) + this.tileWinner(i + 3) + this.tileWinner(i + 6);
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
        const diag_sum1 = this.tileWinner(0) + this.tileWinner(4) + this.tileWinner(8);
        const diag_sum2 = this.tileWinner(2) + this.tileWinner(4) + this.tileWinner(6);
        if (diag_sum1 === 3 || diag_sum2 === 3) {
            this.isEnd = true;
            return 1;
        }
        if (diag_sum1 === -3 || diag_sum2 === -3) {
            this.isEnd = true;
            return -1;
        }

        // tie
        if (this.availablePositions().length === 0) {
            this.isEnd = true;
            return 0;
        }

        this.isEnd = false;
        return null;
    }

    availableTilePositions(tileIndex: number): Array<Array<number>> {
        const positions = [];
        this.board.tolist()[tileIndex]
            .map((row, rowIndex) => {
                row.map((col, colIndex) => {
                    if(col === 0) {
                        positions.push([rowIndex, colIndex]);
                    }
                });
            });
        return positions;
    }

    availablePositions(): Array<Array<Array<number>>> {
        const positions = [];
        this.board.tolist().map((tile, tileIndex) => {
            if (this.tileWinner(tileIndex) === null) {
                if (this.activeTile !== null && this.tileWinner(this.activeTile) === null) {
                    if (this.activeTile === tileIndex) {
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
        return positions;
    }

    updateState(position) {
        this.board.set(...position, this.playerSymbol);
        this.playerSymbol = this.playerSymbol === 1 ? -1 : 1;
        this.activeTile = position[1] * 3 + position[2];
    }

    giveReward() {
        const winner = this.winner();
        switch(winner) {
            case 1:
                this.playerOneWins += 1;
                this.playerOne.feedReward(1)
                this.playerTwo.feedReward(0);
                break;
            case -1:
                this.playerTwoWins += 1;
                this.playerOne.feedReward(0)
                this.playerTwo.feedReward(1);
                break;
            default:
                this.ties += 1;
                this.playerOne.feedReward(0.1);
                this.playerTwo.feedReward(0.5);
                break;
        }
    }

    reset() {
        this.board = zeros<any>([9, 3, 3]);
        this.boardHash = null;
        this.isEnd = false;
        this.playerSymbol = 1;
    }

    async play(rounds: number = 100, every: number = 1000) {
        for (let i = 1; i <= rounds; i++) {
            while(!this.isEnd) {
                // Player 1
                const positions = this.availablePositions();
                const playerOneAction = await this.playerOne.chooseAction(positions, this.board.tolist(), this.playerSymbol);
                this.updateState(playerOneAction);
                const boardHash = this.getHash();
                this.playerOne.addState(boardHash);

                const winner = this.winner();

                if (winner !== null) {
                    this.giveReward();
                    this.playerOne.reset();
                    this.playerTwo.reset();
                    this.reset();
                    break;
                } else {
                    const positions = this.availablePositions();
                    const playerTwoAction = await this.playerTwo.chooseAction(positions, this.board.tolist(), this.playerSymbol);
                    this.updateState(playerTwoAction);
                    const boardHash = this.getHash();
                    this.playerTwo.addState(boardHash);
                    
                    const winner = this.winner();

                    if (winner !== null) {
                        this.giveReward();
                        this.playerOne.reset();
                        this.playerTwo.reset();
                        this.reset();
                        break;
                    }
                }
            }

            if (i % every === 0 && i !== 0) {
                console.log(`Rounds: ${i}`);
                let { ties, playerOneWins, playerTwoWins } = this;
                ties = ties / every * 100;
                playerOneWins = playerOneWins / every  * 100;
                playerTwoWins = playerTwoWins / every * 100;
                console.table({
                    ties: ties.toFixed(2) + '%',
                    playerOneWins: playerOneWins.toFixed(2) + '%',
                    playerTwoWins: playerTwoWins.toFixed(2) + '%'
                });
                this.ties = 0;
                this.playerOneWins = 0;
                this.playerTwoWins = 0;
            }
        }
    }

    async playVsAI() {
        while (!this.isEnd) {
            const positions = this.availablePositions();
            const playerOneAction = await this.playerOne.chooseAction(positions, this.board.tolist(), this.playerSymbol);
            this.updateState(playerOneAction);
            this.showBoard();

            const winner = this.winner();

            if (winner !== null) {
                if (winner === 1) {
                    console.log(`${this.playerOne.name} wins!`);
                } else {
                    console.log(`tie!`);
                }
                this.reset();
                break;
            } else {
                const positions = this.availablePositions();
                const playerTwoAction = await (this.playerTwo as HumanPlayer).chooseAction(positions);

                this.updateState(playerTwoAction);
                this.showBoard();

                const winner = this.winner();
                
                if (winner !== null) {
                    if (winner === -1) {
                        console.log(`${this.playerTwo.name} wins!`);
                    } else {
                        console.log('tie!');
                    }
                    this.reset();
                    break;
                }
            }
        }
    }

    showBoard() {
        const t = [];
        for (let i = 0; i < 9; i += 3) {
            for (let j = 0;  j < 3; j++) {
                t.push([this.getString(i, j), this.getString(i + 1, j), this.getString(i + 2, j)])
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

    getString(tileIndex, row) {
        const tile = this.board.tolist()[tileIndex];
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

    showTile(tileIndex) {
        const tile = this.board.tolist()[tileIndex];
        console.log('-------------')
        for (let i = 0; i < 3; i++) {
            let out = '| ';
            for (let j = 0; j < 3; j++) {
                let token;
                switch(tile[i][j]) {
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
            console.log(out);
        }
        console.log('-------------')
    }

}

export default State;