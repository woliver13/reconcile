const fs = require('fs');
const path = require('path');

describe('Vite scaffolding', () => {
    it('has a vite.config.ts at project root', () => {
        expect(fs.existsSync(path.join(__dirname, 'vite.config.ts'))).toBe(true);
    });

    it('has a tsconfig.json at project root', () => {
        expect(fs.existsSync(path.join(__dirname, 'tsconfig.json'))).toBe(true);
    });
});
