import options from './options';

const manifest = browser.runtime.getManifest();
const requests = {};
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
options.forEach((option) => {
  preferences[option.name] = option.value;
});

function onError(error) {
  console.error('SCsCC - error:', error.message);
}

// get storage
browser.storage.local.get()
  .then((storage) => {
    const newStorage = {};

    if (storage.preferences && Object.keys(storage.preferences).length === Object.keys(preferences).length) {
      preferences = storage.preferences;
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
      }
    } else {
      newStorage.currRates = {};
    }

    if (Object.keys(newStorage).length) browser.storage.local.set(newStorage);

    if (!preferences.toCurr) browser.runtime.openOptionsPage();

    browser.browserAction.setIcon({ path: preferences.enabled ? icons.enabled : icons.disabled });
  })
  .catch(onError);

browser.storage.onChanged.addListener((changes) => {
  if (changes.preferences && changes.preferences.newValue) {
    onPrefsChange(changes.preferences.newValue);
  }
  if (changes.currRates && changes.currRates.newValue) {
    onCurrRatesChange(changes.currRates.newValue);
  }
});


browser.runtime.onMessage.addListener(({ type, data }, sender, sendResponse) => {
  if (type === 'getStorage') {
    sendResponse({ preferences, currRates });
    return false;
  }

  if (type === 'getCurrRate') {
    getCurrRate(data.from, data.to)
      .then((currRate) => { sendResponse(currRate); });
    return true;
  }

  return false;
});


browser.tabs.onActivated.addListener((activeInfo) => {
  browser.tabs.sendMessage(activeInfo.tabId, { preferences, currRates })
    .catch(onError);
});


function onPrefsChange(newPrefs) {
  if (newPrefs.enabled !== preferences.enabled) browser.browserAction.setIcon({ path: newPrefs.enabled ? icons.enabled : icons.disabled });

  preferences = newPrefs;

  sendToActiveTabs({ preferences });
}

function onCurrRatesChange(newCurrRates) {
  currRates = newCurrRates;

  sendToActiveTabs({ currRates });
}

function sendToActiveTabs(data) {
  const eachActiveTab = (activeTab) => {
    browser.tabs.sendMessage(activeTab.id, data)
      .catch(onError);
  };

  browser.tabs.query({ active: true })
    .then((activeTabs) => { activeTabs.forEach(eachActiveTab); })
    .catch(onError);
}


function getCurrRate(fromCurr, toCurr) {
  const reqKey = `${fromCurr}to${toCurr}`;

  if (!requests[reqKey]) {
    // if last update was within an hour, resolve
    if (currRates[reqKey] && currRates[reqKey].value && currRates[reqKey].updatedAt && Date.now() - currRates[reqKey].updatedAt < 3600000) {
      return Promise.resolve({ currRate: currRates[reqKey] });
    }

    requests[reqKey] = new Promise((resolve) => {
      // console.log(`SCsCC - get ${fromCurr} to ${toCurr}`);
      const req = new XMLHttpRequest();

      const onEnd = function listener(event) {
        const request = event ? event.target : null;
        const currRate = reqComplete(request, fromCurr, toCurr);

        resolve({ currRate });
        requests[reqKey] = undefined;
      };

      req.addEventListener('load', onEnd);
      req.addEventListener('error', onEnd);

      req.open('GET', `https://www.google.com/search?q=1+${fromCurr}+to+${toCurr}&hl=en`, true);
      req.send();
    });
  }

  return requests[reqKey];
}

// on getCurrRate request complete
function reqComplete(request, fromCurr, toCurr) {
  const reqKey = `${fromCurr}to${toCurr}`;
  const currRate = currRates[reqKey] ? Object.assign({}, currRates[reqKey]) : {};

  if (request && request.status === 200) {
    currRate.updatedAt = Date.now();

    const txtMatch = request.responseText.match(/id=['"]?exchange_rate['"]?(?:\s+type=['"]?hidden['"]?)?\s+value=['"]?(\d+\.\d+)/i);

    if (txtMatch && txtMatch[1]) {
      const newValue = parseFloat(txtMatch[1]);

      if (!isNaN(newValue) && newValue !== currRate.value) {
        showNotification(fromCurr, toCurr, newValue);

        currRate.value = newValue;
      }
    }
  } else {
    // will try again if requested after 10 minues
    currRate.updatedAt = Date.now() - 3000000;
  }

  if (!currRates[reqKey] || currRates[reqKey].value !== currRate.value || currRates[reqKey].updatedAt !== currRate.updatedAt) {
    const newCurrRates = Object.assign({}, currRates);
    newCurrRates[reqKey] = currRate;
    browser.storage.local.set({ currRates: newCurrRates });
  }

  return currRate;
}

// show notification about exchange rate updates if enabled in preferences
function showNotification(fromCurr, toCurr, newValue) {
  if (!preferences.noti) return;

  const reqKey = `${fromCurr}to${toCurr}`;
  const opts = {
    type: 'basic',
    title: manifest.name,
    iconUrl: icons.enabled[48],
  };

  if (currRates[reqKey] && currRates[reqKey].value) {  // on update
    opts.message = `${fromCurr} to ${toCurr} exchange rate updated:\n${currRates[reqKey].value} → ${newValue}`;
  } else {  // on frist get
    opts.message = `${fromCurr} to ${toCurr} exchange rate got:\n${newValue}`;
  }

  browser.notifications.create(opts);
}
