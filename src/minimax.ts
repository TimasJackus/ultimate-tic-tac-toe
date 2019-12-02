import Game from "./game";
import State from "./state";

export class Minimax {
    game: Game;

    constructor(game: Game) {
        this.game = game;
    }

    private minimax(state: State, depth: number, alpha: number = -Infinity, beta: number = Infinity): number {
        const winner = this.game.winner(state);
        if (this.game.isEnd) {
            switch (winner) {
                case 1:
                    this.game.isEnd = false;
                    return Infinity;
                case -1:
                    this.game.isEnd = false;
                    return -Infinity;
                case 0:
                default:
                    this.game.isEnd = false;
                    return -Math.pow(10, depth);
            }
        }

        if (depth <= 0) {
            const score = this.game.getScore(state);
            return score;
        }

        const possibleMoves: number[][] = this.game.getPossibleMoves(state);
        let bestScore;

        if (state.player === 1) {
            bestScore = -Infinity;
            for (let i = 0; i < possibleMoves.length; i++) {
                const move = possibleMoves[i];
                if (!move) {
                    console.log({ move, length: possibleMoves.length, i });
                    break;
                }
                const newState = this.game.updateState(state, move);
                const score = this.minimax(newState, depth - 1, alpha, beta);
                // console.log({ score, depth: depth - 1, move });
                // console.log(bestScore, score);
                bestScore = Math.max(score, bestScore);
                alpha = Math.max(bestScore, alpha);
                if (beta <= alpha) {
                    break;
                }
            }
        } else if (state.player === -1) {
            bestScore = Infinity;
            for (let i = 0; i < possibleMoves.length; i++) {
                const move = possibleMoves[i];
                if (!move) {
                    console.log({ move, length: possibleMoves.length, i });
                    break;
                }
                const newState = this.game.updateState(state, move);
                const score = this.minimax(newState, depth - 1, alpha, beta);
                bestScore = Math.min(score, bestScore);
                beta = Math.min(bestScore, beta);
                if (beta <= alpha) {
                    break;
                }
            }
        }

        return bestScore;
    }

    findBestMove(state: State, maxDepth = 5): number[] {
        const possibleMoves: number[][] = this.game.getPossibleMoves(state);
        let bestValue = state.player === 1 ? -Infinity : Infinity;
        let bestMove: number[] = possibleMoves[0]; 

        if (possibleMoves.length === 81) {
            return [4, 1, 1];
        }

        possibleMoves.forEach(move => {
            const newState = this.game.updateState(state, move);
            const moveValue = this.minimax(newState, maxDepth, -Infinity, Infinity);
            if (state.player === 1 && moveValue > bestValue) {
                bestValue = moveValue;
                bestMove = move;
            }
            if (state.player === -1 && moveValue < bestValue) {
                bestValue = moveValue;
                bestMove = move;
            }
            console.log({ move, bestValue, bestMove });
        });
        return bestMove;
    }
}