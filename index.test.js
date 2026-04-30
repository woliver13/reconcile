import { describe, it, beforeAll, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('index.html', () => {
    let html;

    beforeAll(() => {
        html = readFileSync(join(__dirname, 'index.html'), 'utf8');
    });

    it('loads all external resources over HTTPS, not HTTP', () => {
        const httpUrls = html.match(/(?:src|href)="http:\/\/[^"]+"/g) || [];
        expect(httpUrls).toEqual([]);
    });

    it('does not load jQuery', () => {
        expect(html).not.toMatch(/jquery/i);
    });

    it('does not load Bootstrap from a CDN link', () => {
        expect(html).not.toMatch(/<link[^>]+bootstrap[^>]*>/i);
    });
});

describe('main.ts', () => {
    let src;

    beforeAll(() => {
        src = readFileSync(join(__dirname, 'src', 'main.ts'), 'utf8');
    });

    it('imports Bootstrap via npm (not CDN)', () => {
        expect(src).toMatch(/import\s+['"]bootstrap\//);
    });
});
