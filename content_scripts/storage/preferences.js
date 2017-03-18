const listeners = [];
let preferences = {};

const callListeners = (data) => listeners.forEach((cb) => cb(data));

chrome.runtime.sendMessage({ type: 'getStorage' }, (storage) => {
  preferences = storage.preferences;
  callListeners(preferences);

  chrome.runtime.onMessage.addListener((data) => {
    if (!data.preferences) return;

    const newPrefs = data.preferences;
    let prefsChanged = false;

    Object.keys(newPrefs).forEach((prefName) => {
      if (!prefsChanged && newPrefs[prefName] !== preferences[prefName]) prefsChanged = true;
    });

    if (prefsChanged) {
      preferences = newPrefs;
      callListeners(preferences);
    }
  });
});

const get = (key) => {
  if (key) return preferences[key];
  return preferences;
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
