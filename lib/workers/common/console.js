const Console = {
  debug(...args) {
    process.send({ log: [ 'debug', ...args ] });
  },

  error(...args) {
    process.send({ log: [ 'error', ...args ] });
  },

  info(...args) {
    process.send({ log: [ 'info', ...args ] });
  },

  log(...args) {
    process.send({ log: [ 'log', ...args ] });
  },

  warn(...args) {
    process.send({ log: [ 'warn', ...args ] });
  },
};

module.exports = Console;
