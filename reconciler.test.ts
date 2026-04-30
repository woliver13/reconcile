import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('src/reconciler.ts source conventions', () => {
    let source: string;

    beforeAll(() => {
        source = readFileSync(join(__dirname, 'src', 'reconciler.ts'), 'utf8');
    });

    it('does not use catch (status) — catch variable must be named error or err', () => {
        expect(source).not.toMatch(/catch\s*\(\s*status\s*\)/);
    });

    it('uses catch (error) for error handling', () => {
        expect(source).toMatch(/catch\s*\(\s*error\s*\)/);
    });
});
