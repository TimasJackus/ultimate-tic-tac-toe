import { array } from "numjs";
import { db } from './db/db'
import { changes } from "./helpers";
import { sha1 } from 'hash.js';

class Player {
    name: string;
    expRate: number;
    states: Array<string> = [];
    learningRate: number = 0.05;
    decayGamma: number = 1;
    statesValue = {};

    constructor(name: string, expRate: number = 0.3) {
        this.name = name;
        this.expRate = expRate;
    }

    getHash(board): string {
        board = JSON.stringify(board.reshape(9 * 3 * 3));
        return sha1().update(board).digest('hex');
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
            db.ref(this.name).once('value').then(snap => {
                // If exists
                if (lastRound % 2000 === 0) {
                    console.log('Keys count: ', Object.keys(snap.val()).length);
                }
                if(snap.val()) {
                    db.ref(`${this.name}`).update(changes(snap.val(), this.statesValue)).then(() => {
                        if (lastRound) {
                            db.ref(`logs/${this.name}`).set(`lastRound: ${lastRound}`).then(() => {
                                resolve(true);
                            });
                        } else {
                            resolve(true);
                        }
                    });
                } else {
                    db.ref(`${this.name}`).set(this.statesValue).then(() => {
                        if (lastRound) {
                            db.ref(`logs/${this.name}`).set(`lastRound: ${lastRound}`).then(() => {
                                resolve(true);
                            });
                        } else {
                            resolve(true);
                        }
                    });
                }
            });
        });
    }

    loadPolicy() {
        return db.ref(this.name).once('value').then(snap => {
            this.statesValue = snap.val() ? snap.val() : {};
            console.log(Object.keys(this.statesValue).length);
            return true;
        }).catch(err => console.log(err));
    }
}

export default Player;