import State from "./state";
import Player from "./player";
// import HumanPlayer from "./humanPlayer";

const p1: Player = new Player("vm_firebase-one");
const p2: Player = new Player("vm_firebase-two");

const games = 500000;
const game = new State(p1, p2);
game.play(games);

// const computer: Player = new Player("computer_vm", 0);
// computer.loadPolicy().then(res => {
//     console.log('loaded');
//     const newGame = new State(computer, new HumanPlayer("Timas"));
//     newGame.playVsAI();
// });