var manifest = chrome.runtime.getManifest();
var preferences = { enabled: true };
var currRates = {};
var requests = {};
var icons = {
  enabled: {
    16: chrome.runtime.getURL('icons/icon16.png'),
    32: chrome.runtime.getURL('icons/icon32.png'),
    48: chrome.runtime.getURL('icons/icon48.png')
  },
  disabled: {
    16: chrome.runtime.getURL('icons/icon16_off.png'),
    32: chrome.runtime.getURL('icons/icon32_off.png'),
    48: chrome.runtime.getURL('icons/icon48_off.png')
  }
};

// set default preferences
manifest.preferences.forEach(function callback(pref) {
  preferences[pref.name] = pref.value;
});

// get storage
chrome.storage.local.get(null, function callback(storage) {
  console.log('storage get', storage);

  var newStorage = {};

  if (storage.preferences && Object.keys(storage.preferences).length === Object.keys(preferences).length) {
    preferences = storage.preferences;
  } else {
    preferences = Object.assign({}, preferences, storage.preferences || {});
    newStorage.preferences = preferences;
  }

  if (storage.currRates) {
    var newCurrRates = {};

    Object.keys(storage.currRates).forEach(function cb(key) {
      var currRare = storage.currRates[key];
      if (Date.now() - currRare.updatedAt < 86400000) {
        newCurrRates[key] = currRare;
      }
    });

    currRates = newCurrRates;
    if (Object.keys(storage.currRates).length !== Object.keys(newCurrRates).length) {
      newStorage.currRates = newCurrRates;
    }
  }

  if (Object.keys(newStorage).length) chrome.storage.local.set(newStorage);

  if (!preferences.toCurr) chrome.runtime.openOptionsPage();

  onPrefsChange();
});

chrome.storage.onChanged.addListener(function listener(changes) {
  if (changes.preferences && changes.preferences.newValue) {
    preferences = changes.preferences.newValue;
    onPrefsChange();
  }
  if (changes.currRates && changes.currRates.newValue) {
    currRates = changes.currRates.newValue;
    onCurrRatesChange();
  }
});


chrome.runtime.onMessage.addListener(function listener(event, sender, sendResponse) {
  var type = event.type;
  var data = event.data;

  if (type === 'getStorage') {
    return sendResponse({ preferences: preferences, currRates: currRates });
  }

  if (type === 'getCurrRate') {
    getCurrRate(data.from, data.to).then(function then(currRate) { sendResponse(currRate); });
    return true;
  }

  return false;
});


chrome.tabs.onActivated.addListener(function onActivated(activeInfo) {
  chrome.tabs.sendMessage(activeInfo.tabId, { preferences: preferences, currRates: currRates });
});


function onPrefsChange() {
  chrome.tabs.query({ active: true }, function callback(activeTabs) {
    activeTabs.forEach(function eachActiveTab(activeTab) {
      chrome.tabs.sendMessage(activeTab.id, { preferences: preferences });
    });
  });

  chrome.browserAction.setIcon({ path: preferences.enabled ? icons.enabled : icons.disabled });
}

function onCurrRatesChange() {
  chrome.tabs.query({ active: true }, function callback(activeTabs) {
    activeTabs.forEach(function eachActiveTab(activeTab) {
      chrome.tabs.sendMessage(activeTab.id, { currRates: currRates });
    });
  });
}


function getCurrRate(fromCurr, toCurr) {
  var reqKey = fromCurr + 'to' + toCurr;

  // if a request for this exchange rate runs already, return it
  if (!requests[reqKey]) {
    requests[reqKey] = new Promise(function executor(resolve) {
      // if last request was within an hour, resolve
      if (currRates[reqKey] && currRates[reqKey].updatedAt && Date.now() - currRates[reqKey].updatedAt < 3600000) {
        resolve({ currRate: currRates[reqKey] });
        return;
      }

      console.log('SCsCC - get ' + fromCurr + ' to ' + toCurr);

      var req = new XMLHttpRequest();

      var onEnd = function listener(event) {
        var request = event ? event.target : null;
        var currRate = reqComplete(request, fromCurr, toCurr);

        resolve({ currRate: currRate });
      };

      req.addEventListener('load', onEnd);
      req.addEventListener('error', onEnd);

      req.open('GET', 'https://www.google.com/search?q=1+' + fromCurr + '+to+' + toCurr + '&hl=en', true);
      req.send();
    });
  }

  return requests[reqKey]
    .then(function then(currRate) {
      requests[reqKey] = undefined;
      return currRate;
    });
}

// on getCurrRate request complete
function reqComplete(request, fromCurr, toCurr) {
  var reqKey = fromCurr + 'to' + toCurr;
  var currRate = currRates[reqKey] ? Object.assign({}, currRates[reqKey]) : {};

  if (request && request.status === 200) {
    currRate.updatedAt = Date.now();

    var txtMatch = request.responseText.match(/id=['"]?exchange_rate['"]?(?:\s+type=['"]?hidden['"]?)?\s+value=['"]?(\d+\.\d+)/i);

    if (txtMatch && txtMatch[1]) {
      var newValue = parseFloat(txtMatch[1]);

      if (isNaN(newValue)) {  // if match is not a number
        console.log('SCsCC - got ' + fromCurr + ' to ' + toCurr + ' text, but not a number');
      } else if (newValue === currRate.value) {  // if exchange rate didn't change (no refresh)
        console.log('SCsCC - got ' + fromCurr + ' to ' + toCurr + ', exchange rate didn\'t change',
          currRate.value,
          new Date(currRate.updatedAt).toUTCString());
      } else {
        console.log('SCsCC - got ' + fromCurr + ' to ' + toCurr + ': ' + currRate.value + ' -> ' + newValue,
          new Date(currRate.updatedAt).toUTCString());

        showNotification(fromCurr, toCurr, newValue);

        currRate.value = newValue;
      }
    } else {
      console.log('SCsCC - got text, but regex match failed');
    }
  } else {
    // will try again if requested after 10 minues
    currRate.updatedAt = Date.now() - 3000000;

    if (request) console.log('SCsCC - get error:', request.statusText, request.status);
    else console.log('SCsCC - get error');
  }

  if (!currRates[reqKey] || currRates[reqKey].value !== currRate.value || currRates[reqKey].updatedAt !== currRate.updatedAt) {
    var newCurrRates = Object.assign({}, currRates);
    newCurrRates[reqKey] = currRate;
    chrome.storage.local.set({ currRates: newCurrRates });
  }

  return currRate;
}

// show notification about exchange rate updates if enabled in preferences
function showNotification(fromCurr, toCurr, newValue) {
  if (!preferences.noti) return;

  var reqKey = fromCurr + 'to' + toCurr;
  var options = {
    type: 'basic',
    title: manifest.name,
    iconUrl: icons.enabled[48]
  };

  if (currRates[reqKey]) {  // on update
    options.message = fromCurr + ' to ' + toCurr + ' exchange rate updated:\n' +
      currRates[reqKey].value + ' → ' + newValue;
  } else {  // on frist get
    options.message = fromCurr + ' → ' + toCurr + ' exchange rate got:\n' +
      newValue;
  }

  chrome.notifications.create(options);
}
