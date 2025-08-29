import {defineConfig} from "eslint/config";
import js from "@eslint/js";

export default defineConfig([
    {
        files: ["**/*.ts", "**/*.tsx"],
        parser: ['@typescript-eslint/parser'],
        plugins: [
            js,
            '@typescript-eslint'
        ],
        extends: [
            "js/recommended",
            "plugin:@typescript-eslint/recommended"
        ],
        rules: {
            "no-unused-vars": "warn",
            "no-undef": "warn",
        },
    },
]);
