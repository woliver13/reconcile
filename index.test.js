const fs = require('fs');
const path = require('path');

describe('index.html', () => {
    let html;

    beforeAll(() => {
        html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
    });

    it('loads all external resources over HTTPS, not HTTP', () => {
        const httpUrls = html.match(/(?:src|href)="http:\/\/[^"]+"/g) || [];
        expect(httpUrls).toEqual([]);
    });

    it('loads jQuery 3.x or later', () => {
        const match = html.match(/jquery[.-](\d+)\.\d+/i);
        expect(match).not.toBeNull();
        expect(parseInt(match[1])).toBeGreaterThanOrEqual(3);
    });

    it('loads Bootstrap 5.x or later', () => {
        const match = html.match(/bootstrap[/@-](\d+)\.\d+/i);
        expect(match).not.toBeNull();
        expect(parseInt(match[1])).toBeGreaterThanOrEqual(5);
    });
});
