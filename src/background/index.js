import options from './options';
import getCurrRate from './utils/getCurrRate';
import showNotification from './utils/showNotification';

const icons = {
  enabled: {
    16: browser.runtime.getURL('icons/icon16.png'),
    32: browser.runtime.getURL('icons/icon32.png'),
    48: browser.runtime.getURL('icons/icon48.png'),
  },
  disabled: {
    16: browser.runtime.getURL('icons/icon16_off.png'),
    32: browser.runtime.getURL('icons/icon32_off.png'),
    48: browser.runtime.getURL('icons/icon48_off.png'),
  },
};

let preferences = { enabled: true };
let currRates = {};

// set default preferences
window.OPTIONS = options;
options.forEach((option) => {
  preferences[option.name] = option.value;
});

const onError = (error) => {
  console.error('SCsCC - error:', error.message);
};


const openTab = (path) => {
  const url = browser.runtime.getURL(path);
  const notFoundErr = 'no opened tab found';

  return browser.tabs.query({})
    .then((tabs) => tabs.reduce((oTab, tab) => (!oTab && tab.url === url ? tab : oTab), false))
    .then((oTab) => {
      if (!oTab) throw new Error(notFoundErr);
      return browser.tabs.update(oTab.id, { active: true });
    })
    .catch((err) => {
      if (err.message !== notFoundErr) onError(err);

      return browser.tabs.create({
        active: true,
        url,
      });
    })
    .catch(onError);
};

const openOptionsTab = () => openTab('options/options.html');

const openPopupTab = () => openTab('popup/popup.html');

window.openOptionsPage = () =>
  browser.runtime.openOptionsPage()
    .catch((err) => {
      onError(err);

      openOptionsTab();
    });


// get storage
browser.storage.local.get()
  .then((storage) => {
    const newStorage = {};

    if (storage.preferences && Object.keys(storage.preferences).length === Object.keys(preferences).length) {
      ({ preferences } = storage);
    } else {
      preferences = Object.assign({}, preferences, storage.preferences || {});
      newStorage.preferences = preferences;
    }

    if (storage.currRates) {
      const newCurrRates = {};

      Object.keys(storage.currRates).forEach((key) => {
        const currRare = storage.currRates[key];
        if (Date.now() - currRare.updatedAt < 86400000) {
          newCurrRates[key] = currRare;
        }
      });

      if (Object.keys(storage.currRates).length !== Object.keys(newCurrRates).length) {
        currRates = newCurrRates;
        newStorage.currRates = newCurrRates;
      } else {
        ({ currRates } = storage);
      }
    } else {
      newStorage.currRates = {};
    }

    if (Object.keys(newStorage).length) browser.storage.local.set(newStorage);

    if (!preferences.toCurr) window.openOptionsPage();

    if (browser.browserAction.setIcon) browser.browserAction.setIcon({ path: preferences.enabled ? icons.enabled : icons.disabled });
    browser.browserAction.onClicked.addListener(openPopupTab);
  })
  .catch(onError);

browser.storage.onChanged.addListener((changes) => {
  if (changes.preferences && changes.preferences.newValue) {
    const newPrefs = changes.preferences.newValue;
    if (browser.browserAction.setIcon && newPrefs.enabled !== preferences.enabled) browser.browserAction.setIcon({ path: newPrefs.enabled ? icons.enabled : icons.disabled });

    preferences = newPrefs;
  }
  if (changes.currRates && changes.currRates.newValue) {
    currRates = changes.currRates.newValue;
  }
});


const checkCurrRate = (currRate, fromCurr, toCurr) => {
  const reqKey = `${fromCurr}to${toCurr}`;

  if (!currRates[reqKey] || currRates[reqKey].value !== currRate.value || currRates[reqKey].updatedAt !== currRate.updatedAt) {
    if (preferences.noti && currRate.value) {
      const oldValue = (currRates[reqKey] && currRates[reqKey].value) || null;
      showNotification(fromCurr, toCurr, oldValue, currRate.value);
    }

    const newCurrRates = Object.assign({}, currRates, { [reqKey]: currRate });
    browser.storage.local.set({ currRates: newCurrRates });
  }
};

browser.runtime.onMessage.addListener(({ type, data }) => {
  if (type === 'getCurrRate') {
    const { from: fromCurr, to: toCurr } = data;

    return getCurrRate(currRates, fromCurr, toCurr)
      .then((currRate) => {
        checkCurrRate(currRate, fromCurr, toCurr);
        return currRate;
      });
  }

  return false;
});
