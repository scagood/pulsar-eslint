'use babel';

export default function makeSpy(returnValue) {
  /*
   * This will be a 2d array: list of param lists
   * for each time it was called.
   */
  const calledWith = [];

  const call = (...passedArgs) => {
    // Save all the params received to exposed local var
    calledWith.push(passedArgs);
    // Return value provided on spy init
    return returnValue === undefined
      ? 'called spy'
      : returnValue;
  };

  return {
    call: call,
    calledWith: calledWith,
    called: () => calledWith.length > 0,
  };
}
