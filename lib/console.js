'use babel';

// eslint-disable-next-line n/no-process-env
const { SILENCE_LOG } = process.env;

export const Console = {
  debug(...args) {
    if (this.enabled !== false) {
      globalThis.console.debug('[pulsar-eslint]', ...args);
    }
  },

  error(...args) {
    if (this.enabled !== false) {
      globalThis.console.error('[pulsar-eslint]', ...args);
    }
  },

  info(...args) {
    if (this.enabled !== false) {
      globalThis.console.info('[pulsar-eslint]', ...args);
    }
  },

  log(...args) {
    if (this.enabled !== false) {
      globalThis.console.log('[pulsar-eslint]', ...args);
    }
  },

  warn(...args) {
    if (this.enabled !== false) {
      globalThis.console.warn('[pulsar-eslint]', ...args);
    }
  },

  get enabled() {
    if (SILENCE_LOG === 'true') {
      return false;
    }

    return atom.config.get('pulsar-eslint.advanced.enableLogging');
  },
};
