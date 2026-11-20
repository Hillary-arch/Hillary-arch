"use strict";
const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
  { ignores: ["node_modules/", "design/"] },
  js.configs.recommended,
  {
    files: ["site/**/*.js"],
    languageOptions: {
      ecmaVersion: 2017,
      sourceType: "script",
      globals: { ...globals.browser, module: "readonly" }
    },
    rules: { "no-unused-vars": ["error", { args: "none" }] }
  },
  {
    files: ["tests/**/*.js", "eslint.config.js"],
    languageOptions: { ecmaVersion: 2022, sourceType: "commonjs", globals: globals.node }
  }
];
