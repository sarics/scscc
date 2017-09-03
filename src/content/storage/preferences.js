import { addListener, removeListener, callListeners } from '../utils/listenerHelper';

let listeners = [];
let preferences = {};

browser.storage.local.get('preferences')
  .then(({ preferences: data }) => {
    if (!data) return;
    preferences = data;
    callListeners(listeners, preferences);
  });

browser.storage.onChanged.addListener((changes) => {
  if (changes.preferences && changes.preferences.newValue) {
    preferences = changes.preferences.newValue;
    callListeners(listeners, preferences);
  }
});

const get = (key) => (key ? preferences[key] : preferences);

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
