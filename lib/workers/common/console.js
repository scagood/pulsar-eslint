class Console {
  static debug(...args) {
    process.send({ log: [ 'debug', ...args ] });
  }

  static error(...args) {
    process.send({ log: [ 'error', ...args ] });
  }

  static info(...args) {
    process.send({ log: [ 'info', ...args ] });
  }

  static log(...args) {
    process.send({ log: [ 'log', ...args ] });
  }

  static warn(...args) {
    process.send({ log: [ 'warn', ...args ] });
  }
}

module.exports = Console;
