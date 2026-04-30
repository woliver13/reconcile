import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { TableView } from './src/tableView';
import { ID_PROPERTY } from './src/types';
import type { Item, Candidate } from './src/types';

const matchItem: Item = { [ID_PROPERTY]: 'a1', name: 'Alice', city: 'Boston' };
const candidates: Candidate[] = [
    { [ID_PROPERTY]: 'b1', name: 'Alice', city: 'New York', weights: {} },
];

function render(): HTMLElement {
    const div = document.createElement('div');
    new TableView(div).load(matchItem, candidates, [matchItem], [], []);
    return div;
}

describe('src/tableView.ts source conventions', () => {
    let source: string;

    beforeAll(() => {
        source = readFileSync(join(__dirname, 'src', 'tableView.ts'), 'utf8');
    });

    it('TableView constructor does not accept a weights parameter', () => {
        expect(source).not.toMatch(/constructor\s*\([^)]*weights[^)]*\)/);
    });

    it('does not set table width via inline style', () => {
        expect(source).not.toMatch(/\.style\.width\s*=/);
    });

    it('does not set header row background/color via inline style', () => {
        expect(source).not.toMatch(/\.style\.backgroundColor\s*=\s*['"]#000/);
        expect(source).not.toMatch(/\.style\.color\s*=\s*['"]#fff/);
    });

    it('does not set match row border via inline style', () => {
        expect(source).not.toMatch(/\.style\.borderBottom\s*=/);
    });

    it('does not apply mismatch colors via inline style', () => {
        expect(source).not.toMatch(/\.style\.backgroundColor\s*=\s*mismatch/);
    });
});

describe('TableView DOM — CSS classes instead of inline styles', () => {
    it('table element has class rv-table (not inline width)', () => {
        const table = render().querySelector('table')!;
        expect(table.classList.contains('rv-table')).toBe(true);
        expect(table.style.width).toBe('');
    });

    it('header row has class rv-header-row (not inline background/color)', () => {
        const headerRow = render().querySelector('thead tr')!;
        expect(headerRow.classList.contains('rv-header-row')).toBe(true);
        expect((headerRow as HTMLElement).style.backgroundColor).toBe('');
        expect((headerRow as HTMLElement).style.color).toBe('');
    });

    it('match item row has class rv-match-row (not inline border-bottom)', () => {
        const matchRow = render().querySelector('tbody tr')!;
        expect(matchRow.classList.contains('rv-match-row')).toBe(true);
        expect((matchRow as HTMLElement).style.borderBottom).toBe('');
    });

    it('mismatch cells have a rv-mismatch-N class (not inline backgroundColor)', () => {
        const container = render();
        // 'city' differs (Boston vs New York) — that cell should carry a mismatch class
        const cells = Array.from(container.querySelectorAll('tbody td')) as HTMLElement[];
        const mismatchCell = cells.find(td => /rv-mismatch-\d/.test(td.className))!;
        expect(mismatchCell).toBeDefined();
        expect(mismatchCell.style.backgroundColor).toBe('');
    });
});
