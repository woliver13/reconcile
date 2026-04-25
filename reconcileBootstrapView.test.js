const view = require('./reconcileBootstrapView');

describe('reconcileBootstrapView', () => {
    describe('setWeights()', () => {
        it('is exported as a function', () => {
            expect(typeof view.setWeights).toBe('function');
        });
    });

    describe('buildCandidates (via load)', () => {
        let $, localView;

        beforeEach(() => {
            jest.resetModules();
            $ = require('jquery');
            localView = require('./reconcileBootstrapView');
            localView.setMasterDiv($('<div>'));
            localView.setWeights({ EXACT: 100, WHITESPACE: 80, CONTAINS: 30 });
        });

        function matchButtonHtmls() {
            return $.mock.calls
                .map(function(args) { return args[0]; })
                .filter(function(s) { return typeof s === 'string' && /^<button[^>]*>Match<\/button>$/.test(s); });
        }

        it('assigns accesskey="m" to the first candidate button', () => {
            const matchItem = { id: '0', name: 'Alice' };
            const candidates = [
                { id: '1', name: 'Alice', weights: { name: 100, matchTotal: 100 } },
                { id: '2', name: 'Bob',   weights: { name: 30,  matchTotal: 30  } },
            ];

            localView.load(matchItem, candidates, [matchItem], [], []);

            const buttons = matchButtonHtmls();
            expect(buttons.length).toBeGreaterThanOrEqual(1);
            expect(buttons[0]).toContain('accesskey="m"');
        });

        it('does not assign accesskey="m" to subsequent candidate buttons', () => {
            const matchItem = { id: '0', name: 'Alice' };
            const candidates = [
                { id: '1', name: 'Alice', weights: { name: 100, matchTotal: 100 } },
                { id: '2', name: 'Bob',   weights: { name: 30,  matchTotal: 30  } },
            ];

            localView.load(matchItem, candidates, [matchItem], [], []);

            const buttons = matchButtonHtmls();
            expect(buttons.length).toBe(2);
            expect(buttons[1]).not.toContain('accesskey="m"');
        });

        it('assigns accesskey="m" when there is exactly one candidate', () => {
            const matchItem = { id: '0', name: 'Alice' };
            const candidates = [
                { id: '1', name: 'Alice', weights: { name: 100, matchTotal: 100 } },
            ];

            localView.load(matchItem, candidates, [matchItem], [], []);

            const buttons = matchButtonHtmls();
            expect(buttons.length).toBe(1);
            expect(buttons[0]).toContain('accesskey="m"');
        });
    });
});
