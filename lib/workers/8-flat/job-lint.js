/* eslint n/global-require: 0 */
const { createRequire } = require('module');

const { get } = require('../common/get.js');
const console = require('../common/console.js');
const { convertResults } = require('../common/convert-results.js');

/**
 * @type {Map<string, import('eslint-8').ESLint>}
 */
const cache = new Map();

/**
 * @param {import('../common/types.js').Job} job
 * @returns {Promise<import('../common/types.js').LintResult>}
 */
async function jobLint({ content, prerequisite, config }) {
  const cacheKey = `${prerequisite.workingDirectory}:${prerequisite.eslintPath}`;

  console.debug('Linting using v8 FlatESLint', content.filePath, {
    workingDirectory: prerequisite.workingDirectory,
    eslintPath: prerequisite.eslintPath,
  });

  if (cache.has(cacheKey) === false) {
    console.debug('Loading v8 FlatESLint', prerequisite.workingDirectory, prerequisite.eslintPath);

    // We need to redirect the api call to "eslint/use-at-your-own-risk"
    const lRequire = createRequire(prerequisite.eslintPath);

    /** @type {{ FlatESLint: import('eslint-8').ESLint }} */
    const { FlatESLint } = lRequire('eslint/use-at-your-own-risk');

    cache.set(cacheKey, new FlatESLint({
      cwd: prerequisite.workingDirectory,
      globInputPaths: false,
      fix: false,
      ignore: get(config, 'advanced.disableEslintIgnore', false) !== true,
      overrideConfigFile: get(config, 'eslintLocation.overrideESLintConfig'),
    }));
  }

  const eslint = cache.get(cacheKey);

  if (await eslint.isPathIgnored(content.filePath)) {
    console.debug('Skipping ignored file:', content.filePath);
    return {};
  }

  const lintResults = await eslint.lintText(
    content.fileText,
    { filePath: content.filePath },
  );
  const rulesMeta = eslint.getRulesMetaForResults(lintResults);

  return {
    rules: rulesMeta,
    results: convertResults(lintResults, rulesMeta, config, content),
  };
}

module.exports = {
  jobLint: jobLint,
  clearLintCache: () => cache.clear(),
};
