import State from "./state";
import Player from "./player";
import HumanPlayer from "./humanPlayer";

const p1: Player = new Player("computer_vm");
const p2: Player = new Player("computer2_vm");

const games = 500000;
const game = new State(p1, p2);
game.play(games);
p1.savePolicy(games);
p2.savePolicy(games);

// const computer: Player = new Player("computer_vm", 0);
// computer.loadPolicy().then(res => {
//     const newGame = new State(computer, new HumanPlayer("Timas"));
//     newGame.playVsAI();
// });