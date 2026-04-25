const view = require('./reconcileBootstrapView');

describe('reconcileBootstrapView', () => {
    describe('setWeights()', () => {
        it('is exported as a function', () => {
            expect(typeof view.setWeights).toBe('function');
        });
    });
});
