import { array } from "numjs";
import * as fs from 'fs';

class Player {
    name: string;
    expRate: number;
    states: Array<string> = [];
    learningRate: number = 0.5;
    decayGamma: number = 0.9;
    statesValue = {};

    constructor(name: string, expRate: number = 0.3) {
        this.name = name;
        this.expRate = expRate;
    }

    getHash(board, print = false): string {
        board = board.reshape(9 * 3 * 3).tolist().join('');
        return board;
    }

    chooseAction(positions, currentBoard, symbol) {
        let action;
        if(Math.random() <= this.expRate) {
            const index = Math.floor(Math.random() * positions.length);
            action = positions[index];
        } else {
            let valueMax = -999;
            positions.forEach(position => {
                const [x, y, z] = position;
                let nextBoard = JSON.parse(JSON.stringify(currentBoard));
                nextBoard[x][y][z] = symbol;
                const nextBoardHash = this.getHash(array(nextBoard));
                const value = this.statesValue[nextBoardHash] ? this.statesValue[nextBoardHash] : 0;
                if (value >= valueMax) {
                    valueMax = value;
                    action = position;
                }
            });
        }
        return action;
    }

    addState(state) {
        this.states.push(state);
    }

    feedReward(reward: number): void {
        this.states.map(state => {
            if (!this.statesValue[state]) {
                this.statesValue[state] = 0;
            }
            this.statesValue[state] += this.learningRate * (this.decayGamma * reward - this.statesValue[state]);
            reward = this.statesValue[state];
        });
    }

    reset() {
        this.states = [];
    }

    savePolicy(lastRound?: number) {
        fs.writeFileSync(`data/${this.name}`, JSON.stringify(this.statesValue));
        // fs.writeFileSync(`data/${this.name}_log`, `saved rounds: ${lastRound}`);
    }

    loadPolicy() {
        return new Promise(resolve => {
            let buff = '';
            let stream = fs.createReadStream(`data/${this.name}`);

            stream.on('data', _buff => { buff += _buff });
            stream.on('end', () => {
                this.statesValue = JSON.parse(buff.toString());
                resolve(true);
            });
        });
    }
}

export default Player;