/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 26);
/******/ })
/************************************************************************/
/******/ ({

/***/ 17:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "popup/popup.css";

/***/ }),

/***/ 18:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "popup/popup.html";

/***/ }),

/***/ 26:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


__webpack_require__(18);

__webpack_require__(17);

var resBtnElem = document.querySelector('#reset');
var stateBtnElem = document.querySelector('#state');
var optionsBtnElem = document.querySelector('#options');
var toCurrSpanElem = document.querySelector('#toCurr');
var ratesUlElem = document.querySelector('#rates');

var toCurrOpts = void 0;

browser.runtime.getBackgroundPage().then(bgWindow => {
  var toCurrOpt = bgWindow.OPTIONS.find(opt => opt.name === 'toCurr') || {};
  toCurrOpts = toCurrOpt.options || [];

  return browser.storage.local.get();
}).then(storage => {
  var enabled = storage.preferences.enabled;
  var toCurr = storage.preferences.toCurr;
  var currRates = storage.currRates || {};

  setState(enabled);
  setToCurr(toCurr);
  refreshCurrRatesList(currRates);

  browser.storage.onChanged.addListener(onStorageChange);
});

stateBtnElem.addEventListener('click', () => {
  browser.storage.local.get('preferences').then(storage => {
    var preferences = storage.preferences;
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
  if (curr) {
    var toCurr = toCurrOpts.find(toCurrOpt => toCurrOpt.value === curr) || null;
    toCurrSpanElem.textContent = toCurr ? `${toCurr.label} (${toCurr.value})` : curr;
  } else {
    toCurrSpanElem.textContent = 'Please select a currency on the options page.';
  }
}

function refreshCurrRatesList(currRates) {
  while (ratesUlElem.firstChild) {
    ratesUlElem.removeChild(ratesUlElem.firstChild);
  }

  Object.keys(currRates).forEach(key => {
    var currs = key.split('to');
    var liElem = document.createElement('li');

    // span.curr - fromCurr to toCurr:
    var currSpanElem = document.createElement('span');
    currSpanElem.className = 'curr';
    currSpanElem.textContent = `${currs[0]} to ${currs[1]}: `;
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

function lastUpdate(updatedAt) {
  var updateDiff = Date.now() - updatedAt;
  var updateTxt = void 0;

  if (updateDiff > 3600000) {
    var hourDiff = Math.floor(updateDiff / 3600000);

    updateTxt = `more than ${hourDiff} hour`;
    if (hourDiff > 1) updateTxt += 's';
  } else {
    var minDiff = Math.floor(updateDiff / 60000);

    if (minDiff === 0) updateTxt = 'less than a minute';else if (minDiff === 1) updateTxt = '1 minute';else updateTxt = `${minDiff} minutes`;
  }

  return `(updated ${updateTxt} ago)`;
}

/***/ })

/******/ });