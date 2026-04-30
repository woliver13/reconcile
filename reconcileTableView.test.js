import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TableView } from './src/tableView';

function makeContainer() {
    return document.createElement('div');
}

describe('TableView', () => {
    describe('constructor', () => {
        it('can be constructed with a container element', () => {
            const view = new TableView(makeContainer());
            expect(view).toBeDefined();
        });
    });

    describe('load()', () => {
        let container, view;

        beforeEach(() => {
            container = makeContainer();
            view = new TableView(container);
        });

        const matchItem = { id: '0', name: 'Alice' };
        const twoCandidates = [
            { id: '1', name: 'Alice', weights: { name: 100, matchTotal: 100 } },
            { id: '2', name: 'Bob',   weights: { name: 30,  matchTotal: 30  } },
        ];

        it('renders Match buttons into the container', () => {
            view.load(matchItem, twoCandidates, [matchItem], [], []);
            const buttons = Array.from(container.querySelectorAll('button')).filter(b => b.textContent === 'Match');
            expect(buttons.length).toBe(2);
        });

        it('assigns accesskey="m" to the first candidate Match button', () => {
            view.load(matchItem, twoCandidates, [matchItem], [], []);
            const matchButtons = Array.from(container.querySelectorAll('button')).filter(b => b.textContent === 'Match');
            expect(matchButtons[0].getAttribute('accesskey')).toBe('m');
        });

        it('does not assign accesskey="m" to subsequent candidate Match buttons', () => {
            view.load(matchItem, twoCandidates, [matchItem], [], []);
            const matchButtons = Array.from(container.querySelectorAll('button')).filter(b => b.textContent === 'Match');
            expect(matchButtons[1].getAttribute('accesskey')).toBeNull();
        });

        it('assigns accesskey="m" when there is exactly one candidate', () => {
            const oneCandidate = [{ id: '1', name: 'Alice', weights: { name: 100, matchTotal: 100 } }];
            view.load(matchItem, oneCandidate, [matchItem], [], []);
            const matchButtons = Array.from(container.querySelectorAll('button')).filter(b => b.textContent === 'Match');
            expect(matchButtons.length).toBe(1);
            expect(matchButtons[0].getAttribute('accesskey')).toBe('m');
        });

        it('sets data-a and data-b on each Match button', () => {
            view.load(matchItem, twoCandidates, [matchItem], [], []);
            const matchButtons = Array.from(container.querySelectorAll('button')).filter(b => b.textContent === 'Match');
            expect(matchButtons[0].getAttribute('data-a')).toBe('0');
            expect(matchButtons[0].getAttribute('data-b')).toBe('1');
            expect(matchButtons[1].getAttribute('data-a')).toBe('0');
            expect(matchButtons[1].getAttribute('data-b')).toBe('2');
        });

        it('disables the Undo button when memento is empty', () => {
            view.load(matchItem, twoCandidates, [matchItem], [], []);
            const undoBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'Undo');
            expect(undoBtn.disabled).toBe(true);
        });

        it('labels the no-match button "No Match"', () => {
            view.load(matchItem, twoCandidates, [matchItem], [], []);
            const noMatchBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'No Match');
            expect(noMatchBtn).toBeDefined();
        });

        it('assigns accesskey="n" to the No Match button', () => {
            view.load(matchItem, twoCandidates, [matchItem], [], []);
            const noMatchBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'No Match');
            expect(noMatchBtn?.getAttribute('accesskey')).toBe('n');
        });

        it('enables the Undo button when memento has entries', () => {
            const memento = [{ a: { id: '0', name: 'Alice' }, b: { id: '1', name: 'Alice' } }];
            view.load(matchItem, twoCandidates, [matchItem], [], memento);
            const undoBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'Undo');
            expect(undoBtn.disabled).toBe(false);
        });

        it('clears the container on subsequent load() calls', () => {
            view.load(matchItem, twoCandidates, [matchItem], [], []);
            view.load(matchItem, twoCandidates, [matchItem], [], []);
            const matchButtons = Array.from(container.querySelectorAll('button')).filter(b => b.textContent === 'Match');
            expect(matchButtons.length).toBe(2);
        });

        it('renders a table element', () => {
            view.load(matchItem, twoCandidates, [matchItem], [], []);
            expect(container.querySelector('table')).not.toBeNull();
        });

        it('renders header fields as th elements inside thead', () => {
            view.load(matchItem, twoCandidates, [matchItem], [], []);
            const ths = container.querySelectorAll('thead th');
            const texts = Array.from(ths).map(th => th.textContent);
            expect(texts).toContain('name');
        });

        it('renders data cells as td elements inside tbody', () => {
            view.load(matchItem, twoCandidates, [matchItem], [], []);
            expect(container.querySelectorAll('tbody td').length).toBeGreaterThan(0);
        });

        it('applies a bottom border to the System A row to separate it from candidates', () => {
            view.load(matchItem, twoCandidates, [matchItem], [], []);
            const systemARow = container.querySelectorAll('tbody tr')[0];
            expect(systemARow.style.borderBottom).not.toBe('');
        });

        it('does not render div.row or div.col elements', () => {
            view.load(matchItem, twoCandidates, [matchItem], [], []);
            expect(container.querySelectorAll('.row').length).toBe(0);
            expect(container.querySelectorAll('.col').length).toBe(0);
        });

        it('labels the previous button "Previous"', () => {
            view.load(matchItem, twoCandidates, [matchItem], [], []);
            const prevBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'Previous');
            expect(prevBtn).toBeDefined();
        });

        it('does not render a button labelled "Prev"', () => {
            view.load(matchItem, twoCandidates, [matchItem], [], []);
            const prevBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'Prev');
            expect(prevBtn).toBeUndefined();
        });

        it('gives the No Match button a btn-warning class', () => {
            view.load(matchItem, twoCandidates, [matchItem], [], []);
            const btn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'No Match');
            expect(btn?.classList.contains('btn-warning')).toBe(true);
        });

        it('gives the Previous button a btn-secondary class', () => {
            view.load(matchItem, twoCandidates, [matchItem], [], []);
            const btn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'Previous');
            expect(btn?.classList.contains('btn-secondary')).toBe(true);
        });

        it('gives the Undo button a btn-secondary class', () => {
            view.load(matchItem, twoCandidates, [matchItem], [], []);
            const btn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'Undo');
            expect(btn?.classList.contains('btn-secondary')).toBe(true);
        });

        it('gives each Match button a btn-success class', () => {
            view.load(matchItem, twoCandidates, [matchItem], [], []);
            const matchBtns = Array.from(container.querySelectorAll('button')).filter(b => b.textContent === 'Match');
            expect(matchBtns.length).toBeGreaterThan(0);
            matchBtns.forEach(btn => expect(btn.classList.contains('btn-success')).toBe(true));
        });

        it('renders Previous button outside the table', () => {
            view.load(matchItem, twoCandidates, [matchItem], [], []);
            const prevInsideTable = container.querySelector('table button[accesskey="p"]');
            expect(prevInsideTable).toBeNull();
            const prevOutside = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'Previous');
            expect(prevOutside).toBeDefined();
        });

        it('renders Undo button outside the table', () => {
            view.load(matchItem, twoCandidates, [matchItem], [], []);
            const undoInsideTable = container.querySelector('table button[accesskey="u"]');
            expect(undoInsideTable).toBeNull();
            const undoOutside = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'Undo');
            expect(undoOutside).toBeDefined();
        });

        it('keeps No Match button inside the table', () => {
            view.load(matchItem, twoCandidates, [matchItem], [], []);
            const noMatchInsideTable = container.querySelector('table button[accesskey="n"]');
            expect(noMatchInsideTable).not.toBeNull();
        });
    });

    describe('event dispatch', () => {
        let container, view;
        const matchItem = { id: '0', name: 'Alice' };
        const candidates = [
            { id: '1', name: 'Alice', weights: { name: 100, matchTotal: 100 } },
            { id: '2', name: 'Bob',   weights: { name: 30,  matchTotal: 30  } },
        ];

        beforeEach(() => {
            container = makeContainer();
            view = new TableView(container);
            view.load(matchItem, candidates, [matchItem], [], []);
        });

        function btn(label) {
            return Array.from(container.querySelectorAll('button')).find(b => b.textContent === label);
        }

        it('clicking No Match dispatches a "next" action', () => {
            const listener = vi.fn();
            view.onAction('next', listener);
            btn('No Match').click();
            expect(listener).toHaveBeenCalledOnce();
            expect(listener).toHaveBeenCalledWith({ type: 'next' });
        });

        it('clicking Previous dispatches a "prev" action', () => {
            const listener = vi.fn();
            view.onAction('prev', listener);
            btn('Previous').click();
            expect(listener).toHaveBeenCalledOnce();
            expect(listener).toHaveBeenCalledWith({ type: 'prev' });
        });

        it('clicking Undo dispatches an "undo" action', () => {
            const memento = [{ a: matchItem, b: candidates[0] }];
            container = makeContainer();
            view = new TableView(container);
            view.load(matchItem, candidates, [matchItem], [], memento);
            const listener = vi.fn();
            view.onAction('undo', listener);
            btn('Undo').click();
            expect(listener).toHaveBeenCalledOnce();
            expect(listener).toHaveBeenCalledWith({ type: 'undo' });
        });

        it('clicking a Match button dispatches a "match" action', () => {
            const listener = vi.fn();
            view.onAction('match', listener);
            const matchBtns = Array.from(container.querySelectorAll('button')).filter(b => b.textContent === 'Match');
            matchBtns[0].click();
            expect(listener).toHaveBeenCalledOnce();
        });

        it('match action carries the correct a and b IDs', () => {
            const listener = vi.fn();
            view.onAction('match', listener);
            const matchBtns = Array.from(container.querySelectorAll('button')).filter(b => b.textContent === 'Match');
            matchBtns[0].click();
            expect(listener).toHaveBeenCalledWith({ type: 'match', a: '0', b: '1' });
        });

        it('second Match button carries the correct b ID', () => {
            const listener = vi.fn();
            view.onAction('match', listener);
            const matchBtns = Array.from(container.querySelectorAll('button')).filter(b => b.textContent === 'Match');
            matchBtns[1].click();
            expect(listener).toHaveBeenCalledWith({ type: 'match', a: '0', b: '2' });
        });

        it('multiple listeners on the same action type are all called', () => {
            const l1 = vi.fn();
            const l2 = vi.fn();
            view.onAction('next', l1);
            view.onAction('next', l2);
            btn('No Match').click();
            expect(l1).toHaveBeenCalledOnce();
            expect(l2).toHaveBeenCalledOnce();
        });
    });

    describe('per-column mismatch coloring', () => {
        let container, view;

        beforeEach(() => {
            container = makeContainer();
            view = new TableView(container);
        });

        const multiItem = { id: '0', name: 'Alice', city: 'NYC' };

        const candidatesCityMismatch = [
            { id: '1', name: 'Alice', city: 'LA', weights: { name: 100, city: 0, matchTotal: 100 } },
        ];
        const candidatesAllMatch = [
            { id: '1', name: 'Alice', city: 'NYC', weights: { name: 100, city: 100, matchTotal: 200 } },
        ];
        const candidatesBothMismatch = [
            { id: '1', name: 'Bob', city: 'LA', weights: { name: 0, city: 0, matchTotal: 0 } },
        ];

        function getRows() { return container.querySelectorAll('tr'); }
        function cellByText(row, text) {
            return Array.from(row.querySelectorAll('td, th')).find(c => c.textContent === text);
        }

        it('does not apply scorer CSS classes', () => {
            view.load(multiItem, candidatesCityMismatch, [multiItem], [], []);
            expect(container.querySelectorAll('.match-same').length).toBe(0);
            expect(container.querySelectorAll('.match-samews').length).toBe(0);
            expect(container.querySelectorAll('.match-contains').length).toBe(0);
        });

        it('applies a background color to the System A cell for a mismatching column', () => {
            view.load(multiItem, candidatesCityMismatch, [multiItem], [], []);
            const systemARow = getRows()[1]; // 0=header, 1=SystemA, 2+=candidates
            const cityCell = cellByText(systemARow, 'NYC');
            expect(cityCell.style.backgroundColor).not.toBe('');
        });

        it('does not apply background color to the System A cell for a non-mismatching column', () => {
            view.load(multiItem, candidatesCityMismatch, [multiItem], [], []);
            const systemARow = getRows()[1];
            const nameCell = cellByText(systemARow, 'Alice');
            expect(nameCell.style.backgroundColor).toBe('');
        });

        it('applies the same color to non-matching System B cells in the same column', () => {
            view.load(multiItem, candidatesCityMismatch, [multiItem], [], []);
            const rows = getRows();
            const systemARow = rows[1];  // 0=header, 1=SystemA, 2+=candidates
            const candidateRow = rows[2];
            const systemACityColor = cellByText(systemARow, 'NYC').style.backgroundColor;
            const candidateCityColor = cellByText(candidateRow, 'LA').style.backgroundColor;
            expect(candidateCityColor).toBe(systemACityColor);
        });

        it('does not apply background color to matching System B cells', () => {
            view.load(multiItem, candidatesCityMismatch, [multiItem], [], []);
            const candidateRow = getRows()[2];
            const nameCell = cellByText(candidateRow, 'Alice');
            expect(nameCell.style.backgroundColor).toBe('');
        });

        it('applies no background color when all columns match', () => {
            view.load(multiItem, candidatesAllMatch, [multiItem], [], []);
            const systemARow = getRows()[1];
            const dataCells = Array.from(systemARow.querySelectorAll('td'))
                .filter(c => c.querySelector('button') === null);
            for (const cell of dataCells) {
                expect(cell.style.backgroundColor).toBe('');
            }
        });

        it('assigns distinct colors to different mismatching columns', () => {
            view.load(multiItem, candidatesBothMismatch, [multiItem], [], []);
            const systemARow = getRows()[1];
            const nameColor = cellByText(systemARow, 'Alice').style.backgroundColor;
            const cityColor = cellByText(systemARow, 'NYC').style.backgroundColor;
            expect(nameColor).not.toBe('');
            expect(cityColor).not.toBe('');
            expect(nameColor).not.toBe(cityColor);
        });
    });
});
