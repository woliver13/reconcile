import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'jsdom',
        coverage: {
            include: ['src/**'],
            exclude: ['src/main.ts'],
        },
    },
});
