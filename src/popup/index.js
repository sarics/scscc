import './popup.html';
import './popup.css';

import getUpdatedTxt from './utils/getUpdatedTxt';
import getRateLiElem from './utils/getRateLiElem';

const resetBtnElem = document.querySelector('#reset');
const stateBtnElem = document.querySelector('#state');
const optionsBtnElem = document.querySelector('#options');
const toCurrSpanElem = document.querySelector('#toCurr');
const ratesUlElem = document.querySelector('#rates');

let toCurrOpts;

const setState = (enabled) => {
  stateBtnElem.textContent = enabled ? 'Turn off' : 'Turn on';
};

const setToCurr = (curr) => {
  if (curr) {
    const toCurr = toCurrOpts.find((toCurrOpt) => toCurrOpt.value === curr) || null;
    toCurrSpanElem.textContent = toCurr ? `${toCurr.label} (${toCurr.value})` : curr;
  } else {
    toCurrSpanElem.textContent = 'Please select a currency on the options page.';
  }
};

const refreshCurrRatesList = (currRates) => {
  while (ratesUlElem.firstChild) {
    ratesUlElem.removeChild(ratesUlElem.firstChild);
  }

  Object.keys(currRates).forEach((currKey) => {
    const currRate = currRates[currKey];
    const updatedTxt = getUpdatedTxt(currRate.updatedAt);
    const rateLiElem = getRateLiElem(currKey, currRate.value, updatedTxt);

    ratesUlElem.appendChild(rateLiElem);
  });

  if (ratesUlElem.childNodes.length === 0) {
    resetBtnElem.style.display = 'none';

    const liElem = document.createElement('li');
    liElem.textContent = 'No downloaded exchange rate yet.';

    ratesUlElem.appendChild(liElem);
  } else {
    resetBtnElem.style.display = 'initial';
  }
};

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

    browser.storage.onChanged.addListener((changes) => {
      if (changes.preferences) {
        const { oldValue, newValue } = changes.preferences.oldValue;

        if (oldValue.enabled !== newValue.enabled) setState(newValue.enabled);
        if (oldValue.toCurr !== newValue.toCurr) setToCurr(newValue.toCurr);
      }

      if (changes.currRates) {
        refreshCurrRatesList(changes.currRates.newValue);
      }
    });
  });

stateBtnElem.addEventListener('click', () => {
  browser.storage.local.get('preferences')
    .then((storage) => {
      const preferences = storage.preferences;
      preferences.enabled = !preferences.enabled;

      browser.storage.local.set({ preferences });
    });
});

resetBtnElem.addEventListener('click', () => {
  browser.storage.local.set({ currRates: {} });
});

optionsBtnElem.addEventListener('click', () => {
  browser.runtime.openOptionsPage();
});
