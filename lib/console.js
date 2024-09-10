'use babel';

// eslint-disable-next-line n/no-process-env
const { SILENCE_LOG } = process.env;

export default class Console {
  static debug(...args) {
    if (this.enabled !== false) {
      window.console.debug('[pulsar-eslint]', ...args);
    }
  }

  static error(...args) {
    if (this.enabled !== false) {
      window.console.error('[pulsar-eslint]', ...args);
    }
  }

  static info(...args) {
    if (this.enabled !== false) {
      window.console.info('[pulsar-eslint]', ...args);
    }
  }

  static log(...args) {
    if (this.enabled !== false) {
      window.console.log('[pulsar-eslint]', ...args);
    }
  }

  static warn(...args) {
    if (this.enabled !== false) {
      window.console.warn('[pulsar-eslint]', ...args);
    }
  }

  static get enabled() {
    if (SILENCE_LOG === 'true') {
      return false;
    }

    return atom.config.get('pulsar-eslint.advanced.enableLogging');
  }
}
