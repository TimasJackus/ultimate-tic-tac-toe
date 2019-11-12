import State from "./state";
import Player from "./player";
import HumanPlayer from "./humanPlayer";

const p1: Player = new Player("vmOne", 0.3);
const p2: Player = new Player("vmTwo", 0.3);

const games = 100;
const game = new State(p1, p2);

const train = (current: number, max: number) => {
    if (current < max) {
        game.play(games, games + 1);
        Promise.all([p1.savePolicy(games * (current + 1)), p2.savePolicy(games * (current + 1))]).then(() => {
            if ((current + 1) % 5 === 0) {
                console.log(`Epoch ${current + 1} (rounds: ${(current + 1) * games}) saved.`);
            }
            current++;
            train(current, max);
        });
    }
};

Promise.all([p1.loadPolicy(), p2.loadPolicy()]).then(res => {
    console.log('loaded');
    train(0, 500);
});

// const computer: Player = new Player("vmOne", 0);
// computer.loadPolicy().then(res => {
//     console.log('loaded');
//     const newGame = new State(computer, new HumanPlayer("Timas"));
//     newGame.playVsAI();
// });
