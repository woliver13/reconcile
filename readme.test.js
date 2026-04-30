import { describe, it, beforeAll, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('README.md', () => {
    let readme;

    beforeAll(() => {
        readme = readFileSync(join(__dirname, 'README.md'), 'utf8');
    });

    it('does not reference the old bootstrapView.ts filename', () => {
        expect(readme).not.toMatch(/bootstrapView\.ts/i);
    });

    it('does not reference the old BootstrapView class name', () => {
        expect(readme).not.toMatch(/BootstrapView/);
    });

    it('references the current tableView.ts filename in the file tree', () => {
        expect(readme).toMatch(/tableView\.ts/);
    });

    it('references the current TableView class name', () => {
        expect(readme).toMatch(/TableView/);
    });
});
