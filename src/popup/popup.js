import './popup.html';
import './popup.css';

const resBtnElem = document.querySelector('#reset');
const stateBtnElem = document.querySelector('#state');
const optionsBtnElem = document.querySelector('#options');
const toCurrSpanElem = document.querySelector('#toCurr');
const ratesUlElem = document.querySelector('#rates');

let toCurrOpts;

browser.runtime.getBackgroundPage()
  .then((bgWindow) => {
    const toCurrOpt = bgWindow.OPTIONS.find((opt) => opt.name === 'toCurr') || {};
    toCurrOpts = toCurrOpt.options || [];

    return browser.storage.local.get();
  })
  .then((storage) => {
    const enabled = storage.preferences.enabled;
    const toCurr = storage.preferences.toCurr;
    const currRates = storage.currRates || {};

    setState(enabled);
    setToCurr(toCurr);
    refreshCurrRatesList(currRates);

    browser.storage.onChanged.addListener(onStorageChange);
  });

stateBtnElem.addEventListener('click', () => {
  browser.storage.local.get('preferences')
    .then((storage) => {
      const preferences = storage.preferences;
      preferences.enabled = !preferences.enabled;

      browser.storage.local.set({ preferences });
    });
});

resBtnElem.addEventListener('click', () => {
  browser.storage.local.set({ currRates: {} });
});

optionsBtnElem.addEventListener('click', () => {
  browser.runtime.openOptionsPage();
});


function onStorageChange(changes) {
  if (changes.preferences) {
    const oldPrefs = changes.preferences.oldValue;
    const newPrefs = changes.preferences.newValue;

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
  if (curr) {
    const toCurr = toCurrOpts.find((toCurrOpt) => toCurrOpt.value === curr) || null;
    toCurrSpanElem.textContent = toCurr ? `${toCurr.label} (${toCurr.value})` : curr;
  } else {
    toCurrSpanElem.textContent = 'Please select a currency on the options page.';
  }
}

function refreshCurrRatesList(currRates) {
  while (ratesUlElem.firstChild) {
    ratesUlElem.removeChild(ratesUlElem.firstChild);
  }

  Object.keys(currRates).forEach((key) => {
    const currs = key.split('to');
    const liElem = document.createElement('li');

    // span.curr - fromCurr to toCurr:
    const currSpanElem = document.createElement('span');
    currSpanElem.className = 'curr';
    currSpanElem.textContent = `${currs[0]} to ${currs[1]}: `;
    liElem.appendChild(currSpanElem);

    // strong - currRate
    const rateStrongElem = document.createElement('strong');
    rateStrongElem.textContent = currRates[key].value;
    liElem.appendChild(rateStrongElem);

    liElem.appendChild(document.createElement('br'));

    // span.upd - lastUpdate
    const updSpanElem = document.createElement('span');
    updSpanElem.className = 'upd';
    updSpanElem.textContent = lastUpdate(currRates[key].updatedAt);
    liElem.appendChild(updSpanElem);

    ratesUlElem.appendChild(liElem);
  });

  if (ratesUlElem.childNodes.length === 0) {
    resBtnElem.style.display = 'none';

    const liElem = document.createElement('li');
    liElem.textContent = 'No downloaded exchange rate yet.';

    ratesUlElem.appendChild(liElem);
  } else {
    resBtnElem.style.display = 'initial';
  }
}

function lastUpdate(updatedAt) {
  const updateDiff = Date.now() - updatedAt;
  let updateTxt;

  if (updateDiff > 3600000) {
    const hourDiff = Math.floor(updateDiff / 3600000);

    updateTxt = `more than ${hourDiff} hour`;
    if (hourDiff > 1) updateTxt += 's';
  } else {
    const minDiff = Math.floor(updateDiff / 60000);

    if (minDiff === 0) updateTxt = 'less than a minute';
    else if (minDiff === 1) updateTxt = '1 minute';
    else updateTxt = `${minDiff} minutes`;
  }

  return `(updated ${updateTxt} ago)`;
}
