// Runs on the staged files from the pre-commit hook. Each app keeps its own
// tooling, so the frontend's files are linted with the frontend's ESLint and config.
const config = {
  'frontend/**/*.{ts,tsx,js}': (files) =>
    `npm --prefix frontend exec -- eslint --config frontend/eslint.config.js --max-warnings 0 --no-warn-ignored ${files.map((f) => JSON.stringify(f)).join(' ')}`,
};

export default config;
