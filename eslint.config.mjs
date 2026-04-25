import js from "@eslint/js";
import globals from "globals";

export default [
    { ignores: ["node_modules/", "coverage/"] },
    js.configs.recommended,
    {
        files: ["reconcile.js", "reconcileBootstrapView.js", "reconcileTestService.js"],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.commonjs,
                ...globals.amd,
            }
        }
    },
    {
        files: ["**/*.test.js", "__mocks__/**/*.js"],
        languageOptions: {
            globals: {
                ...globals.jest,
                ...globals.node,
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
