import State from "./state";
import Player from "./player";
import HumanPlayer from "./humanPlayer";

const p1: Player = new Player("computer");
const p2: Player = new Player("computer2");

const game = new State(p1, p2);
game.play(10000);

// p1.savePolicy();

// const computer: Player = new Player("computer", 0);
// computer.loadPolicy().then(res => {
//     const newGame = new State(computer, new HumanPlayer("Timas"));
//     newGame.playVsAI();
// });