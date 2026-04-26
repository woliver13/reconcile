import { describe, it, expect, beforeEach } from 'vitest';
import { Scorer } from './src/scorer';

const WEIGHTS = { EXACT: 100, WHITESPACE: 80, CONTAINS: 30 };

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
});
