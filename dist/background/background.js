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
/******/ 	return __webpack_require__(__webpack_require__.s = 23);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */,
/* 1 */,
/* 2 */,
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = [{
  title: 'Convert to',
  name: 'toCurr',
  type: 'menulist',
  value: '',
  options: [{
    value: '',
    label: 'Please select a currency'
  }, {
    value: 'DZD',
    label: 'Algerian Dinar'
  }, {
    value: 'ARS',
    label: 'Argentine Peso'
  }, {
    value: 'AUD',
    label: 'Australian Dollar'
  }, {
    value: 'BHD',
    label: 'Bahraini Dinar'
  }, {
    value: 'BOB',
    label: 'Bolivian Boliviano'
  }, {
    value: 'BWP',
    label: 'Botswanan Pula'
  }, {
    value: 'BRL',
    label: 'Brazilian Real'
  }, {
    value: 'GBP',
    label: 'British Pound Sterling'
  }, {
    value: 'BND',
    label: 'Brunei Dollar'
  }, {
    value: 'BGN',
    label: 'Bulgarian Lev'
  }, {
    value: 'CAD',
    label: 'Canadian Dollar'
  }, {
    value: 'KYD',
    label: 'Cayman Islands Dollar'
  }, {
    value: 'XOF',
    label: 'CFA Franc BCEAO'
  }, {
    value: 'CLP',
    label: 'Chilean Peso'
  }, {
    value: 'CNY',
    label: 'Chinese Yuan'
  }, {
    value: 'COP',
    label: 'Colombian Peso'
  }, {
    value: 'CRC',
    label: 'Costa Rican Colón'
  }, {
    value: 'HRK',
    label: 'Croatian Kuna'
  }, {
    value: 'CZK',
    label: 'Czech Republic Koruna'
  }, {
    value: 'DKK',
    label: 'Danish Krone'
  }, {
    value: 'DOP',
    label: 'Dominican Peso'
  }, {
    value: 'EGP',
    label: 'Egyptian Pound'
  }, {
    value: 'EEK',
    label: 'Estonian Kroon'
  }, {
    value: 'EUR',
    label: 'Euro'
  }, {
    value: 'FJD',
    label: 'Fijian Dollar'
  }, {
    value: 'HNL',
    label: 'Honduran Lempira'
  }, {
    value: 'HKD',
    label: 'Hong Kong Dollar'
  }, {
    value: 'HUF',
    label: 'Hungarian Forint'
  }, {
    value: 'INR',
    label: 'Indian Rupee'
  }, {
    value: 'IDR',
    label: 'Indonesian Rupiah'
  }, {
    value: 'ILS',
    label: 'Israeli New Sheqel'
  }, {
    value: 'JMD',
    label: 'Jamaican Dollar'
  }, {
    value: 'JPY',
    label: 'Japanese Yen'
  }, {
    value: 'JOD',
    label: 'Jordanian Dinar'
  }, {
    value: 'KZT',
    label: 'Kazakhstani Tenge'
  }, {
    value: 'KES',
    label: 'Kenyan Shilling'
  }, {
    value: 'KWD',
    label: 'Kuwaiti Dinar'
  }, {
    value: 'LVL',
    label: 'Latvian Lats'
  }, {
    value: 'LBP',
    label: 'Lebanese Pound'
  }, {
    value: 'LTL',
    label: 'Lithuanian Litas'
  }, {
    value: 'MKD',
    label: 'Macedonian Denar'
  }, {
    value: 'MYR',
    label: 'Malaysian Ringgit'
  }, {
    value: 'MUR',
    label: 'Mauritian Rupee'
  }, {
    value: 'MXN',
    label: 'Mexican Peso'
  }, {
    value: 'MDL',
    label: 'Moldovan Leu'
  }, {
    value: 'MAD',
    label: 'Moroccan Dirham'
  }, {
    value: 'NAD',
    label: 'Namibian Dollar'
  }, {
    value: 'NPR',
    label: 'Nepalese Rupee'
  }, {
    value: 'ANG',
    label: 'Netherlands Antillean Guilder'
  }, {
    value: 'TWD',
    label: 'New Taiwan Dollar'
  }, {
    value: 'NZD',
    label: 'New Zealand Dollar'
  }, {
    value: 'NIO',
    label: 'Nicaraguan Córdoba'
  }, {
    value: 'NGN',
    label: 'Nigerian Naira'
  }, {
    value: 'NOK',
    label: 'Norwegian Krone'
  }, {
    value: 'OMR',
    label: 'Omani Rial'
  }, {
    value: 'PKR',
    label: 'Pakistani Rupee'
  }, {
    value: 'PGK',
    label: 'Papua New Guinean Kina'
  }, {
    value: 'PYG',
    label: 'Paraguayan Guarani'
  }, {
    value: 'PEN',
    label: 'Peruvian Nuevo Sol'
  }, {
    value: 'PHP',
    label: 'Philippine Peso'
  }, {
    value: 'PLN',
    label: 'Polish Zloty'
  }, {
    value: 'QAR',
    label: 'Qatari Rial'
  }, {
    value: 'RON',
    label: 'Romanian Leu'
  }, {
    value: 'RUB',
    label: 'Russian Ruble'
  }, {
    value: 'SVC',
    label: 'Salvadoran Colón'
  }, {
    value: 'SAR',
    label: 'Saudi Riyal'
  }, {
    value: 'RSD',
    label: 'Serbian Dinar'
  }, {
    value: 'SCR',
    label: 'Seychellois Rupee'
  }, {
    value: 'SLL',
    label: 'Sierra Leonean Leone'
  }, {
    value: 'SGD',
    label: 'Singapore Dollar'
  }, {
    value: 'SKK',
    label: 'Slovak Koruna'
  }, {
    value: 'ZAR',
    label: 'South African Rand'
  }, {
    value: 'KRW',
    label: 'South Korean Won'
  }, {
    value: 'LKR',
    label: 'Sri Lankan Rupee'
  }, {
    value: 'SEK',
    label: 'Swedish Krona'
  }, {
    value: 'CHF',
    label: 'Swiss Franc'
  }, {
    value: 'TZS',
    label: 'Tanzanian Shilling'
  }, {
    value: 'THB',
    label: 'Thai Baht'
  }, {
    value: 'TTD',
    label: 'Trinidad and Tobago Dollar'
  }, {
    value: 'TND',
    label: 'Tunisian Dinar'
  }, {
    value: 'TRY',
    label: 'Turkish Lira'
  }, {
    value: 'UGX',
    label: 'Ugandan Shilling'
  }, {
    value: 'UAH',
    label: 'Ukrainian Hryvnia'
  }, {
    value: 'AED',
    label: 'United Arab Emirates Dirham'
  }, {
    value: 'UYU',
    label: 'Uruguayan Peso'
  }, {
    value: 'USD',
    label: 'US Dollar'
  }, {
    value: 'UZS',
    label: 'Uzbekistan Som'
  }, {
    value: 'VEF',
    label: 'Venezuelan Bolívar'
  }, {
    value: 'VND',
    label: 'Vietnamese Dong'
  }, {
    value: 'YER',
    label: 'Yemeni Rial'
  }, {
    value: 'ZMK',
    label: 'Zambian Kwacha (1968–2012)'
  }]
}, {
  title: 'Round price',
  name: 'round',
  type: 'bool',
  value: true
}, {
  title: 'Currency symbol',
  name: 'symbol',
  type: 'string',
  value: ''
}, {
  title: 'Symbol position',
  name: 'symbPos',
  type: 'radio',
  value: 'a',
  options: [{
    value: 'b',
    label: 'before'
  }, {
    value: 'a',
    label: 'after'
  }]
}, {
  title: 'Separate symbol from price',
  name: 'symbSep',
  type: 'bool',
  value: true
}, {
  title: 'Thousand separator',
  name: 'sepTho',
  type: 'menulist',
  value: ' ',
  options: [{
    value: '',
    label: 'none'
  }, {
    value: ' ',
    label: 'space'
  }, {
    value: ',',
    label: ','
  }, {
    value: '.',
    label: '.'
  }]
}, {
  title: 'Decimal separator',
  name: 'sepDec',
  type: 'menulist',
  value: ',',
  options: [{
    value: ',',
    label: ','
  }, {
    value: '.',
    label: '.'
  }]
}, {
  title: 'Add custom style to converted prices',
  name: 'style',
  type: 'bool',
  value: true
}, {
  title: 'Show exchange rate update notifications',
  name: 'noti',
  type: 'bool',
  value: true
}];

