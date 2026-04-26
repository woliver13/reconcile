/**
 * @jest-environment jsdom
 */

const { BootstrapView } = require('./src/bootstrapView');

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

        it('enables the Undo button when memento has entries', () => {
            const memento = [{ a: { id: '0', name: 'Alice' }, b: { id: '1', name: 'Alice' } }];
            view.load(matchItem, twoCandidates, [matchItem], [], memento);
            const undoBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'Undo');
            expect(undoBtn.disabled).toBe(false);
        });

        it('applies match-same class to cells with EXACT weight', () => {
            const candidates = [{ id: '1', name: 'Alice', weights: { name: WEIGHTS.EXACT, matchTotal: 100 } }];
            view.load(matchItem, candidates, [matchItem], [], []);
            const sameCells = container.querySelectorAll('.match-same');
            expect(sameCells.length).toBeGreaterThan(0);
        });

        it('clears the container on subsequent load() calls', () => {
            view.load(matchItem, twoCandidates, [matchItem], [], []);
            view.load(matchItem, twoCandidates, [matchItem], [], []);
            const matchButtons = Array.from(container.querySelectorAll('button')).filter(b => b.textContent === 'Match');
            expect(matchButtons.length).toBe(2);
        });
    });
});
