import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Reconciler } from './src/reconciler';
import { Scorer } from './src/scorer';

const WEIGHTS = { EXACT: 100, WHITESPACE: 80, NICKNAME: 60, CONTAINS: 30, TRANSPOSITION: 20 };

describe('Reconciler', () => {
    let reconcile, service, view, scorer;

    function makeService(a, b) {
        return {
            load: vi.fn().mockResolvedValue({ a, b }),
            set: vi.fn(),
            undo: vi.fn(),
        };
    }

    function makeView() {
        return {
            load: vi.fn(),
            showError: vi.fn(),
            onAction: vi.fn(),
        };
    }

    beforeEach(async () => {
        service = makeService(
            [{ id: '5', firstName: 'Nick', lastName: 'Sarkosy' }],
            [{ id: 'A', firstName: 'Nicholas', lastName: 'Zarkosi' }]
        );
        view = makeView();
        scorer = new Scorer(WEIGHTS);
        reconcile = new Reconciler(service, view, scorer, 'testuser');
        await reconcile.init();
    });

    describe('getCandidates() — integration via view.load', () => {
        async function setup(a, b) {
            const svc = makeService(a, b);
            const v = makeView();
            const r = new Reconciler(svc, v, new Scorer(WEIGHTS));
            await r.init();
            return { r, v };
        }

        function candidates(v) { return v.load.mock.calls[0][1]; }

        it('scores an exact field match at 100', async () => {
            const { v } = await setup(
                [{ id: '1', name: 'Alice' }],
                [{ id: 'X', name: 'Alice' }]
            );
            expect(candidates(v)[0].weights.name).toBe(100);
        });

        it('scores a whitespace-normalised match at 80', async () => {
            const { v } = await setup(
                [{ id: '1', name: 'John Smith' }],
                [{ id: 'X', name: 'JohnSmith' }]
            );
            expect(candidates(v)[0].weights.name).toBe(80);
        });

        it('scores a substring/contains match at 30', async () => {
            const { v } = await setup(
                [{ id: '1', name: 'Anders' }],
                [{ id: 'X', name: 'Anderson' }]
            );
            expect(candidates(v)[0].weights.name).toBe(30);
        });

        it('scores a nickname match at 60', async () => {
            const { v } = await setup(
                [{ id: '1', firstName: 'Nick' }],
                [{ id: 'X', firstName: 'Nicholas' }]
            );
            expect(candidates(v)[0].weights.firstName).toBe(60);
        });

        it('scores a transposition match at 20', async () => {
            const { v } = await setup(
                [{ id: '1', name: 'Oliver' }],
                [{ id: 'X', name: 'Oilver' }]
            );
            expect(candidates(v)[0].weights.name).toBe(20);
        });

        it('excludes items with no matching fields from candidates', async () => {
            const { v } = await setup(
                [{ id: '1', name: 'Alice' }],
                [{ id: 'X', name: 'Bob' }, { id: 'Y', name: 'Alice' }]
            );
            expect(candidates(v).map(c => c.id)).toEqual(['Y']);
        });

        it('sorts candidates by matchTotal descending', async () => {
            const { v } = await setup(
                [{ id: '1', name: 'Alice', city: 'Paris' }],
                [
                    { id: 'X', name: 'Alice', city: 'London' },
                    { id: 'Y', name: 'Alice', city: 'Paris'  }
                ]
            );
            expect(candidates(v).map(c => c.id)).toEqual(['Y', 'X']);
        });

        it('excludes candidates whose matchable fields are all null', async () => {
            const { v } = await setup(
                [{ id: '1', name: 'Alice' }],
                [{ id: 'X', name: null }]
            );
            expect(candidates(v)).toEqual([]);
        });

        it('does not score inherited enumerable properties', async () => {
            const proto = { name: 'Alice' };
            const inherited = Object.create(proto);
            inherited.id = 'X';
            const { v } = await setup(
                [{ id: '1', name: 'Alice' }],
                [inherited]
            );
            expect(candidates(v)).toEqual([]);
        });
    });

    describe('match() / undo() round-trip', () => {
        it('removes matched items from listA and listB', () => {
            reconcile.match({ a: '5', b: 'A' });
            const [, , listA, listB] = view.load.mock.lastCall;
            expect(listA.map(i => i.id)).toEqual([]);
            expect(listB.map(i => i.id)).toEqual([]);
        });

        it('calls service.set() with the current username as the third argument', () => {
            reconcile.match({ a: '5', b: 'A' });
            expect(service.set).toHaveBeenCalledWith('5', 'A', 'testuser', expect.any(Array));
        });

        it('passes a differences array as the fourth argument to service.set()', () => {
            reconcile.match({ a: '5', b: 'A' });
            const differences = service.set.mock.calls[0][3];
            expect(Array.isArray(differences)).toBe(true);
        });

        it('includes fields that differ between System A and System B in the differences array', () => {
            reconcile.match({ a: '5', b: 'A' });
            const differences = service.set.mock.calls[0][3];
            const fields = differences.map(d => d.field);
            expect(fields).toContain('firstName');
            expect(fields).toContain('lastName');
        });

        it('each difference entry has field, aValue, and bValue', () => {
            reconcile.match({ a: '5', b: 'A' });
            const differences = service.set.mock.calls[0][3];
            expect(differences.length).toBeGreaterThan(0);
            for (const diff of differences) {
                expect(diff).toHaveProperty('field');
                expect(diff).toHaveProperty('aValue');
                expect(diff).toHaveProperty('bValue');
            }
        });

        it('excludes fields that match exactly from the differences array', async () => {
            const svc = makeService(
                [{ id: '1', name: 'Alice', city: 'Paris' }],
                [{ id: 'X', name: 'Alice', city: 'London' }]
            );
            const v = makeView();
            const r = new Reconciler(svc, v, new Scorer(WEIGHTS), 'user');
            await r.init();
            r.match({ a: '1', b: 'X' });
            const differences = svc.set.mock.calls[0][3];
            const fields = differences.map(d => d.field);
            expect(fields).not.toContain('name');
            expect(fields).toContain('city');
        });

        it('records correct aValue and bValue for each differing field', async () => {
            const svc = makeService(
                [{ id: '1', name: 'Alice', city: 'Paris' }],
                [{ id: 'X', name: 'Alice', city: 'London' }]
            );
            const v = makeView();
            const r = new Reconciler(svc, v, new Scorer(WEIGHTS), 'user');
            await r.init();
            r.match({ a: '1', b: 'X' });
            const differences = svc.set.mock.calls[0][3];
            const cityDiff = differences.find(d => d.field === 'city');
            expect(cityDiff).toEqual({ field: 'city', aValue: 'Paris', bValue: 'London' });
        });

        it('passes an empty differences array when all fields match exactly', async () => {
            const svc = makeService(
                [{ id: '1', name: 'Alice', city: 'Paris' }],
                [{ id: 'X', name: 'Alice', city: 'Paris' }]
            );
            const v = makeView();
            const r = new Reconciler(svc, v, new Scorer(WEIGHTS), 'user');
            await r.init();
            r.match({ a: '1', b: 'X' });
            const differences = svc.set.mock.calls[0][3];
            expect(differences).toEqual([]);
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
            beforeEach(async () => {
                service = makeService(
                    [
                        { id: '5', firstName: 'Nick',  lastName: 'Sarkosy' },
                        { id: '6', firstName: 'Alice', lastName: 'Smith'   }
                    ],
                    [{ id: 'A', firstName: 'Nicholas', lastName: 'Zarkosi' }]
                );
                view = makeView();
                reconcile = new Reconciler(service, view, new Scorer(WEIGHTS));
                await reconcile.init();
            });

            it('navigates to the restored item after undo', () => {
                reconcile.match({ a: '5', b: 'A' });
                view.load.mockClear();

                reconcile.undo();

                const displayedItem = view.load.mock.calls[0][0];
                expect(displayedItem.id).toBe('5');
            });
        });
    });
});
