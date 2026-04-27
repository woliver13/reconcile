import { describe, it, expect, beforeEach } from 'vitest';
import { Scorer } from './src/scorer';

const WEIGHTS = { EXACT: 100, WHITESPACE: 80, NICKNAME: 60, CONTAINS: 30, TRANSPOSITION: 20 };

describe('Scorer', () => {
    let scorer;
    beforeEach(() => { scorer = new Scorer(WEIGHTS); });

    describe('getWeight()', () => {
        it('returns EXACT weight when values are identical', () => {
            expect(scorer.getWeight('Alice', 'Alice')).toBe(100);
        });

        it('returns WHITESPACE weight when values match after stripping whitespace', () => {
            expect(scorer.getWeight('John Smith', 'JohnSmith')).toBe(80);
        });

        it('returns CONTAINS weight when one value is a substring of the other', () => {
            expect(scorer.getWeight('Anders', 'Anderson')).toBe(30);
        });

        it('returns 0 when first value is null', () => {
            expect(scorer.getWeight(null, 'Alice')).toBe(0);
        });

        it('returns 0 when second value is null', () => {
            expect(scorer.getWeight('Alice', null)).toBe(0);
        });

        it('returns 0 when values share no match', () => {
            expect(scorer.getWeight('Alice', 'Bob')).toBe(0);
        });

        it('returns TRANSPOSITION weight for a single adjacent character swap', () => {
            expect(scorer.getWeight('Oliver', 'Oilver')).toBe(20);
        });

        it('returns TRANSPOSITION weight when normalised strings differ by one adjacent swap', () => {
            expect(scorer.getWeight('Oli ver', 'Oilver')).toBe(20);
        });

        it('returns 0 when strings differ by more than one adjacent swap', () => {
            expect(scorer.getWeight('Abcd', 'Badc')).toBe(0);
        });
    });

    describe('isNickname()', () => {
        it('returns true for Nick / Nicholas', () => {
            expect(scorer.isNickname('Nick', 'Nicholas')).toBe(true);
        });

        it('is case-insensitive', () => {
            expect(scorer.isNickname('nick', 'NICHOLAS')).toBe(true);
        });

        it('returns true for Bill / William', () => {
            expect(scorer.isNickname('Bill', 'William')).toBe(true);
        });

        it('returns true for Bob / Robert', () => {
            expect(scorer.isNickname('Bob', 'Robert')).toBe(true);
        });

        it('returns true for Jim / James', () => {
            expect(scorer.isNickname('Jim', 'James')).toBe(true);
        });

        it('returns true for Kate / Katherine', () => {
            expect(scorer.isNickname('Kate', 'Katherine')).toBe(true);
        });

        it('returns false for names in different groups', () => {
            expect(scorer.isNickname('Nick', 'William')).toBe(false);
        });

        it('returns false for unknown names', () => {
            expect(scorer.isNickname('Barnabas', 'Ignatius')).toBe(false);
        });

        it('returns true for Peggy / Margaret (community dataset)', () => {
            expect(scorer.isNickname('Peggy', 'Margaret')).toBe(true);
        });

        it('returns true for Chuck / Charles (community dataset)', () => {
            expect(scorer.isNickname('Chuck', 'Charles')).toBe(true);
        });

        it('dataset contains significantly more than the original 5 groups', () => {
            const pairs = [
                ['PEGGY', 'MARGARET'], ['CHUCK', 'CHARLES'], ['CINDY', 'CYNTHIA'],
                ['HANK', 'HENRY'], ['PATTY', 'PATRICIA'], ['SANDY', 'SANDRA'],
            ];
            const matched = pairs.filter(([a, b]) => scorer.isNickname(a, b)).length;
            expect(matched).toBe(pairs.length);
        });
    });

    describe('getWeight() — NICKNAME priority', () => {
        it('returns NICKNAME weight (60) for Nick / Nicholas', () => {
            expect(scorer.getWeight('Nick', 'Nicholas')).toBe(60);
        });

        it('NICKNAME scores higher than CONTAINS', () => {
            expect(scorer.getWeight('Nick', 'Nicholas')).toBeGreaterThan(scorer.getWeight('Anders', 'Anderson'));
        });
    });

    describe('isSameWs()', () => {
        it('returns true when strings are equal after removing whitespace and uppercasing', () => {
            expect(scorer.isSameWs('John Smith', 'JohnSmith')).toBe(true);
        });

        it('returns true when case differs', () => {
            expect(scorer.isSameWs('john smith', 'JOHNSMITH')).toBe(true);
        });

        it('returns false when strings differ beyond whitespace', () => {
            expect(scorer.isSameWs('Alice', 'Bob')).toBe(false);
        });
    });

    describe('doesContain()', () => {
        it('returns true when first value contains second', () => {
            expect(scorer.doesContain('Anderson', 'Anders')).toBe(true);
        });

        it('returns true when second value contains first', () => {
            expect(scorer.doesContain('Anders', 'Anderson')).toBe(true);
        });

        it('is case-insensitive', () => {
            expect(scorer.doesContain('anderson', 'ANDERS')).toBe(true);
        });

        it('returns false when neither contains the other', () => {
            expect(scorer.doesContain('Alice', 'Bob')).toBe(false);
        });
    });

    describe('getCandidates()', () => {
        it('returns a Candidate with per-field weights and a matchTotal', () => {
            const matchItem = { id: '1', name: 'Alice' };
            const list = [{ id: 'X', name: 'Alice' }];
            const [c] = scorer.getCandidates(matchItem, list);
            expect(c.weights.name).toBe(100);
            expect(c.weights.matchTotal).toBe(100);
        });

        it('preserves original fields on the returned candidate', () => {
            const matchItem = { id: '1', name: 'Alice' };
            const list = [{ id: 'X', name: 'Alice' }];
            const [c] = scorer.getCandidates(matchItem, list);
            expect(c.id).toBe('X');
            expect(c.name).toBe('Alice');
        });

        it('excludes items with zero matchTotal', () => {
            const matchItem = { id: '1', name: 'Alice' };
            const list = [{ id: 'X', name: 'Bob' }];
            expect(scorer.getCandidates(matchItem, list)).toEqual([]);
        });

        it('sorts candidates by matchTotal descending', () => {
            const matchItem = { id: '1', name: 'Alice', city: 'Paris' };
            const list = [
                { id: 'X', name: 'Alice', city: 'London' },
                { id: 'Y', name: 'Alice', city: 'Paris'  },
            ];
            const ids = scorer.getCandidates(matchItem, list).map(c => c.id);
            expect(ids).toEqual(['Y', 'X']);
        });

        it('returns empty array when matchItem is null', () => {
            expect(scorer.getCandidates(null, [{ id: 'X', name: 'Alice' }])).toEqual([]);
        });
    });

    describe('per-column weights', () => {
        it('uses column-specific EXACT weight when provided', () => {
            const scorer = new Scorer(WEIGHTS, { name: { EXACT: 200 } });
            const matchItem = { id: '1', name: 'Alice' };
            const list = [{ id: 'X', name: 'Alice' }];
            const [c] = scorer.getCandidates(matchItem, list);
            expect(c.weights.name).toBe(200);
        });

        it('falls back to global weights for columns without overrides', () => {
            const scorer = new Scorer(WEIGHTS, { name: { EXACT: 200 } });
            const matchItem = { id: '1', name: 'Alice', city: 'Paris' };
            const list = [{ id: 'X', name: 'Alice', city: 'Paris' }];
            const [c] = scorer.getCandidates(matchItem, list);
            expect(c.weights.city).toBe(100);
        });

        it('uses column-specific CONTAINS weight in isolation', () => {
            const scorer = new Scorer(WEIGHTS, { name: { CONTAINS: 50 } });
            const matchItem = { id: '1', name: 'Anders' };
            const list = [{ id: 'X', name: 'Anderson' }];
            const [c] = scorer.getCandidates(matchItem, list);
            expect(c.weights.name).toBe(50);
        });

        it('reflects column weight override in matchTotal', () => {
            const scorer = new Scorer(WEIGHTS, { name: { EXACT: 200 } });
            const matchItem = { id: '1', name: 'Alice', city: 'Paris' };
            const list = [{ id: 'X', name: 'Alice', city: 'Paris' }];
            const [c] = scorer.getCandidates(matchItem, list);
            expect(c.weights.matchTotal).toBe(300); // 200 (name) + 100 (city)
        });

        it('behaves identically to global weights when no column overrides given', () => {
            const scorer = new Scorer(WEIGHTS);
            const matchItem = { id: '1', name: 'Alice' };
            const list = [{ id: 'X', name: 'Alice' }];
            const [c] = scorer.getCandidates(matchItem, list);
            expect(c.weights.name).toBe(100);
        });
    });
});
