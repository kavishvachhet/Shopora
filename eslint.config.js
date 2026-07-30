const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    rules: {
      "no-unused-vars": ["warn", { "argsIgnorePattern": "^_|next|req|res|err" }],
      "no-console": "off",
      "no-undef": "error",
      "no-empty": "warn",
      "no-extra-semi": "error",
      "prefer-const": "warn",
    },
    ignores: [
      "node_modules/**",
      "client/**",
      "coverage/**",
      "public/**"
    ],
  },
];
