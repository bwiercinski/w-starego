import {ActorRef} from "js-actor";
import * as _ from 'lodash';

export interface BoardPosition {
    row: number;
    column: number;
}

export class Board {
    readonly board: number[][];
    readonly size: number;

    constructor(obj: number | number[][] | Board) {
        if (obj instanceof Array) {
            this.board = _.cloneDeep(obj);
            this.size = this.board.length;
        } else if (obj instanceof Board) {
            this.board = _.cloneDeep(obj.board);
            this.size = this.board.length;
        } else {
            this.size = obj;
            this.board = new Array(this.size).fill(0).map(() => new Array(this.size).fill(-1));
        }
    }

    getCell(row: number, column: number): number {
        return this.board[row][column];
    }

    setCell(row: number, column: number, value: number): void {
        this.board[row][column] = value;
    }

    getCellByPosition(position: BoardPosition): number {
        return this.board[position.row][position.column];
    }

    setCellByPosition(position: BoardPosition, value: number): void {
        if (position) {
            this.board[position.row][position.column] = value;
        }
    }

    isFree(row: number, column: number): boolean {
        return this.getCell(row, column) === -1;
    }

    isFreeByPosition(position: BoardPosition): boolean {
        return this.getCellByPosition(position) === -1;
    }

    isFilled(): boolean {
        return !this.board.some(row => row.some(cell => cell === -1))
    }

    givingPoints(row: number, column: number): number {
        if (!this.isFree(row, column)) return null;
        let points = 0;

        let freeFoundCount = 0;
        let diff = 0;

        while (diff < this.size && freeFoundCount <= 1) {
            if (this.board[row][diff] === -1) freeFoundCount++;
            diff++;
        }
        if (freeFoundCount <= 1) {
            points += this.size; // row
        }

        freeFoundCount = 0;
        diff = 0;
        while (diff < this.size && freeFoundCount <= 1) {
            if (this.board[diff][column] === -1) freeFoundCount++;
            diff++;
        }
        if (freeFoundCount <= 1) {
            points += this.size; // column
        }

        // increasing diagonal
        let diff1 = 1;
        let diff2 = 1;
        let freeFound = false;
        while (!freeFound && row + diff1 < this.size && column - diff1 >= 0) {
            if (this.board[row + diff1][column - diff1] === -1) {
                freeFound = true;
            }
            diff1++;
        }
        while (!freeFound && row - diff2 >= 0 && column + diff2 < this.size) {
            if (this.board[row - diff2][column + diff2] === -1) {
                freeFound = true;
            }
            diff2++;
        }
        if (!freeFound) {
            let diagonal = diff1 + diff2 - 1;
            points += diagonal >= 2 ? diagonal : 0;
        }
        // decreasing diagonal
        diff1 = 1;
        diff2 = 1;
        freeFound = false;
        while (!freeFound && row - diff1 >= 0 && column - diff1 >= 0) {
            if (this.board[row - diff1][column - diff1] === -1) {
                freeFound = true;
            }
            diff1++;
        }
        while (!freeFound && row + diff2 < this.size && column + diff2 < this.size) {
            if (this.board[row + diff2][column + diff2] === -1) {
                freeFound = true;
            }
            diff2++;
        }
        if (!freeFound) {
            let diagonal = diff1 + diff2 - 1;
            points += diagonal >= 2 ? diagonal : 0;
        }
        return points;
    }

    givingPointsByPosition(position: BoardPosition): number {
        return this.givingPoints(position.row, position.column);
    }
}

export class GameState {
    size: number;
    board: Board;
    players: Player[];
    nextPlayer: number;

    constructor(size: number, players: Player[]) {
        this.size = size;
        this.board = new Board(this.size);
        this.players = players;
        this.nextPlayer = 0;
    }
}

export interface AiWeightState {
    position?: BoardPosition;
    board?: Board;
    nextPlayer?: number;
}

export interface AiOrderState {
    positions?: BoardPosition[];
    size?: number;
}

export interface GameConfig {
    size: number;
    players: Player[];
}

export enum PlayerType {
    HUMAN, MINMAX, MINMAX_AB, RANDOM,
    HEURISTICS_DIFF_LDO,
    HEURISTICS_CORNERS_LDO,
    HEURISTICS_CIRCLE_LDO,
    HEURISTICS_DIFF_MF,
    HEURISTICS_CORNERS_MF,
    HEURISTICS_CIRCLE_MF
}

export interface Player {
    name?: string;
    type?: PlayerType;
    playerPoints?: number;
    actor?: ActorRef;
}
