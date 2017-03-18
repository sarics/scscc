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
/******/ 	return __webpack_require__(__webpack_require__.s = 25);
/******/ })
/************************************************************************/
/******/ ({

/***/ 15:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "options/options.css";

/***/ }),

/***/ 16:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "options/options.html";

/***/ }),

/***/ 25:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


__webpack_require__(16);

__webpack_require__(15);

var options = void 0;

browser.runtime.getBackgroundPage().then(bgWindow => {
  options = bgWindow.OPTIONS;

  return browser.storage.local.get('preferences');
}).then(storage => {
  buildOptionsForm(storage.preferences);

  browser.storage.onChanged.addListener(changes => {
    if (changes.preferences) {
      var oldPrefs = changes.preferences.oldValue;
      var newPrefs = changes.preferences.newValue;
      var changedPrefs = {};

      Object.keys(changes.preferences.newValue).forEach(prefKey => {
        if (oldPrefs[prefKey] !== newPrefs[prefKey]) changedPrefs[prefKey] = newPrefs[prefKey];
      });

      if (Object.keys(changedPrefs).length) refreshOptionsForm(changedPrefs);
    }
  });
});

function buildOptionsForm(preferences) {
  var tableElem = document.getElementById('options');

  options.forEach(option => {
    var value = preferences[option.name];

    var trElem = document.createElement('tr');

    var labelTdElem = document.createElement('td');
    var labelElem = document.createElement('label');
    labelElem.htmlFor = `option-${option.name}`;
    labelElem.textContent = option.title;

    labelTdElem.appendChild(labelElem);
    trElem.appendChild(labelTdElem);

    var optionTdElem = document.createElement('td');
    var optionElem = void 0;
    if (option.type === 'string') {
      optionElem = document.createElement('input');
      optionElem.type = 'text';
      optionElem.name = option.name;
      optionElem.value = value || '';

      optionElem.addEventListener('input', onChange);
    } else if (option.type === 'bool') {
      optionElem = document.createElement('input');
      optionElem.type = 'checkbox';
      optionElem.name = option.name;
      if (value === true) optionElem.checked = true;

      optionElem.addEventListener('change', onChange);
    } else if (option.type === 'radio') {
      optionElem = document.createElement('div');

      option.options.forEach(opt => {
        var optLabelElem = document.createElement('label');

        var radioElem = document.createElement('input');
        radioElem.type = 'radio';
        radioElem.name = option.name;
        radioElem.value = opt.value;
        if (value === opt.value) radioElem.setAttribute('checked', '');

        radioElem.addEventListener('change', onChange);

        optLabelElem.appendChild(radioElem);
        optLabelElem.appendChild(document.createTextNode(opt.label));
        optionElem.appendChild(optLabelElem);
      });
    } else if (option.type === 'menulist') {
      optionElem = document.createElement('select');
      optionElem.name = option.name;

      option.options.forEach(opt => {
        var optElem = document.createElement('option');
        optElem.value = opt.value;
        optElem.textContent = opt.label;
        if (value === opt.value) optElem.setAttribute('selected', '');

        optionElem.appendChild(optElem);
      });

      optionElem.addEventListener('change', onChange);
    }

    if (optionElem) {
      optionElem.id = `option-${option.name}`;

      optionTdElem.appendChild(optionElem);
      trElem.appendChild(optionTdElem);
    }

    tableElem.appendChild(trElem);
  });

  document.body.appendChild(tableElem);
}

function refreshOptionsForm(changedPrefs) {
  Object.keys(changedPrefs).forEach(prefName => {
    var optionElem = document.querySelector(`[name="${prefName}"]`);

    if (optionElem) {
      if (optionElem.type === 'radio') {
        var radioElem = document.querySelector(`[name="${prefName}"][value="${changedPrefs[prefName]}"]`);
        if (radioElem) radioElem.checked = true;
      } else if (optionElem.type === 'checkbox') {
        optionElem.checked = changedPrefs[prefName];
      } else {
        optionElem.value = changedPrefs[prefName];
      }
    }
  });
}

function onChange(event) {
  var target = event.target;
  var prefName = target.name;
  var prefValue = target.type === 'checkbox' ? target.checked : target.value;

  var changedPrefs = {};
  changedPrefs[prefName] = prefValue;

  // change the symbol on currency change
  if (prefName === 'toCurr') {
    changedPrefs.symbol = prefValue;
  }

  // if a space inserted before the symbol, remove it, and set symbSep to true
  if (prefName === 'symbol' && (prefValue.charAt(0) === ' ' || prefValue.charAt(prefValue.length - 1) === ' ')) {
    var symbSepElem = document.getElementById('option-symbSep');
    if (!symbSepElem.checked) changedPrefs.symbSep = true;

    target.value = prefValue.trim();
    delete changedPrefs.symbol;
  }

  // don't const to set the same thousand and decimal separator
  if (prefName === 'sepTho' && [',', '.'].indexOf(prefValue) !== -1) {
    var sepDecElem = document.getElementById('option-sepDec');
    if (sepDecElem.value === prefValue) {
      changedPrefs.sepDec = prefValue === ',' ? '.' : ',';
    }
  } else if (prefName === 'sepDec') {
    var sepThoElem = document.getElementById('option-sepTho');
    if (sepThoElem.value === prefValue) {
      changedPrefs.sepTho = prefValue === ',' ? '.' : ',';
    }
  }

  if (Object.keys(changedPrefs).length) {
    browser.storage.local.get('preferences').then(storage => {
      browser.storage.local.set({ preferences: Object.assign({}, storage.preferences, changedPrefs) });
    });
  }
}

/***/ })

/******/ });