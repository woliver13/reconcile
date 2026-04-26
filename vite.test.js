import { describe, it, expect } from 'vitest';
import { existsSync } from 'fs';
import { join } from 'path';

describe('Vite scaffolding', () => {
    it('has a vite.config.ts at project root', () => {
        expect(existsSync(join(__dirname, 'vite.config.ts'))).toBe(true);
    });

    it('has a tsconfig.json at project root', () => {
        expect(existsSync(join(__dirname, 'tsconfig.json'))).toBe(true);
    });

    it('configures test environment as jsdom', async () => {
        const { readFileSync } = await import('fs');
        const config = readFileSync(join(__dirname, 'vite.config.ts'), 'utf8');
        expect(config).toContain("environment: 'jsdom'");
    });
});
