import { describe, it, expect, vi, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { SampleDataService } from './src/sampleDataService';
import { TableView } from './src/tableView';
import { Scorer } from './src/scorer';
import { Reconciler } from './src/reconciler';
import type { Candidate } from './src/types';

const WEIGHTS = { EXACT: 100, WHITESPACE: 80, NICKNAME: 60, CONTAINS: 30, TRANSPOSITION: 20 };

describe('src/main.ts source conventions', () => {
    let source: string;

    beforeAll(() => {
        source = readFileSync(join(__dirname, 'src', 'main.ts'), 'utf8');
    });

    it('handles the promise returned by reconciler.init() with .catch()', () => {
        expect(source).toMatch(/reconciler\.init\(\)\s*\.catch\(/);
    });

    it('constructs TableView without passing weights', () => {
        expect(source).not.toMatch(/new TableView\s*\([^)]*WEIGHTS[^)]*\)/);
    });
});

describe('main.ts composition root — integration', () => {
    it('reconciler.init() calls view.load with a non-empty candidate list', async () => {
        const container = document.createElement('div');
        const service = new SampleDataService();
        const scorer = new Scorer(WEIGHTS);
        const view = new TableView(container);
        const loadSpy = vi.spyOn(view, 'load');

        const reconciler = new Reconciler(service, view, scorer);
        await reconciler.init();

        expect(loadSpy).toHaveBeenCalledOnce();
        const candidates = loadSpy.mock.calls[0][1] as Candidate[];
        expect(candidates.length).toBeGreaterThan(0);
    });

    it('reconciler.init() calls view.load with the full list A', async () => {
        const container = document.createElement('div');
        const service = new SampleDataService();
        const scorer = new Scorer(WEIGHTS);
        const view = new TableView(container);
        const loadSpy = vi.spyOn(view, 'load');

        const reconciler = new Reconciler(service, view, scorer);
        await reconciler.init();

        const listA = loadSpy.mock.calls[0][2];
        expect(listA.length).toBeGreaterThan(0);
    });

    it('reconciler.init() renders into the DOM container', async () => {
        const container = document.createElement('div');
        const service = new SampleDataService();
        const scorer = new Scorer(WEIGHTS);
        const view = new TableView(container);

        const reconciler = new Reconciler(service, view, scorer);
        await reconciler.init();

        expect(container.querySelector('table')).not.toBeNull();
    });
});
