import { addListener, removeListener, callListeners } from '../utils/listenerHelper';

const requests = {};
let listeners = [];
let currRates = {};

browser.storage.local.get('currRates')
  .then(({ currRates: data }) => {
    currRates = data;
    callListeners(listeners, currRates, true);
  });

browser.storage.onChanged.addListener((changes) => {
  if (changes.currRates && changes.currRates.newValue) {
    const newCurrRates = changes.currRates.newValue;
    const hasNew = Object.keys(newCurrRates).length > Object.keys(currRates).length;

    currRates = newCurrRates;
    callListeners(listeners, currRates, hasNew);
  }
});

const get = (fromCurr, toCurr) => {
  const reqKey = `${fromCurr}to${toCurr}`;
  const currRate = currRates[reqKey] ? currRates[reqKey].value : null;

  if (!requests[reqKey]) {
    const data = { from: fromCurr, to: toCurr };
    requests[reqKey] = true;

    browser.runtime.sendMessage({ type: 'getCurrRate', data }, () => {
      requests[reqKey] = false;
    });
  }

  return currRate;
};

const onChange = (cb) => {
  listeners = addListener(listeners, cb);
};

const offChange = (cb) => {
  listeners = removeListener(listeners, cb);
};

export default {
  get,
  onChange,
  offChange,
};
