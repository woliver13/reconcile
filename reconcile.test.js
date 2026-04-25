function resolvedPromise(value) {
    return {
        done: function(cb) { cb(value); return this; },
        then: function(cb) { cb(value); return this; }
    };
}

describe('reconcile', () => {
    let reconcile, service, view;

    beforeEach(() => {
        jest.resetModules();
        reconcile = require('./reconcile');

        service = {
            load: jest.fn().mockReturnValue(resolvedPromise({
                a: [{ id: '5', firstName: 'Nick', lastName: 'Sarkosy' }],
                b: [{ id: 'A', firstName: 'Nicholas', lastName: 'Zarkosi' }]
            })),
            set: jest.fn(),
            undo: jest.fn()
        };

        view = {
            load: jest.fn(),
            showError: jest.fn(),
            addEvent: jest.fn(),
            setIdProperty: jest.fn()
        };

        reconcile.setService(service);
        reconcile.setView(view);
        reconcile.init();
    });

    describe('WEIGHTS', () => {
        it('exports named weight constants used by the scoring algorithm', () => {
            expect(reconcile.WEIGHTS).toEqual({
                EXACT: 100,
                WHITESPACE: 80,
                CONTAINS: 30
            });
        });
    });

    describe('getCandidates()', () => {
        let r, v;

        function setup(a, b) {
            jest.resetModules();
            r = require('./reconcile');
            v = { load: jest.fn(), showError: jest.fn(), addEvent: jest.fn(), setIdProperty: jest.fn() };
            const svc = { load: jest.fn().mockReturnValue(resolvedPromise({ a, b })), set: jest.fn(), undo: jest.fn() };
            r.setService(svc);
            r.setView(v);
            r.init();
        }

        function candidates() { return v.load.mock.calls[0][1]; }

        it('scores an exact field match at 100', () => {
            setup(
                [{ id: '1', name: 'Alice' }],
                [{ id: 'X', name: 'Alice' }]
            );
            expect(candidates()[0].weights.name).toBe(100);
        });

        it('scores a whitespace-normalised match at 80', () => {
            setup(
                [{ id: '1', name: 'John Smith' }],
                [{ id: 'X', name: 'JohnSmith' }]
            );
            expect(candidates()[0].weights.name).toBe(80);
        });

        it('scores a substring/contains match at 30', () => {
            setup(
                [{ id: '1', name: 'Anders' }],
                [{ id: 'X', name: 'Anderson' }]
            );
            expect(candidates()[0].weights.name).toBe(30);
        });

        it('excludes items with no matching fields from candidates', () => {
            setup(
                [{ id: '1', name: 'Alice' }],
                [{ id: 'X', name: 'Bob' }, { id: 'Y', name: 'Alice' }]
            );
            expect(candidates().map(c => c.id)).toEqual(['Y']);
        });

        it('sorts candidates by matchTotal descending', () => {
            setup(
                [{ id: '1', name: 'Alice', city: 'Paris' }],
                [
                    { id: 'X', name: 'Alice', city: 'London' },
                    { id: 'Y', name: 'Alice', city: 'Paris'  }
                ]
            );
            // Y matches on both name and city (200), X only on name (100)
            expect(candidates().map(c => c.id)).toEqual(['Y', 'X']);
        });

        it('excludes candidates whose matchable fields are all null', () => {
            setup(
                [{ id: '1', name: 'Alice' }],
                [{ id: 'X', name: null }]
            );
            expect(candidates()).toEqual([]);
        });

        it('does not score inherited enumerable properties', () => {
            const proto = { name: 'Alice' };
            const inherited = Object.create(proto);
            inherited.id = 'X';
            // inherited has no own 'name' — only via prototype
            setup(
                [{ id: '1', name: 'Alice' }],
                [inherited]
            );
            expect(candidates()).toEqual([]);
        });
    });

    describe('match() / undo() round-trip', () => {
        it('removes matched items from listA and listB', () => {
            reconcile.match({ a: '5', b: 'A' });
            const [, , listA, listB] = view.load.mock.lastCall;
            expect(listA.map(i => i.id)).toEqual([]);
            expect(listB.map(i => i.id)).toEqual([]);
        });

        it('restores items to listA and listB after undo', () => {
            reconcile.match({ a: '5', b: 'A' });
            reconcile.undo();
            const [, , listA, listB] = view.load.mock.lastCall;
            expect(listA.map(i => i.id)).toContain('5');
            expect(listB.map(i => i.id)).toContain('A');
        });
    });

    describe('undo()', () => {
        it('calls service.undo() with the IDs of the last matched pair', () => {
            reconcile.match({ a: '5', b: 'A' });
            reconcile.undo();
            expect(service.undo).toHaveBeenCalledWith('5', 'A');
        });

        it('does not call service.undo() when there is nothing to undo', () => {
            reconcile.undo();
            expect(service.undo).not.toHaveBeenCalled();
        });

        describe('position after undo', () => {
            beforeEach(() => {
                jest.resetModules();
                reconcile = require('./reconcile');

                service = {
                    load: jest.fn().mockReturnValue(resolvedPromise({
                        a: [
                            { id: '5', firstName: 'Nick',  lastName: 'Sarkosy' },
                            { id: '6', firstName: 'Alice', lastName: 'Smith'   }
                        ],
                        b: [{ id: 'A', firstName: 'Nicholas', lastName: 'Zarkosi' }]
                    })),
                    set: jest.fn(),
                    undo: jest.fn()
                };

                view = {
                    load: jest.fn(),
                    showError: jest.fn(),
                    addEvent: jest.fn(),
                    setIdProperty: jest.fn()
                };

                reconcile.setService(service);
                reconcile.setView(view);
                reconcile.init();
            });

            it('navigates to the restored item after undo', () => {
                // match the first item; listA now has only id '6' at position 0
                reconcile.match({ a: '5', b: 'A' });
                view.load.mockClear();

                reconcile.undo();

                // restored item (id '5') should be the one displayed
                const displayedItem = view.load.mock.calls[0][0];
                expect(displayedItem.id).toBe('5');
            });
        });
    });
});
