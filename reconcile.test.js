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
    });
});
