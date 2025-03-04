'use babel';

export class UserError extends Error {
  constructor(message, detail) {
    super(message);
    this.name = 'UserError';
    this.detail = detail;
  }
}

const errorAlert = new Set();

/**
 * @param {Error} error
 * @param {boolean} [dismissable]
 * @returns {void}
 */
export function handleError(error, dismissable = true) {
  console.error(error);

  const shortStack = error.stack
    .split(/\r?\n|\r/)
    .slice(0, 3)
    .join('');

  if (errorAlert.has(shortStack)) {
    return;
  }

  errorAlert.add(shortStack);

  const notification = atom.notifications.addError(
    `pulsar-eslint - ${error.name}: ${error.message}`,
    {
      stack: error.stack,
      detail: error.detail ?? `${error.name}: ${error.message}`,
      dismissable: dismissable,
      buttons: [ {
        text: 'Copy',
        onDidClick: () => atom.clipboard.write(error.stack),
      } ],
    },
  );

  const clearError = () => errorAlert.delete(shortStack);
  // Dont send the same error while the previous one is still visible
  if (dismissable === true) {
    notification.onDidDismiss(clearError);
  } else {
    setTimeout(clearError, 5000);
  }
}
