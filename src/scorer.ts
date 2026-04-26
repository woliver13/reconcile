import { Item, Candidate, Weights } from './types';

export class Scorer {
    constructor(private readonly weights: Weights) {}

    getWeight(cell1: unknown, cell2: unknown): number {
        if (cell1 == null) return 0;
        if (cell2 == null) return 0;
        if (cell1 === cell2) return this.weights.EXACT;
        if (this.isSameWs(cell1, cell2)) return this.weights.WHITESPACE;
        if (this.doesContain(cell1, cell2)) return this.weights.CONTAINS;
        return 0;
    }

    isSameWs(cell1: unknown, cell2: unknown): boolean {
        return String(cell1).toUpperCase().replace(/\s/g, '') === String(cell2).toUpperCase().replace(/\s/g, '');
    }

    doesContain(cell1: unknown, cell2: unknown): boolean {
        const s1 = String(cell1).toUpperCase();
        const s2 = String(cell2).toUpperCase();
        return s1.includes(s2) || s2.includes(s1);
    }

    getCandidates(matchItem: Item, list: Item[]): Candidate[] {
        if (matchItem == null) return [];
        const idProperty = 'id';
        return list.map(item => {
            const candidate: Record<string, unknown> = {};
            const weights: Record<string, number> = {};
            let matchTotal = 0;
            Object.keys(item).forEach(key => {
                candidate[key] = item[key];
                if (key !== idProperty) {
                    weights[key] = this.getWeight(item[key], matchItem[key]);
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
