const requests = {};
const listeners = [];
let currRates = {};

const callListeners = (...args) => listeners.forEach((cb) => cb(...args));

chrome.runtime.sendMessage({ type: 'getStorage' }, (storage) => {
  currRates = storage.currRates;
  callListeners(currRates, true);

  chrome.runtime.onMessage.addListener((data) => {
    if (!data.currRates) return;

    const newCurrRates = data.currRates;
    let currRatesChanged = Object.keys(newCurrRates).length !== Object.keys(currRates).length;

    if (!currRatesChanged) {
      Object.keys(newCurrRates).forEach((currKey) => {
        if (!currRatesChanged && (!currRates[currKey] || newCurrRates[currKey].value !== currRates[currKey].value)) currRatesChanged = true;
      });
    }

    if (currRatesChanged) {
      const hasNew = Object.keys(newCurrRates).length > Object.keys(currRates).length;
      currRates = newCurrRates;
      callListeners(currRates, hasNew);
    }
  });
});

const get = (fromCurr, toCurr) => {
  const reqKey = `${fromCurr}to${toCurr}`;
  const currRate = currRates[reqKey] ? currRates[reqKey].value : null;

  if (!requests[reqKey]) {
    const data = { from: fromCurr, to: toCurr };
    requests[reqKey] = true;

    chrome.runtime.sendMessage({ type: 'getCurrRate', data }, () => {
      requests[reqKey] = false;
    });
  }

  return currRate;
};

const onChange = (cb) => {
  if (listeners.indexOf(cb) === -1) listeners.push(cb);
};

const offChange = (cb) => {
  if (cb) {
    const cbInd = listeners.indexOf(cb);
    if (cbInd !== -1) listeners.splice(cbInd, 1);
  } else {
    listeners.splice(0, listeners.length);
  }
};

export default {
  get,
  onChange,
  offChange,
};
