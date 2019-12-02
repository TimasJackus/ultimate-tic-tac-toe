import { hashMove } from "./move";

class MCTSNode {
    parent?;
    move?;
    state?;
    moves?: number;
    wins?: number;
    node?: MCTSNode = null;
    children?: Map<string, any>;

    constructor(parent, move, state, unexpandedMoves) {
        this.move = move;
        this.state = state;
        this.node = null;

        this.moves = 0;
        this.wins = 0;

        this.parent = parent;
        this.children = new Map();

        for (let move of unexpandedMoves) {
            this.children.set(hashMove(move), { move, node: null });
        }
    }

    childNode(move) {
        const child = this.children.get(hashMove(move));
        if (child === undefined) {
            throw new Error("No such move");
        } else if (child.node === null) {
            throw new Error("Child is not expanded");
        }
        return child.node;
    }

    expand(move, childState, unexpandedMoves) {
        if (!this.children.has(hashMove(move))) throw new Error("No such play!")
        let childNode = new MCTSNode(this, move, childState, unexpandedMoves)
        this.children.set(hashMove(move), { move, node: childNode })
        return childNode
    }

    getAllMoves() {
        const moves = [];
        this.children.forEach((child) => {
            moves.push(child.move);
        });
        return moves;
    }

    getUnexpandedMoves() {
        const moves = [];
        this.children.forEach((child) => {
            if (child.node === null) {
                moves.push(child.move);
            }
        });
        return moves;
    }

    isFullyExpanded() {
        let isFullyExpanded = true;
        this.children.forEach((child) => {
            if (child.node === null) {
                isFullyExpanded = false;
            }
        });
        return isFullyExpanded;
    }

    isLeaf() {
        if (this.children.size === 0) {
            return true;
        }
        return false;
    }

    getUCB1(biasParam) {
        return (this.wins / this.moves) + Math.sqrt(biasParam * Math.log(this.parent.moves) / this.moves);
    }
}

export default MCTSNode;