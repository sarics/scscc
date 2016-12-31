var manifest = chrome.runtime.getManifest();
var toCurrPref = manifest.preferences.filter(function filterPref(pref) {
  return pref.name === 'toCurr';
})[0] || {};
var toCurrOpts = toCurrPref.options || [];

var resBtnElem = document.querySelector('#reset');
var stateBtnElem = document.querySelector('#state');
var optionsBtnElem = document.querySelector('#options');
var toCurrPElem = document.querySelector('#toCurr');
var ratesUlElem = document.querySelector('#rates');

stateBtnElem.addEventListener('click', function listener() {
  var onGet = function onGet(storage) {
    var preferences = storage.preferences;
    preferences.enabled = !preferences.enabled;

    chrome.storage.local.set({ preferences: preferences });
  };

  chrome.storage.local.get('preferences', onGet);
});

resBtnElem.addEventListener('click', function listener() {
  chrome.storage.local.set({ currRates: {} });
});

optionsBtnElem.addEventListener('click', function listener() {
  chrome.runtime.openOptionsPage();
});


chrome.storage.local.get(null, function callback(storage) {
  var enabled = storage.preferences.enabled;
  var toCurr = storage.preferences.toCurr;
  var currRates = storage.currRates || {};

  setState(enabled);
  setToCurr(toCurr);
  refreshCurrRatesList(currRates);

  chrome.storage.onChanged.addListener(onStorageChange);
});

function onStorageChange(changes) {
  if (changes.preferences) {
    var oldPrefs = changes.preferences.oldValue;
    var newPrefs = changes.preferences.newValue;

    if (oldPrefs.enabled !== newPrefs.enabled) setState(newPrefs.enabled);
    if (oldPrefs.toCurr !== newPrefs.toCurr) setToCurr(newPrefs.toCurr);
  }

  if (changes.currRates) {
    refreshCurrRatesList(changes.currRates.newValue);
  }
}

function setState(enabled) {
  stateBtnElem.textContent = enabled ? 'Turn off' : 'Turn on';
}

function setToCurr(curr) {
  while (toCurrPElem.firstChild) {
    toCurrPElem.removeChild(toCurrPElem.firstChild);
  }

  var strongElem = document.createElement('strong');
  var brElem = document.createElement('br');
  var textElem = document.createTextNode('');

  if (curr) {
    var toCurr = toCurrOpts.filter(function filterToCurrOpt(toCurrOpt) {
      return toCurrOpt.value === curr;
    })[0] || null;

    strongElem.textContent = 'Convert to:';
    textElem.textContent = toCurr ? toCurr.label + ' (' + toCurr.value + ')' : curr;
  } else {
    strongElem.textContent = 'No set currency!';
    textElem.textContent = 'Please select a currency on the options page.';
  }

  toCurrPElem.appendChild(strongElem);
  toCurrPElem.appendChild(brElem);
  toCurrPElem.appendChild(textElem);
}

function refreshCurrRatesList(currRates) {
  while (ratesUlElem.firstChild) {
    ratesUlElem.removeChild(ratesUlElem.firstChild);
  }

  Object.keys(currRates).forEach(function callback(key) {
    var currs = key.split('to');
    var liElem = document.createElement('li');

    // span.curr - fromCurr to toCurr:
    var currSpanElem = document.createElement('span');
    currSpanElem.className = 'curr';
    currSpanElem.textContent = currs[0] + ' to ' + currs[1] + ': ';
    liElem.appendChild(currSpanElem);

    // strong - currRate
    var rateStrongElem = document.createElement('strong');
    rateStrongElem.textContent = currRates[key].value;
    liElem.appendChild(rateStrongElem);

    liElem.appendChild(document.createElement('br'));

    // span.upd - lastUpdate
    var updSpanElem = document.createElement('span');
    updSpanElem.className = 'upd';
    updSpanElem.textContent = lastUpdate(currRates[key].updatedAt);
    liElem.appendChild(updSpanElem);

    ratesUlElem.appendChild(liElem);
  });

  if (ratesUlElem.childNodes.length === 0) {
    resBtnElem.style.display = 'none';

    var liElem = document.createElement('li');
    liElem.textContent = 'No downloaded exchange rate yet.';

    ratesUlElem.appendChild(liElem);
  } else {
    resBtnElem.style.display = 'initial';
  }
}

function lastUpdate(currRateLT) {
  var lt = Date.now() - currRateLT;

  if (lt > 3600000) {
    lt = Math.floor(lt / 3600000);
    if (lt === 1) lt = 'more than ' + lt + ' hour';
    else lt = 'more than ' + lt + ' hours';
  } else {
    lt = Math.floor(lt / 60000);
    if (lt === 0) lt = 'less than a minute';
    else if (lt === 1) lt += ' minute';
    else lt += ' minutes';
  }

  return '(updated ' + lt + ' ago)';
}
