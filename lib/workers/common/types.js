/**
 * @typedef {'clear-cache' | 'lint' | 'fix'} JobType
 */

/**
 * @typedef {Object} JobContent
 * @property {string} filePath The path to the file to lint
 * @property {string} projectPath The path to the project root
 * @property {boolean} isModified Is the contents different to the saved file
 * @property {string} contents The current contents of the file
 */

/**
 * @typedef {Object} Job
 * @property {string} key
 * @property {JobType} type
 * @property {JobContent} content
 * @property {import('../../types.js').Config} config
 * @property {import('../../prerequisites/index.js').PrerequisiteInfo} prerequisite
 */

/**
 * @typedef PulsarLocation
 * @property {string} file
 * @property {[ line: number, column: number ][]} position
 */

/**
 * @typedef PulsarLinterResult
 * @property {'info' | 'warning' | 'error'} severity
 * @property {PulsarLocation} location
 * @property {import('eslint').Rule.Fix} [fix]
 * @property {string} excerpt
 * @property {string} [url]
 */

/**
 * @typedef FixResult
 * @property {import('eslint').ESLint.LintResultData['rulesMeta']} rules
 * @property {boolean} fixApplied
 * @property {PulsarLinterResult[]} results
 */
/**
 * @typedef LintResult
 * @property {import('eslint').ESLint.LintResultData['rulesMeta']} rules
 * @property {PulsarLinterResult[]} results
 */

module.exports = {};
