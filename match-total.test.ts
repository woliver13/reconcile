import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('MATCH_TOTAL constant — single source of truth', () => {
    let types: string;
    let scorer: string;
    let tableView: string;

    beforeAll(() => {
        types     = readFileSync(join(__dirname, 'src', 'types.ts'),     'utf8');
        scorer    = readFileSync(join(__dirname, 'src', 'scorer.ts'),    'utf8');
        tableView = readFileSync(join(__dirname, 'src', 'tableView.ts'), 'utf8');
    });

    it('types.ts exports MATCH_TOTAL', () => {
        expect(types).toMatch(/export\s+const\s+MATCH_TOTAL\s*=/);
    });

    it('scorer.ts imports MATCH_TOTAL from types', () => {
        expect(scorer).toMatch(/MATCH_TOTAL/);
    });

    it('scorer.ts does not use the "matchTotal" bracket-access string', () => {
        expect(scorer).not.toMatch(/\['matchTotal'\]/);
    });

    it('tableView.ts imports MATCH_TOTAL from types', () => {
        expect(tableView).toMatch(/MATCH_TOTAL/);
    });

    it('tableView.ts does not use the "matchTotal" bracket-access string', () => {
        expect(tableView).not.toMatch(/\['matchTotal'\]/);
    });
});
