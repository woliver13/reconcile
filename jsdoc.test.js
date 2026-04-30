import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('JSDoc coverage', () => {
    let types, scorer, buildNicknames;

    beforeAll(() => {
        types = readFileSync(join(__dirname, 'src/types.ts'), 'utf8');
        scorer = readFileSync(join(__dirname, 'src/scorer.ts'), 'utf8');
        buildNicknames = readFileSync(join(__dirname, 'build-nicknames.mjs'), 'utf8');
    });

    describe('IService', () => {
        it('documents load()', () => {
            expect(types).toMatch(/IService[\s\S]*?@returns[\s\S]*?load\(\)/);
        });

        it('documents set()', () => {
            expect(types).toMatch(/IService[\s\S]*?@param[\s\S]*?set\(/);
        });

        it('documents undo()', () => {
            expect(types).toMatch(/IService[\s\S]*?@param[\s\S]*?undo\(/);
        });
    });

    describe('IView', () => {
        it('documents load()', () => {
            expect(types).toMatch(/IView[\s\S]*?@param[\s\S]*?load\(/);
        });

        it('documents showError()', () => {
            expect(types).toMatch(/IView[\s\S]*?@param[\s\S]*?showError\(/);
        });

        it('documents onAction()', () => {
            expect(types).toMatch(/IView[\s\S]*?@param[\s\S]*?onAction\(/);
        });
    });

    describe('Scorer', () => {
        it('documents getCandidates() with @param', () => {
            expect(scorer).toMatch(/@param[\s\S]*?getCandidates\(/);
        });

        it('documents getCandidates() with @returns', () => {
            expect(scorer).toMatch(/@returns[\s\S]*?getCandidates\(/);
        });

        it('documents getWeight() with @param', () => {
            expect(scorer).toMatch(/@param[\s\S]*?getWeight\(/);
        });

        it('documents getWeight() with @returns', () => {
            expect(scorer).toMatch(/@returns[\s\S]*?getWeight\(/);
        });
    });

    describe('build-nicknames.mjs GROUPS array', () => {
        it('documents the expected element format with @type', () => {
            expect(buildNicknames).toMatch(/@type\s*\{string\[\]\[\]\}/);
        });
    });
});
