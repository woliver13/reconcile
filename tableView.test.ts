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

    it('columnClassCount is a constructor parameter, not a standalone class field', () => {
        // A standalone field ends with `= <value>;` at class body level.
        // A constructor parameter ends with `= <value>,` or `= <value>)`.
        expect(source).not.toMatch(/private\s+readonly\s+columnClassCount\s*=\s*\d+\s*;/);
        expect(source).toMatch(/constructor[\s\S]*?columnClassCount\s*=/);
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

describe('TableView — injectable columnClassCount', () => {
    const matchItemMulti: Item = { [ID_PROPERTY]: 'a1', f1: 'x', f2: 'x', f3: 'x' };
    const candidatesMulti: Candidate[] = [
        { [ID_PROPERTY]: 'b1', f1: 'A', f2: 'B', f3: 'C', weights: {} },
    ];

    function renderWith(columnClassCount: number): HTMLElement {
        const div = document.createElement('div');
        new TableView(div, columnClassCount).load(matchItemMulti, candidatesMulti, [matchItemMulti], [], []);
        return div;
    }

    it('uses the default of 6 CSS classes when no count is passed', () => {
        const div = document.createElement('div');
        new TableView(div).load(matchItem, candidates, [matchItem], [], []);
        const cells = Array.from(div.querySelectorAll('tbody td')) as HTMLElement[];
        const classes = cells.flatMap(td => Array.from(td.classList)).filter(c => /rv-mismatch-\d/.test(c));
        expect(classes.every(c => parseInt(c.replace('rv-mismatch-', '')) < 6)).toBe(true);
    });

    it('cycles mismatch classes within a custom columnClassCount of 2', () => {
        const div = renderWith(2);
        const cells = Array.from(div.querySelectorAll('tbody td')) as HTMLElement[];
        const indices = cells
            .flatMap(td => Array.from(td.classList))
            .filter(c => /rv-mismatch-\d/.test(c))
            .map(c => parseInt(c.replace('rv-mismatch-', '')));
        expect(indices.every(i => i < 2)).toBe(true);
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
