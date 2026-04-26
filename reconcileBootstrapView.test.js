describe('BootstrapView', () => {
    describe('constructor', () => {
        it('can be constructed with a container element and weights', () => {
            jest.resetModules();
            const $ = require('jquery');
            const { BootstrapView } = require('./src/bootstrapView');
            const view = new BootstrapView($('<div>'), { EXACT: 100, WHITESPACE: 80, CONTAINS: 30 });
            expect(view).toBeDefined();
        });
    });

    describe('buildCandidates (via load)', () => {
        let $, localView;

        beforeEach(() => {
            jest.resetModules();
            $ = require('jquery');
            const { BootstrapView } = require('./src/bootstrapView');
            localView = new BootstrapView($('<div>'), { EXACT: 100, WHITESPACE: 80, CONTAINS: 30 });
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
