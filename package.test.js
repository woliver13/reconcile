import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const pkg = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf8'));

describe('package.json infrastructure', () => {
    it('has a lint script', () => {
        expect(pkg.scripts.lint).toBe('eslint .');
    });

    it('does not list jquery as a devDependency', () => {
        expect(pkg.devDependencies).not.toHaveProperty('jquery');
    });

    it('does not list jest as a devDependency', () => {
        expect(pkg.devDependencies).not.toHaveProperty('jest');
    });

    it('lists vitest as a devDependency', () => {
        expect(pkg.devDependencies).toHaveProperty('vitest');
    });

    it('lists bootstrap as a devDependency', () => {
        expect(pkg.devDependencies).toHaveProperty('bootstrap');
    });

    it('lists eslint as a devDependency', () => {
        expect(pkg.devDependencies).toHaveProperty('eslint');
    });

    it('lists vite as a devDependency', () => {
        expect(pkg.devDependencies).toHaveProperty('vite');
    });

    it('has a dev script', () => {
        expect(pkg.scripts.dev).toBe('vite');
    });

    it('has a build script', () => {
        expect(pkg.scripts.build).toBe('vite build');
    });

    it('has a preview script', () => {
        expect(pkg.scripts.preview).toBe('vite preview');
    });

    it('test script runs vitest', () => {
        expect(pkg.scripts.test).toContain('vitest');
    });
});

describe('project filesystem', () => {
    it('does not contain an empty __mocks__/ directory', () => {
        expect(existsSync(join(__dirname, '__mocks__'))).toBe(false);
    });

    it('eslint config does not reference __mocks__/', () => {
        const eslintConfig = readFileSync(join(__dirname, 'eslint.config.mjs'), 'utf8');
        expect(eslintConfig).not.toMatch(/__mocks__/);
    });
});
