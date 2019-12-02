class State {
    history;
    board;
    player;
    activeTile: number;

    constructor(board, player, activeTile: number = null) {
        // this.history = history;
        this.board = board;
        this.player = player;
        this.activeTile = activeTile;
    }

    isPlayer(player) {
        return player === this.player;
    }
};

export default State;