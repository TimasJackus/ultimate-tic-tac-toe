import Game from "./game";
import State from "./state";

export class Minimax {
    game: Game;

    constructor(game: Game) {
        this.game = game;
    }

    private minimax(state: State, depth: number, alpha: number = -Infinity, beta: number = Infinity): any {
        const winner = this.game.winner(state);
        if (this.game.isEnd) {
            switch (winner) {
                case 1:
                    this.game.isEnd = false;
                    return { bestScore: Infinity };
                case -1:
                    this.game.isEnd = false;
                    return { bestScore: -Infinity };
                case 0:
                default:
                    this.game.isEnd = false;
                    return { bestScore: 0 };
            }
        }

        if (depth <= 0) {
            const score = this.game.getScore(state);
            return { bestScore: score };
        }

        const possibleMoves: number[][] = this.game.getPossibleMoves(state);
        let bestScore;
        let bestMove = possibleMoves[0];

        if (state.player === 1) {
            bestScore = -Infinity;
            for (let i = 0; i < possibleMoves.length; i++) {
                const move = possibleMoves[i];
                const newState = this.game.updateState(state, move);
                const minimax = this.minimax(newState, depth - 1, alpha, beta);
                const score = minimax.bestScore;
                if (score > bestScore) {
                    bestMove = move;
                    bestScore = score;
                }
                alpha = Math.max(bestScore, alpha);
                if (alpha >= beta) {
                    break;
                }
            }
        } else if (state.player === -1) {
            bestScore = Infinity;
            for (let i = 0; i < possibleMoves.length; i++) {
                const move = possibleMoves[i];
                const newState = this.game.updateState(state, move);
                const score = this.minimax(newState, depth - 1, alpha, beta).bestScore;
                if (score < bestScore) {
                    bestMove = move;
                    bestScore = score;
                }
                beta = Math.min(bestScore, beta);
                if (alpha >= beta) {
                    break;
                }
            }
        }

        return { bestScore, bestMove };
    }

    findBestMove(state: State, maxDepth = 5): number[] {
        const possibleMoves: number[][] = this.game.getPossibleMoves(state);
        if (possibleMoves.length === 81) {
            return [4, 1, 1];
        }
        const minimax = this.minimax(state, maxDepth, -Infinity, Infinity);
        return minimax.bestMove;
    }
}