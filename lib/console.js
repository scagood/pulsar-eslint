'use babel';

export default class Console {
  static get enabled() {
    if (process.env.SILENCE_LOG === 'true') {
      return false;
    }

    return atom.config.get('pulsar-eslint.advanced.enableLogging');
  }

  static log(...args) {
    if (this.enabled !== false) {
      window.console.log('[pulsar-eslint]', ...args);
    }
  }

  static debug(...args) {
    if (this.enabled !== false) {
      window.console.debug('[pulsar-eslint]', ...args);
    }
  }

  static info(...args) {
    if (this.enabled !== false) {
      window.console.info('[pulsar-eslint]', ...args);
    }
  }

  static warn(...args) {
    if (this.enabled !== false) {
      window.console.warn('[pulsar-eslint]', ...args);
    }
  }

  static error(...args) {
    if (this.enabled !== false) {
      window.console.error('[pulsar-eslint]', ...args);
    }
  }
}
