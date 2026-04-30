import { Item, Candidate, Weights, ColumnWeights, ID_PROPERTY } from './types';
import NICKNAME_GROUPS from './nicknames.json';

const NICKNAME_MAP = new Map<string, number>();
(NICKNAME_GROUPS as string[][]).forEach((group, idx) => group.forEach(name => NICKNAME_MAP.set(name, idx)));

export class Scorer {
    constructor(
        private readonly weights: Weights,
        private readonly columnWeights: ColumnWeights = {},
    ) {}

    getWeight(cell1: unknown, cell2: unknown, column?: string): number {
        if (cell1 == null) return 0;
        if (cell2 == null) return 0;
        const w = column ? { ...this.weights, ...this.columnWeights[column] } : this.weights;
        if (cell1 === cell2) return w.EXACT;
        if (this.isSameWs(cell1, cell2)) return w.WHITESPACE;
        if (this.isNickname(cell1, cell2)) return w.NICKNAME;
        if (this.doesContain(cell1, cell2)) return w.CONTAINS;
        if (this.isTransposition(cell1, cell2)) return w.TRANSPOSITION;
        return 0;
    }

    isSameWs(cell1: unknown, cell2: unknown): boolean {
        return String(cell1).toUpperCase().replace(/\s/g, '') === String(cell2).toUpperCase().replace(/\s/g, '');
    }

    isNickname(cell1: unknown, cell2: unknown): boolean {
        const s1 = String(cell1).toUpperCase().replace(/\s/g, '');
        const s2 = String(cell2).toUpperCase().replace(/\s/g, '');
        const g1 = NICKNAME_MAP.get(s1);
        return g1 !== undefined && g1 === NICKNAME_MAP.get(s2);
    }

    isTransposition(cell1: unknown, cell2: unknown): boolean {
        const s1 = String(cell1).toUpperCase().replace(/\s/g, '');
        const s2 = String(cell2).toUpperCase().replace(/\s/g, '');
        if (s1.length !== s2.length) return false;
        let diffs = 0;
        for (let i = 0; i < s1.length; i++) {
            if (s1[i] !== s2[i]) diffs++;
            if (diffs > 2) return false;
        }
        if (diffs !== 2) return false;
        // find the two differing positions and check they are adjacent and swapped
        const pos: number[] = [];
        for (let i = 0; i < s1.length; i++) {
            if (s1[i] !== s2[i]) pos.push(i);
        }
        return pos[1] === pos[0] + 1 && s1[pos[0]] === s2[pos[1]] && s1[pos[1]] === s2[pos[0]];
    }

    doesContain(cell1: unknown, cell2: unknown): boolean {
        const s1 = String(cell1).toUpperCase();
        const s2 = String(cell2).toUpperCase();
        return s1.includes(s2) || s2.includes(s1);
    }

    getCandidates(matchItem: Item, list: Item[]): Candidate[] {
        if (matchItem == null) return [];
        return list.map(item => {
            const candidate: Record<string, unknown> = {};
            const weights: Record<string, number> = {};
            let matchTotal = 0;
            Object.keys(item).forEach(key => {
                candidate[key] = item[key];
                if (key !== ID_PROPERTY) {
                    weights[key] = this.getWeight(item[key], matchItem[key], key);
                    matchTotal += weights[key];
                }
            });
            weights['matchTotal'] = matchTotal;
            candidate['weights'] = weights;
            return candidate as Candidate;
        })
        .filter(item => item.weights['matchTotal'] > 0)
        .sort((a, b) => b.weights['matchTotal'] - a.weights['matchTotal']);
    }
}
