function ByPlugin(name) {
  return (config) => config?.plugins?.[name] != null;
}

function ByRule(name) {
  return (config) => config?.rules?.[name] != null;
}

module.exports = (async () => {
  const { createConfig } = await import('@darksheep/eslint');

  /** @type {import('eslint').Linter.FlatConfig[]} */
  const configs = (await createConfig(__dirname))
    .map((config) => ({ ...config }));

  for (const config of configs.filter(ByRule('no-undef'))) {
    if (config.languageOptions == null) {
      config.languageOptions = {};
    }

    if (config.languageOptions.globals == null) {
      config.languageOptions.globals = {};
    }

    config.languageOptions.globals.atom = 'readonly';
    config.languageOptions.globals.window = 'readonly';
  }

  // env = { browser: true }
  for (const config of configs.filter(ByPlugin('n'))) {
    config.settings.node.version = '14.21.3';
  }

  for (const config of configs.filter(ByPlugin('unicorn'))) {
    config.rules['unicorn/prefer-node-protocol'] = 'off';
  }

  for (const config of configs.filter(ByPlugin('jsdoc'))) {
    config.rules['jsdoc/require-property-description'] = 'off';
    config.rules['jsdoc/require-param-description'] = 'off';
  }
  for (const config of configs.filter(ByPlugin('sonarjs'))) {
    config.rules['sonarjs/no-duplicate-string'] = 'off';
  }

  return configs;
})();
