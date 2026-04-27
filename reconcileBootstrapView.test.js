import { describe, it, expect, beforeEach } from 'vitest';
import { BootstrapView } from './src/bootstrapView';

const WEIGHTS = { EXACT: 100, WHITESPACE: 80, CONTAINS: 30 };

function makeContainer() {
    return document.createElement('div');
}

describe('BootstrapView', () => {
    describe('constructor', () => {
        it('can be constructed with a container element and weights', () => {
            const view = new BootstrapView(makeContainer(), WEIGHTS);
            expect(view).toBeDefined();
        });
    });

    describe('load()', () => {
        let container, view;

        beforeEach(() => {
            container = makeContainer();
            view = new BootstrapView(container, WEIGHTS);
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

        it('uses col class on data cells instead of col-md-1', () => {
            view.load(matchItem, twoCandidates, [matchItem], [], []);
            expect(container.querySelectorAll('.col-md-1').length).toBe(0);
            expect(container.querySelectorAll('.col').length).toBeGreaterThan(0);
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
    });

    describe('per-column mismatch coloring', () => {
        let container, view;

        beforeEach(() => {
            container = makeContainer();
            view = new BootstrapView(container, WEIGHTS);
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

        function getRows() { return container.querySelectorAll('.row'); }
        function cellByText(row, text) {
            return Array.from(row.querySelectorAll('.col')).find(c => c.textContent === text);
        }

        it('does not apply scorer CSS classes', () => {
            view.load(multiItem, candidatesCityMismatch, [multiItem], [], []);
            expect(container.querySelectorAll('.match-same').length).toBe(0);
            expect(container.querySelectorAll('.match-samews').length).toBe(0);
            expect(container.querySelectorAll('.match-contains').length).toBe(0);
        });

        it('applies a background color to the System A cell for a mismatching column', () => {
            view.load(multiItem, candidatesCityMismatch, [multiItem], [], []);
            const systemARow = getRows()[0];
            const cityCell = cellByText(systemARow, 'NYC');
            expect(cityCell.style.backgroundColor).not.toBe('');
        });

        it('does not apply background color to the System A cell for a non-mismatching column', () => {
            view.load(multiItem, candidatesCityMismatch, [multiItem], [], []);
            const systemARow = getRows()[0];
            const nameCell = cellByText(systemARow, 'Alice');
            expect(nameCell.style.backgroundColor).toBe('');
        });

        it('applies the same color to non-matching System B cells in the same column', () => {
            view.load(multiItem, candidatesCityMismatch, [multiItem], [], []);
            const rows = getRows();
            const systemARow = rows[0];
            const candidateRow = rows[2]; // 0=SystemA, 1=Header, 2=first candidate
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
            const systemARow = getRows()[0];
            const dataCells = Array.from(systemARow.querySelectorAll('.col'))
                .filter(c => c.querySelector('button') === null);
            for (const cell of dataCells) {
                expect(cell.style.backgroundColor).toBe('');
            }
        });

        it('assigns distinct colors to different mismatching columns', () => {
            view.load(multiItem, candidatesBothMismatch, [multiItem], [], []);
            const systemARow = getRows()[0];
            const nameColor = cellByText(systemARow, 'Alice').style.backgroundColor;
            const cityColor = cellByText(systemARow, 'NYC').style.backgroundColor;
            expect(nameColor).not.toBe('');
            expect(cityColor).not.toBe('');
            expect(nameColor).not.toBe(cityColor);
        });
    });
});
