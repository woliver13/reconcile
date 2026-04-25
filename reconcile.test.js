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
