import State from "./state";
import Player from "./player";
// import HumanPlayer from "./humanPlayer";

const p1: Player = new Player("vmOne");
const p2: Player = new Player("vmTwo");

const games = 50;
const game = new State(p1, p2);

const train = (current: number, max: number) => {
    if (current < max) {
        game.play(games, 1000);
        Promise.all([p1.savePolicy(games * (current + 1)), p2.savePolicy(games * (current + 1))]).then(() => {
            console.log('Epoch ', current, 'saved.');
            current++;
            train(current, max);
        });
    }
};

Promise.all([p1.loadPolicy(), p2.loadPolicy()]).then(res => {
    console.log('loaded');
    train(0, 10000);
});

// const computer: Player = new Player("computer_vm", 0);
// computer.loadPolicy().then(res => {
//     console.log('loaded');
//     const newGame = new State(computer, new HumanPlayer("Timas"));
//     newGame.playVsAI();
// });
