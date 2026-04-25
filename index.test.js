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
});
