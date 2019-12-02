class Move {
    position: number[];

    constructor(position: number[]) {
        this.position = position;
    }

    hash(): string {
        return this.position.join('');
    }
};

export default Move;

export const hashMove = (move): string => move.join('');