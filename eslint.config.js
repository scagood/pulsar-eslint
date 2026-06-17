/**
 * @import { Linter } from 'eslint';
 * @param {string} name
 * @returns {(config: Linter.Config) => boolean}
 */
function ByPlugin(name) {
  return (config) => config?.plugins?.[name] != null;
}

function ByRule(name) {
  return (config) => config?.rules?.[name] != null;
}

module.exports = (async () => {
  const { createConfig } = await import('@darksheep/eslint');

  /** @type {Linter.FlatConfig[]} */
  const configs = (await createConfig(__dirname))
    .map((config) => ({ ...config }));

  const [ { ignores } ] = configs;
  ignores.push('spec/fixtures', 'package-lock.json');

  configs.push({
    files: [ 'spec/**' ],
    languageOptions: {
      globals: {
        describe: true,
        it: true,

        fdescribe: true,
        fit: true,
        xdescribe: true,
        xit: true,

        expect: true,
        pass: true,
        fail: true,

        beforeAll: true,
        beforeEach: true,
        afterEach: true,
        afterAll: true,
      },
    },
    rules: {
      'max-lines-per-function': 0,
      'max-nested-callbacks': 0,
      'jsdoc/check-tag-names': 0,
      'jsdoc/require-jsdoc': 0,
      'jsdoc/require-param': 0,
      'jsdoc/require-returns': 0,
      'n/no-sync': 0,
      'n/no-process-env': 0,
    },
  });

  for (const config of configs.filter(ByRule('no-undef'))) {
    config.languageOptions ??= {};
    config.languageOptions.globals ??= {};
    config.languageOptions.globals.atom = 'readonly';
    config.languageOptions.globals.window = 'readonly';
  }

  for (const config of configs.filter(ByPlugin('n'))) {
    config.settings ??= {};
    config.settings.node ??= {};
    config.settings.node.version = '20.16.0';
  }

  for (const config of configs.filter(ByPlugin('n'))) {
    config.rules['n/prefer-node-protocol'] = 'off';
  }

  for (const config of configs.filter(ByPlugin('jsdoc'))) {
    config.rules['jsdoc/require-property-description'] = 'off';
    config.rules['jsdoc/require-param-description'] = 'off';
  }
  for (const config of configs.filter(ByPlugin('sonarjs'))) {
    config.rules['sonarjs/no-duplicate-string'] = 'off';
  }

  for (const config of configs.filter(ByPlugin('regexp'))) {
    config.rules['regexp/prefer-named-capture-group'] = 'off';
    config.rules['regexp/require-unicode-regexp'] = 'off';
  }

  configs.push({
    files: [ 'package.json' ],
    rules: {
      'package-json/no-empty-fields': 'off',
    },
  });

  return configs;
})();
