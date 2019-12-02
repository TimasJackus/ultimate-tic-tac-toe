import * as readline from 'readline';
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


class HumanPlayer {
    name: string;

    constructor(name: string = 'Human') {
        this.name = name;
    }

    async chooseAction(positions) {
        return new Promise(async resolve => {
            const tile = await this.chooseTileAction();
            const row = await this.chooseRowAction();
            const col = await this.chooseColAction();
            if (positions.some(arr => JSON.stringify([tile, row, col]) === JSON.stringify(arr))) {
                resolve([tile, row, col]);
                return;
            }
            resolve(this.chooseAction(positions));
            return;
        });
    }

    chooseTileAction() {
        return new Promise(resolve => {
            rl.question('Input your action tile: ', (tile: number | string) => {
                tile = Number(tile);
                if (!isNaN(tile)) {
                    resolve(tile);
                    return tile;;
                }
                resolve(this.chooseTileAction());
                return;
            });
        });
    }    

    chooseRowAction() {
        return new Promise(resolve => {
            rl.question('Input your action row: ', (row: number | string) => {
                row = Number(row);
                if (!isNaN(row)) {
                    resolve(row);
                    return row;;
                }
                resolve(this.chooseRowAction());
                return;
            });
        });
    }

    chooseColAction() {
        return new Promise(resolve => {
            rl.question('Input your action col: ', (col: number | string) => {
                col = Number(col);
                if (!isNaN(col)) {
                    resolve(col);
                    return col;
                }
                resolve(this.chooseColAction());
                return;
            });
        });
    }

    addState(state) { }
    feedReward(reward) { }
    reset() { }
    savePolicy() { }
};

export default HumanPlayer;



export function chooseTileAction() {
    return new Promise(resolve => {
        rl.question('Input your action tile: ', (tile: number | string) => {
            tile = Number(tile);
            if (!isNaN(tile)) {
                resolve(tile);
                return tile;;
            }
            resolve(this.chooseTileAction());
            return;
        });
    });
}    

export function chooseRowAction() {
    return new Promise(resolve => {
        rl.question('Input your action row: ', (row: number | string) => {
            row = Number(row);
            if (!isNaN(row)) {
                resolve(row);
                return row;;
            }
            resolve(this.chooseRowAction());
            return;
        });
    });
}

export function chooseColAction() {
    return new Promise(resolve => {
        rl.question('Input your action col: ', (col: number | string) => {
            col = Number(col);
            if (!isNaN(col)) {
                resolve(col);
                return col;
            }
            resolve(this.chooseColAction());
            return;
        });
    });
}