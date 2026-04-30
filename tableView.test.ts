import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('src/tableView.ts source conventions', () => {
    let source: string;

    beforeAll(() => {
        source = readFileSync(join(__dirname, 'src', 'tableView.ts'), 'utf8');
    });

    it('TableView constructor does not accept a weights parameter', () => {
        expect(source).not.toMatch(/constructor\s*\([^)]*weights[^)]*\)/);
    });
});
