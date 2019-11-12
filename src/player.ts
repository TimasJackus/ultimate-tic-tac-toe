import { array } from "numjs";
import * as fs from 'fs';
import { db } from './db/db'

class Player {
    name: string;
    expRate: number;
    states: Array<string> = [];
    learningRate: number = 0.5;
    decayGamma: number = 0.9;
    statesValue = {};

    constructor(name: string, expRate: number = 0.25) {
        this.name = name;
        this.expRate = expRate;
    }

    getHash(board): string {
        board = JSON.stringify(board.reshape(9 * 3 * 3));
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
        this.states.reverse().map(state => {
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

    async savePolicy(lastRound?: number) {
        return new Promise(async resolve => {
            await db.ref(`agents/${this.name}`).set(this.statesValue).catch(err => console.log(err));

            if (lastRound) {
                await db.ref(`logs/${this.name}`).set(`lastRound: ${lastRound}`).catch(err => console.log(err));
                // fs.writeFileSync(`data/log`, 'last round: ' + JSON.stringify(lastRound));
            }
            resolve(true);
        });
    }

    loadPolicy() {
        return db.ref(this.name).once('value').then(snap => {
            this.statesValue = snap.val();
            console.log('loaded');
            return true;
        });
        // return new Promise(resolve => {
        //     let buff = '';
        //     let stream = fs.createReadStream(`data/${this.name}`);

        //     stream.on('data', _buff => { buff += _buff });
        //     stream.on('end', () => {
        //         this.statesValue = JSON.parse(buff.toString());
        //         console.log('loaded');
        //         resolve(true);
        //     });
        // });
    }
}

export default Player;