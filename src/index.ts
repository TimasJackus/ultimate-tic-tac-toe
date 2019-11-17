import State from "./state";
import Player from "./player";
import HumanPlayer from "./humanPlayer";

const p1: Player = new Player("vmOne", 0.25);
const p2: Player = new Player("vmTwo", 0.25);

const games = 10000;
const printEvery = 10000;
const game = new State(p1, p2);

Promise.all([p1.loadPolicy(), p2.loadPolicy()]).then(() => {
    game.play(games, printEvery);
    p1.savePolicy();
    p2.savePolicy();
    const computer: Player = new Player("vmOne", 0);
    computer.loadPolicy().then(() => {
        const newGame = new State(computer, new HumanPlayer("Timas"));
        newGame.playVsAI();
    });
});