/***/ }),
/* 4 */,
/* 5 */,
/* 6 */,
/* 7 */,
/* 8 */,
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "icons/icon16.png";

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "icons/icon16_off.png";

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "icons/icon32.png";

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "icons/icon32_off.png";

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "icons/icon48.png";

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "icons/icon48_off.png";

/***/ }),
/* 15 */,
/* 16 */,
/* 17 */,
/* 18 */,
/* 19 */,
/* 20 */,
/* 21 */,
/* 22 */,
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _options = __webpack_require__(3);

var _options2 = _interopRequireDefault(_options);

var _icon = __webpack_require__(9);

var _icon2 = _interopRequireDefault(_icon);

var _icon3 = __webpack_require__(11);

var _icon4 = _interopRequireDefault(_icon3);

var _icon5 = __webpack_require__(13);

var _icon6 = _interopRequireDefault(_icon5);

var _icon16_off = __webpack_require__(10);

var _icon16_off2 = _interopRequireDefault(_icon16_off);

var _icon32_off = __webpack_require__(12);

var _icon32_off2 = _interopRequireDefault(_icon32_off);

var _icon48_off = __webpack_require__(14);

var _icon48_off2 = _interopRequireDefault(_icon48_off);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var manifest = browser.runtime.getManifest();
var requests = {};
var icons = {
  enabled: {
    16: browser.runtime.getURL(_icon2.default),
    32: browser.runtime.getURL(_icon4.default),
    48: browser.runtime.getURL(_icon6.default)
  },
  disabled: {
    16: browser.runtime.getURL(_icon16_off2.default),
    32: browser.runtime.getURL(_icon32_off2.default),
    48: browser.runtime.getURL(_icon48_off2.default)
  }
};

