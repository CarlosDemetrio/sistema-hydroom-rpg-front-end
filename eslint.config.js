// @ts-check
const eslint = require("@eslint/js");
const { defineConfig } = require("eslint/config");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");

module.exports = defineConfig([
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      // Seletores obrigatórios do projeto
      "@angular-eslint/directive-selector": ["error", { type: "attribute", prefix: "app", style: "camelCase" }],
      "@angular-eslint/component-selector": ["error", { type: "element", prefix: "app", style: "kebab-case" }],

      // Padrões obrigatórios Angular 21
      "@angular-eslint/prefer-inject": "error",
      "@angular-eslint/no-empty-lifecycle-method": "error",
      "@angular-eslint/use-lifecycle-interface": "error",
      "@angular-eslint/no-output-native": "error",
      "@angular-eslint/no-output-on-prefix": "warn",
      "@angular-eslint/no-input-rename": "error",

      // TypeScript: evitar any e erros comuns
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
      "@typescript-eslint/no-empty-function": "warn",

      // Desabilitar regras estilísticas pedantes do tseslint
      "@typescript-eslint/consistent-type-definitions": "off",
      "@typescript-eslint/array-type": "off",
      "@typescript-eslint/prefer-for-of": "off",
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      angular.configs.templateRecommended,
    ],
    rules: {
      // Acessibilidade como warn (pré-existente, não bloquear agentes)
      "@angular-eslint/template/click-events-have-key-events": "warn",
      "@angular-eslint/template/interactive-supports-focus": "warn",
      "@angular-eslint/template/label-has-associated-control": "warn",
      "@angular-eslint/template/alt-text": "warn",

      // Padrões de template obrigatórios
      "@angular-eslint/template/no-negated-async": "error",
      "@angular-eslint/template/use-track-by-function": "warn",
    },
  },
  {
    // Ignorar arquivos de teste (regras mais relaxadas)
    files: ["**/*.spec.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@angular-eslint/prefer-inject": "off",
    },
  }
]);
