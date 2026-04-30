import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('eslint.config.mjs source conventions', () => {
    let config;

    beforeAll(() => {
        config = readFileSync(join(__dirname, 'eslint.config.mjs'), 'utf8');
    });

    it('does not spread globals.jest into test file config', () => {
        expect(config).not.toMatch(/globals\.jest/);
    });

    it('declares vi as a global for test files', () => {
        expect(config).toMatch(/\bvi\b\s*:/);
    });
});
