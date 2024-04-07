const { get } = require('../common/get.js');
const console = require('../common/console.js');
const { convertResults } = require('../common/convert-results.js');

/**
 * @type {Map<string, import('eslint-9').ESLint>}
 */
const cache = new Map();

/**
 * @param {import('../common/types.js').Job} job
 */
async function jobLint({ content, prerequisite, config }) {
  const cacheKey = `${prerequisite.workingDirectory}:${prerequisite.eslintPath}`;
  console.debug('Linting using v9 ESLint', content.filePath, {
    workingDirectory: prerequisite.workingDirectory,
    eslintPath: prerequisite.eslintPath,
  });

  if (cache.has(cacheKey) === false) {
    console.debug('Loading v9 ESLint', prerequisite.workingDirectory, prerequisite.eslintPath);
    /** @type {import('eslint-9')} */
    const { ESLint } = require(prerequisite.eslintPath);

    cache.set(cacheKey, new ESLint({
      cwd: prerequisite.workingDirectory,
      globInputPaths: false,
      fix: false,
      ignore: !get(config, 'advanced.disableEslintIgnore', false),
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
