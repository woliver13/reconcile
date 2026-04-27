import js from "@eslint/js";
import globals from "globals";

export default [
    { ignores: ["node_modules/", "coverage/", "dist/"] },
    js.configs.recommended,
    {
        files: ["reconcile.js", "reconcileTestService.js"],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.commonjs,
                ...globals.amd,
            }
        }
    },
    {
        files: ["**/*.mjs"],
        languageOptions: {
            globals: {
                ...globals.node,
            }
        }
    },
    {
        files: ["**/*.test.js", "__mocks__/**/*.js"],
        languageOptions: {
            globals: {
                ...globals.jest,
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