var preferences = { enabled: true };
var currRates = {};

// set default preferences
window.OPTIONS = _options2.default;
_options2.default.forEach(option => {
  preferences[option.name] = option.value;
});

function onError(error) {
  console.error('SCsCC - error:', error.message);
}

// get storage
browser.storage.local.get().then(storage => {
  var newStorage = {};

  if (storage.preferences && Object.keys(storage.preferences).length === Object.keys(preferences).length) {
    preferences = storage.preferences;
  } else {
    preferences = Object.assign({}, preferences, storage.preferences || {});
    newStorage.preferences = preferences;
  }

  if (storage.currRates) {
    var newCurrRates = {};

    Object.keys(storage.currRates).forEach(key => {
      var currRare = storage.currRates[key];
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
}).catch(onError);

browser.storage.onChanged.addListener(changes => {
  if (changes.preferences && changes.preferences.newValue) {
    onPrefsChange(changes.preferences.newValue);
  }
  if (changes.currRates && changes.currRates.newValue) {
    onCurrRatesChange(changes.currRates.newValue);
  }
});

browser.runtime.onMessage.addListener((_ref, sender, sendResponse) => {
  var type = _ref.type,
      data = _ref.data;

  if (type === 'getStorage') {
    sendResponse({ preferences, currRates });
    return false;
  }

  if (type === 'getCurrRate') {
    getCurrRate(data.from, data.to).then(currRate => {
      sendResponse(currRate);
    });
    return true;
  }

  return false;
});

browser.tabs.onActivated.addListener(activeInfo => {
  browser.tabs.sendMessage(activeInfo.tabId, { preferences, currRates }).catch(onError);
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
  var eachActiveTab = activeTab => {
    browser.tabs.sendMessage(activeTab.id, data).catch(onError);
  };

  browser.tabs.query({ active: true }).then(activeTabs => {
    activeTabs.forEach(eachActiveTab);
  }).catch(onError);
}

function getCurrRate(fromCurr, toCurr) {
  var reqKey = `${fromCurr}to${toCurr}`;

  if (!requests[reqKey]) {
    // if last update was within an hour, resolve
    if (currRates[reqKey] && currRates[reqKey].value && currRates[reqKey].updatedAt && Date.now() - currRates[reqKey].updatedAt < 3600000) {
      return Promise.resolve({ currRate: currRates[reqKey] });
    }

    requests[reqKey] = new Promise(resolve => {
      // console.log(`SCsCC - get ${fromCurr} to ${toCurr}`);
      var req = new XMLHttpRequest();

      var onEnd = function listener(event) {
        var request = event ? event.target : null;
        var currRate = reqComplete(request, fromCurr, toCurr);

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
  var reqKey = `${fromCurr}to${toCurr}`;
  var currRate = currRates[reqKey] ? Object.assign({}, currRates[reqKey]) : {};

  if (request && request.status === 200) {
    currRate.updatedAt = Date.now();

    var txtMatch = request.responseText.match(/id=['"]?exchange_rate['"]?(?:\s+type=['"]?hidden['"]?)?\s+value=['"]?(\d+\.\d+)/i);

    if (txtMatch && txtMatch[1]) {
      var newValue = parseFloat(txtMatch[1]);

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
    var newCurrRates = Object.assign({}, currRates);
    newCurrRates[reqKey] = currRate;
    browser.storage.local.set({ currRates: newCurrRates });
  }

  return currRate;
}

// show notification about exchange rate updates if enabled in preferences
function showNotification(fromCurr, toCurr, newValue) {
  if (!preferences.noti) return;

  var reqKey = `${fromCurr}to${toCurr}`;
  var opts = {
    type: 'basic',
    title: manifest.name,
    iconUrl: icons.enabled[48]
  };

  if (currRates[reqKey] && currRates[reqKey].value) {
    // on update
    opts.message = `${fromCurr} to ${toCurr} exchange rate updated:\n${currRates[reqKey].value} → ${newValue}`;
  } else {
    // on frist get
    opts.message = `${fromCurr} to ${toCurr} exchange rate got:\n${newValue}`;
  }

  browser.notifications.create(opts);
}

/***/ })
/******/ ]);