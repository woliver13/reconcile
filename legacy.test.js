import { describe, it, expect } from 'vitest';
import { existsSync } from 'fs';
import { join } from 'path';

describe('legacy file cleanup', () => {
    it('reconcile.js has been deleted', () => {
        expect(existsSync(join(__dirname, 'reconcile.js'))).toBe(false);
    });

    it('reconcileTestService.js has been deleted', () => {
        expect(existsSync(join(__dirname, 'reconcileTestService.js'))).toBe(false);
    });
});
