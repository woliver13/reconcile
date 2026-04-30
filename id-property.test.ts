import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('ID_PROPERTY constant — single source of truth', () => {
    let types: string;
    let reconciler: string;
    let scorer: string;
    let tableView: string;

    beforeAll(() => {
        types      = readFileSync(join(__dirname, 'src', 'types.ts'),      'utf8');
        reconciler = readFileSync(join(__dirname, 'src', 'reconciler.ts'), 'utf8');
        scorer     = readFileSync(join(__dirname, 'src', 'scorer.ts'),     'utf8');
        tableView  = readFileSync(join(__dirname, 'src', 'tableView.ts'),  'utf8');
    });

    it('types.ts exports ID_PROPERTY', () => {
        expect(types).toMatch(/export\s+const\s+ID_PROPERTY\s*=/);
    });

    it('reconciler.ts imports ID_PROPERTY from types', () => {
        expect(reconciler).toMatch(/ID_PROPERTY/);
    });

    it('reconciler.ts does not declare a local idProperty field', () => {
        expect(reconciler).not.toMatch(/private\s+readonly\s+idProperty\s*=/);
    });

    it('scorer.ts imports ID_PROPERTY from types', () => {
        expect(scorer).toMatch(/ID_PROPERTY/);
    });

    it('scorer.ts does not declare a local idProperty variable', () => {
        expect(scorer).not.toMatch(/const\s+idProperty\s*=/);
    });

    it('tableView.ts imports ID_PROPERTY from types', () => {
        expect(tableView).toMatch(/ID_PROPERTY/);
    });

    it('tableView.ts does not declare a local idProperty field', () => {
        expect(tableView).not.toMatch(/private\s+readonly\s+idProperty\s*=/);
    });
});
