const { get } = require('./get.js');
const SEVERITIES = /** @type {const} */ ([ 'info', 'warning', 'error' ]);

/**
 * @param {string} file
 * @param {import('eslint').Linter.LintMessage} message
 * @returns {import('./types.js').PulsarLocation}
 */
function getLocation(file, message) {
  if (message.fatal === true) {
    /*
     * Parsing errors don't define a range — only a single position. By
     * default, Linter will assume the other point in the range is [0, 0],
     * and report that the parsing error starts at Line 1, Column 1. That's
     * not helpful.
     *
     * Instead, we'll construct our own range that starts at the beginning
     * of the offending line, so that clicking on the message will take us
     * very close to the problem.
     */
    const position = [
      [ message.line - 1, 0 ],
      [ message.line - 1, message.column - 1 ],
    ];

    return { file, position };
  }

  const position = [
    [ message.line - 1, message.column - 1 ],
    [ message.endLine - 1, message.endColumn - 1 ],
  ];

  return { file, position };
}

/**
 * @typedef convertMessageOptions
 * @property {boolean} isModified
 * @property {boolean} showRuleIdInMessage
 * @property {boolean} ignoreFixableRulesWhileTyping
 * @property {string[]} rulesToDisableWhileTyping
 */

/**
 * @param {string} filePath
 * @param {import('eslint').Linter.LintMessage} message
 * @param {import('eslint').ESLint.LintResultData['rulesMeta']} rulesMeta
 * @param {convertMessageOptions} options
 * @returns {import('./types.js').PulsarLinterResult | undefined}
 */
function convertMessage(filePath, message, rulesMeta, options) {
  // Filter out any violations that the user has asked to ignore.
  if (
    options.isModified === true &&
    (
      (
        options.ignoreFixableRulesWhileTyping === true &&
        message.fix != null
      ) ||
      options.rulesToDisableWhileTyping.includes(message.ruleId)
    )
  ) {
    return;
  }

  let idTag = '';
  if (options.showRuleIdInMessage === true) {
    idTag = message.fatal === true ? ' (Fatal)' : ` (${message.ruleId})`;
  }

  const rule = rulesMeta[message.ruleId];

  return {
    severity: SEVERITIES[message.severity] ?? 'error',
    location: getLocation(filePath, message),
    fix: message.fix,
    excerpt: `${message.message}${idTag}`,
    url: rule?.docs == null ? undefined : rule.docs.url,
  };
}

/**
 * @param {import('eslint').ESLint.LintResult[]} lintResults
 * @param {import('eslint').ESLint.LintResultData['rulesMeta']} rulesMeta
 * @param {import('eslint').ESLint.ConfigData} config
 * @param {{isModified: boolean}} options
 * @returns {import('./types.js').PulsarLinterResult[]}
 */
function convertResults(lintResults, rulesMeta, config, { isModified }) {
  const showRuleIdInMessage = get(config, 'advanced.showRuleIdInMessage', true);
  const ignoreFixableRulesWhileTyping = get(config, 'advanced.ignoreFixableRulesWhileTyping');
  const rulesToDisableWhileTyping = get(config, 'advanced.rulesToDisableWhileTyping', []);
  /** @type {import('./types.js').PulsarLinterResult[]} */
  const output = [];

  for (const { filePath, messages } of lintResults) {
    for (const message of messages) {
      const messageResult = convertMessage(filePath, message, rulesMeta, {
        isModified,
        showRuleIdInMessage,
        ignoreFixableRulesWhileTyping,
        rulesToDisableWhileTyping,
      });

      if (messageResult != null) {
        output.push(messageResult);
      }
    }
  }

  return output;
}

module.exports = { convertResults };
