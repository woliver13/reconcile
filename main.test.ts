import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('src/main.ts source conventions', () => {
    let source: string;

    beforeAll(() => {
        source = readFileSync(join(__dirname, 'src', 'main.ts'), 'utf8');
    });

    it('handles the promise returned by reconciler.init() with .catch()', () => {
        expect(source).toMatch(/reconciler\.init\(\)\s*\.catch\(/);
    });

    it('constructs TableView without passing weights', () => {
        expect(source).not.toMatch(/new TableView\s*\([^)]*WEIGHTS[^)]*\)/);
    });
});
