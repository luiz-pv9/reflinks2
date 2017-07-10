import sinon from 'sinon';

/**
 * List of pages visited during a fake session. This variable is reset
 * in the function `restoreFakeHistory` (end of this file).
 */
let fakeHistory = [];

/**
 * Replaces `window.history` with a fake object that emulates the history
 * API. Used in tests only.
 */
export function useFakeHistory() {
  window.fakeHistory = {
    pushState(details, name, path) {
      fakeHistory.push({details, name, path});
    },
    get length() {
      return fakeHistory.length;
    },
    latest() {
      return fakeHistory[fakeHistory.length - 1];
    },
    back() {
      let latestVisit = fakeHistory.pop();
    }
  };
}

/**
 * Restores the original `history` api to `window.history` and clears all fake
 * data stored during `enableFakeHistory`.
 */
export function restoreFakeHistory() {
  delete window['fakeHistory'];
  fakeHistory = [];
}