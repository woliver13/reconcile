import js from "@eslint/js";
import globals from "globals";

export default [
    { ignores: ["node_modules/", "coverage/", "dist/"] },
    js.configs.recommended,
    {
        files: ["**/*.mjs"],
        languageOptions: {
            globals: {
                ...globals.node,
            }
        }
    },
    {
        files: ["**/*.test.js"],
        languageOptions: {
            globals: {
                describe: 'readonly',
                it: 'readonly',
                test: 'readonly',
                expect: 'readonly',
                beforeAll: 'readonly',
                afterAll: 'readonly',
                beforeEach: 'readonly',
                afterEach: 'readonly',
                vi: 'readonly',
                suite: 'readonly',
                ...globals.node,
                ...globals.browser,
            }
        }
    },
    {
        rules: {
            "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
            "eqeqeq": ["error", "smart"],
            "no-prototype-builtins": "error"
        }
    }
];
