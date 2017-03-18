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
/******/ 	return __webpack_require__(__webpack_require__.s = 24);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var requests = {};
var listeners = [];
var currRates = {};

var callListeners = function callListeners() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return listeners.forEach(cb => cb(...args));
};

chrome.runtime.sendMessage({ type: 'getStorage' }, storage => {
  currRates = storage.currRates;
  callListeners(currRates, true);

  chrome.runtime.onMessage.addListener(data => {
    if (!data.currRates) return;

    var newCurrRates = data.currRates;
    var currRatesChanged = Object.keys(newCurrRates).length !== Object.keys(currRates).length;

    if (!currRatesChanged) {
      Object.keys(newCurrRates).forEach(currKey => {
        if (!currRatesChanged && (!currRates[currKey] || newCurrRates[currKey].value !== currRates[currKey].value)) currRatesChanged = true;
      });
    }

    if (currRatesChanged) {
      var hasNew = Object.keys(newCurrRates).length > Object.keys(currRates).length;
      currRates = newCurrRates;
      callListeners(currRates, hasNew);
    }
  });
});

var get = (fromCurr, toCurr) => {
  var reqKey = `${fromCurr}to${toCurr}`;
  var currRate = currRates[reqKey] ? currRates[reqKey].value : null;

  if (!requests[reqKey]) {
    var data = { from: fromCurr, to: toCurr };
    requests[reqKey] = true;

    chrome.runtime.sendMessage({ type: 'getCurrRate', data }, () => {
      requests[reqKey] = false;
    });
  }

  return currRate;
};

var onChange = cb => {
  if (listeners.indexOf(cb) === -1) listeners.push(cb);
};

var offChange = cb => {
  if (cb) {
    var cbInd = listeners.indexOf(cb);
    if (cbInd !== -1) listeners.splice(cbInd, 1);
  } else {
    listeners.splice(0, listeners.length);
  }
};

exports.default = {
  get,
  onChange,
  offChange
};

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var listeners = [];
var preferences = {};

var callListeners = data => listeners.forEach(cb => cb(data));

chrome.runtime.sendMessage({ type: 'getStorage' }, storage => {
  preferences = storage.preferences;
  callListeners(preferences);

  chrome.runtime.onMessage.addListener(data => {
    if (!data.preferences) return;

    var newPrefs = data.preferences;
    var prefsChanged = false;

    Object.keys(newPrefs).forEach(prefName => {
      if (!prefsChanged && newPrefs[prefName] !== preferences[prefName]) prefsChanged = true;
    });

    if (prefsChanged) {
      preferences = newPrefs;
      callListeners(preferences);
    }
  });
});

var get = key => {
  if (key) return preferences[key];
  return preferences;
};

var onChange = cb => {
  if (listeners.indexOf(cb) === -1) listeners.push(cb);
};

var offChange = cb => {
  if (cb) {
    var cbInd = listeners.indexOf(cb);
    if (cbInd !== -1) listeners.splice(cbInd, 1);
  } else {
    listeners.splice(0, listeners.length);
  }
};

exports.default = {
  get,
  onChange,
  offChange
};

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var checkPriceSpecCases = exports.checkPriceSpecCases = (txt, match, fromCurr) => {
  var chckchar = void 0;
  var charind = txt.indexOf(match);
  var checkedMatch = match;

  // skip other dollars
  // Australian (A$)
  // Barbadian (Bds$)
  // Belizean (BZ$)
  // Brunei (B$)
  // Canadian (CA$)
  // Cayman Islands (CI$)
  // East Caribbean (EC$)
  // Fiji (FJ$)
  // Guyanese (G$)
  // Hong Kong (HK$)
  // Jamaican (J$)
  // Liberian (L$ or LD$)
  // Namibian (N$)
  // New Zealand (NZ$)
  // Singaporean (S$)
  // Soloman Islands (SI$)
  // Taiwanese (NT$)
  // Trinidad and Tobago (TT$)
  // Tuvaluan (TV$)
  // Zimbabwean (Z$)
  // Chilean (CLP$)
  // Colombian (COL$)
  // Dominican (RD$)
  // Mexican (Mex$)
  // Nicaraguan córdoba (C$)
  // Brazilian real (R$)
  if (fromCurr === 'USD' && match.charAt(0) === '$') {
    chckchar = txt.charAt(charind - 1);
    if (/\w/.test(chckchar) && /(A|Bds|BZ|B|CA|CI|EC|FJ|G|HK|J|L|LD|N|NZ|S|SI|NT|TT|TV|Z|CLP|COL|RD|Mex|C|R)$/.test(txt.slice(0, charind))) return null;
  }

  // in case text is like: masseur 1234
  // or
  // in case text is like: 1234 europe
  var sind = match.search(/eur|usd|gbp/i);
  if (sind !== -1) {
    if (sind === 0) {
      // starts with eur(os)/usd/gbp
      // if there is any word character before it, skip it
      chckchar = txt.charAt(charind - 1);
      if (/\w/.test(chckchar)) return null;
    } else {
      // ends with eur(os)/usd/gbp
      // if there is any word character after it, skip it
      chckchar = txt.charAt(charind + match.length);
      if (/\w/.test(chckchar)) return null;
    }
  }

  // in case text is like: somestring1 234 $
  if (match.charAt(0).search(/\d/) !== -1) {
    // if there is a word character before it
    chckchar = txt.charAt(charind - 1);
    if (chckchar.search(/\w/) !== -1) {
      checkedMatch = match.replace(/^\d+\s/, ''); // convert only 234 $
    }
  }

  return checkedMatch;
};

var cleanPrice = exports.cleanPrice = price => {
  // remove currency symbols and spaces
  var cleanedPrice = price.replace(/€|eur(os|o)?|\$|usd|£|gbp|,--|\s/ig, '');

  // if no decimal separator
  // remove possible "." or "," thousand separators
  if (cleanedPrice.search(/(\.|,)\d{1,2}$/) === -1) cleanedPrice = cleanedPrice.replace(/\.|,/g, '');
  // if decimal separator is "."
  // remove possible "," thousand separators
  else if (price.search(/\.\d{1,2}$/) !== -1) cleanedPrice = cleanedPrice.replace(/,/g, '');
    // if decimal separptor is ","
    else {
        // remove possible "." thousand separators
        cleanedPrice = cleanedPrice.replace(/\./g, '');
        // replace dec separator to "."
        cleanedPrice = cleanedPrice.replace(/,/g, '.');
      }

  return cleanedPrice;
};

var formatPrice = exports.formatPrice = (price, preferences) => {
  // set rounding
  var formattedPrice = preferences.round ? price.toFixed(0) : price.toFixed(2);

  // set decimal separator
  if (preferences.sepDec !== '.') formattedPrice = formattedPrice.replace('.', preferences.sepDec);

  // set thousand separator
  if (preferences.sepTho !== '') {
    for (var i = (preferences.round ? formattedPrice.length : formattedPrice.indexOf(preferences.sepDec)) - 3; i > 0; i -= 3) {
      formattedPrice = formattedPrice.slice(0, i) + preferences.sepTho + formattedPrice.slice(i);
    }
  }

  // add symbol
  if (preferences.symbPos === 'a') {
    formattedPrice = formattedPrice + (preferences.symbSep ? ' ' : '') + preferences.symbol;
  } else {
    formattedPrice = preferences.symbol + (preferences.symbSep ? ' ' : '') + formattedPrice;
  }

  return formattedPrice;
};

/***/ }),
/* 3 */,
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _preferences = __webpack_require__(1);

var _preferences2 = _interopRequireDefault(_preferences);

var _currRates = __webpack_require__(0);

var _currRates2 = _interopRequireDefault(_currRates);

var _priceUtils = __webpack_require__(2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = () => {
  var dataNodes = document.querySelectorAll('data.scscc');

  dataNodes.forEach(dataNode => {
    var fromCurr = dataNode.dataset.curr;
    var currRate = _currRates2.default.get(fromCurr, _preferences2.default.get('toCurr'));
    var replTxtNode = void 0;

    if (fromCurr === _preferences2.default.get('toCurr') || !currRate) {
      replTxtNode = document.createTextNode(dataNode.title);
      dataNode.parentNode.replaceChild(replTxtNode, dataNode);
    } else {
      var newPrice = parseFloat(dataNode.value) * currRate;
      var replTxt = (0, _priceUtils.formatPrice)(newPrice, _preferences2.default.get());

      if (dataNode.textContent !== newPrice) {
        replTxtNode = document.createTextNode(replTxt);
        dataNode.replaceChild(replTxtNode, dataNode.firstChild);
      }
    }
  });
};

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _preferences = __webpack_require__(1);

var _preferences2 = _interopRequireDefault(_preferences);

var _currRates = __webpack_require__(0);

var _currRates2 = _interopRequireDefault(_currRates);

var _getTextNodes = __webpack_require__(21);

var _getTextNodes2 = _interopRequireDefault(_getTextNodes);

var _getPriceMatches = __webpack_require__(20);

var _getPriceMatches2 = _interopRequireDefault(_getPriceMatches);

var _getDataNode = __webpack_require__(19);

var _getDataNode2 = _interopRequireDefault(_getDataNode);

var _patts = __webpack_require__(22);

var patts = _interopRequireWildcard(_patts);

var _priceUtils = __webpack_require__(2);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// find and convert the prices in the text, and return them as data nodes
var getDataNodes = (node, matches) => {
  var txt = node.nodeValue;
  var dataNodes = [];

  Object.keys(matches).forEach(fromCurr => {
    var currRate = _currRates2.default.get(fromCurr, _preferences2.default.get('toCurr'));
    if (!currRate) return;

    matches[fromCurr].forEach(match => {
      var origTxt = void 0;
      if (txt.trim() !== match) {
        origTxt = (0, _priceUtils.checkPriceSpecCases)(txt, match, fromCurr);
      } else {
        origTxt = match;
      }
      if (!origTxt) return;

      var origVal = (0, _priceUtils.cleanPrice)(origTxt);
      var formattedVal = (0, _priceUtils.formatPrice)(parseFloat(origVal) * currRate, _preferences2.default.get());

      dataNodes.push((0, _getDataNode2.default)(fromCurr, origTxt, origVal, formattedVal));
    });
  });

  return dataNodes;
};

// replace the prices in the text node with the converted data nodes
var replaceText = (_ref) => {
  var node = _ref.node,
      matches = _ref.matches;

  var dataNodes = getDataNodes(node, matches);
  if (!dataNodes.length) return;

  var parentNode = node.parentNode;

  var tmpDivElem = document.createElement('div');
  tmpDivElem.appendChild(node.cloneNode());

  dataNodes.forEach(dataNode => {
    var replTxt = dataNode.title;
    var replaced = false;

    tmpDivElem.childNodes.forEach(childNode => {
      if (replaced || childNode.nodeType !== 3) return;

      var nodeTxt = childNode.nodeValue;
      var matchInd = nodeTxt.indexOf(replTxt);

      if (matchInd === -1) return;

      var tmpTxt = void 0;
      var tmpTxtNode = void 0;
      var replDivElem = document.createElement('div');

      if (matchInd > 0) {
        tmpTxt = nodeTxt.slice(0, matchInd);
        tmpTxtNode = document.createTextNode(tmpTxt);
        replDivElem.appendChild(tmpTxtNode);
      }

      replDivElem.appendChild(dataNode);

      if (matchInd + replTxt.length < nodeTxt.length) {
        tmpTxt = nodeTxt.slice(matchInd + replTxt.length);
        tmpTxtNode = document.createTextNode(tmpTxt);
        replDivElem.appendChild(tmpTxtNode);
      }

      while (replDivElem.firstChild) {
        tmpDivElem.insertBefore(replDivElem.firstChild, childNode);
      }
      tmpDivElem.removeChild(childNode);

      replaced = true;
    });
  });

  while (tmpDivElem.firstChild) {
    parentNode.insertBefore(tmpDivElem.firstChild, node);
  }
  parentNode.removeChild(node);
};

exports.default = function () {
  var elem = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : document.body;

  var textNodes = (0, _getTextNodes2.default)(elem, patts);
  if (!textNodes.length) return;

  var priceMatches = (0, _getPriceMatches2.default)(textNodes, _preferences2.default.get('toCurr'), patts);
  if (!priceMatches.length) return;

  priceMatches.forEach(replaceText);
};

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = () => {
  var dataNodes = document.querySelectorAll('data.scscc');

  dataNodes.forEach(dataNode => {
    var replTxtNode = document.createTextNode(dataNode.title);
    dataNode.parentNode.replaceChild(replTxtNode, dataNode);
  });
};

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = onMutation => {
  var isDataScscc = node => /^data$/i.test(node.nodeName) && node.className === 'scscc';

  var checkMutations = mutlist => {
    mutlist.forEach(mut => {
      mut.addedNodes.forEach(addedNode => {
        if (!addedNode.parentNode || isDataScscc(addedNode) || addedNode.nodeType === 3 && isDataScscc(addedNode.parentNode)) return;

        onMutation(addedNode);
      });
    });
  };

  var observer = new MutationObserver(checkMutations);

  return {
    observe: () => observer.observe(document.body, {
      childList: true,
      subtree: true
    }),

    disconnect: observer.disconnect
  };
};

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var styleElem = document.createElement('style');
styleElem.textContent = 'data.scscc {\n' + '  padding: 0 2px !important;\n' + '  color: inherit !important;\n' + '  white-space: pre !important;\n' + '  border-width: 0 1px !important;\n' + '  border-style: dotted !important;\n' + '  border-color: inherit !important;\n' + '  cursor: help !important;\n' + '}\n' + 'data.scscc:hover {\n' + '  background-color: red !important;\n' + '  color: white !important;\n' + '}';

exports.default = {
  add: () => {
    if (!styleElem.parentNode) document.head.appendChild(styleElem);
  },
  remove: () => {
    if (styleElem.parentNode) styleElem.parentNode.removeChild(styleElem);
  }
};

/***/ }),
/* 9 */,
/* 10 */,
/* 11 */,
/* 12 */,
/* 13 */,
/* 14 */,
/* 15 */,
/* 16 */,
/* 17 */,
/* 18 */,
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = (curr, origTxt, origVal, formattedVal) => {
  var dataNode = document.createElement('data');

  dataNode.className = 'scscc';
  dataNode.dataset.curr = curr;
  dataNode.title = origTxt;
  dataNode.value = origVal;
  dataNode.textContent = formattedVal;

  return dataNode;
};

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
// check if currency symbol is in an other sibling node
var checkSiblingMatches = (textNode, toCurr, _ref) => {
  var numPatt = _ref.numPatt,
      symbPatts = _ref.symbPatts;

  var chckTxt = {};
  var matches = {};
  var txt = textNode.nodeValue;

  var match = txt.match(new RegExp(numPatt, 'g'));
  if (match.length !== 1 || match[0] !== txt.trim()) return matches;

  var prevSibling = textNode.previousSibling;
  var parentPrevSibling = textNode.parentNode.previousSibling;
  // check previous sibling of
  if (prevSibling && prevSibling.lastChild && prevSibling.lastChild.nodeType === 3) {
    // this node -> check sibling's last child
    chckTxt.prev = prevSibling.lastChild.nodeValue.trim();
  } else if (parentPrevSibling) {
    // parent node
    if (parentPrevSibling.nodeType === 3) {
      // if text node
      chckTxt.prev = parentPrevSibling.nodeValue.trim();
    } else if (parentPrevSibling.lastChild && parentPrevSibling.lastChild.nodeType === 3) {
      // if not text node -> check last child
      chckTxt.prev = parentPrevSibling.lastChild.nodeValue.trim();
    }
  }

  var nextSibling = textNode.nextSibling;
  var parentNextSibling = textNode.parentNode.nextSibling;
  // check next sibling of
  if (nextSibling && nextSibling.firstChild && nextSibling.firstChild.nodeType === 3) {
    // this node -> check sibling's first child
    chckTxt.next = nextSibling.firstChild.nodeValue.trim();
  } else if (parentNextSibling) {
    // parent node
    if (parentNextSibling.nodeType === 3) {
      // if text node
      chckTxt.next = parentNextSibling.nodeValue.trim();
    } else if (parentNextSibling.firstChild && parentNextSibling.firstChild.nodeType === 3) {
      // if not text node -> check first child
      chckTxt.next = parentNextSibling.firstChild.nodeValue.trim();
    }
  }

  Object.keys(chckTxt).forEach(pos => {
    if (!chckTxt[pos].length) return;

    Object.keys(symbPatts).forEach(fromCurr => {
      if (fromCurr === toCurr) return;

      // let symbPatt;
      // if (pos === 'prev') symbPatt = new RegExp(`${symbPatts[fromCurr]}$`, 'gi');
      // else symbPatt = new RegExp(`^${symbPatts[fromCurr]}`, 'gi');
      var symbPatt = new RegExp(`^${symbPatts[fromCurr]}$`, 'gi');

      if (symbPatt.test(chckTxt[pos])) {
        matches[fromCurr] = match;
      }
    });
  });

  return matches;
};

// check if there is any pattern match in a text node and return the matches

exports.default = (textNodes, toCurr, patts) => {
  var priceMatches = [];
  var currPatts = patts.currPatts;


  textNodes.forEach(textNode => {
    var txt = textNode.nodeValue;
    var matches = {};

    currPatts.forEach(currPatt => {
      if (currPatt.from === toCurr) return;

      var match = txt.match(currPatt.patt);
      if (match) {
        matches[currPatt.from] = (matches[currPatt.from] || []).concat(match);
      }
    });

    if (Object.keys(matches).length) {
      priceMatches.push({
        node: textNode,
        matches
      });
    } else {
      var specMatches = checkSiblingMatches(textNode, toCurr, patts);

      if (Object.keys(specMatches).length) {
        priceMatches.push({
          node: textNode,
          matches: specMatches
        });
      }
    }
  });

  return priceMatches;
};

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (node, patts) {
  var ignore = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : ['script', 'style', 'pre'];

  var textNodes = [];
  var ignoreNodes = new RegExp(`^(${ignore.join('|')})$`, 'i');
  var patt = new RegExp(patts.numPatt);

  var getChildTextNodes = n => {
    if (ignoreNodes.test(n.nodeName) || n.className === 'scscc') return;

    if (n.nodeType === 3 && patt.test(n.nodeValue)) {
      textNodes.push(n);
    } else if (n.nodeType !== 3) {
      n.childNodes.forEach(getChildTextNodes);
    }
  };

  getChildTextNodes(node);

  return textNodes;
};

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var numPatt = exports.numPatt = '(((\\d{1,3}((,|\\.|\\s)\\d{3})+|(\\d+))((\\.|,)\\d{1,9})?)|(\\.\\d{1,9}))(,--)?';
var symbPatts = exports.symbPatts = {
  EUR: '(€|eur(os|o)?)',
  USD: '(\\$|usd)',
  GBP: '(£|gbp)'
};

var currPatts = exports.currPatts = Object.keys(symbPatts).reduce((patts, fromCurr) => {
  var beforePatt = new RegExp(`${symbPatts[fromCurr]}\\s?${numPatt}`, 'gi');
  var afterPatt = new RegExp(`${numPatt}\\s?${symbPatts[fromCurr]}`, 'gi');

  return patts.concat([{ from: fromCurr, patt: beforePatt }, { from: fromCurr, patt: afterPatt }]);
}, []);

/***/ }),
/* 23 */,
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _preferences = __webpack_require__(1);

var _preferences2 = _interopRequireDefault(_preferences);

var _currRates = __webpack_require__(0);

var _currRates2 = _interopRequireDefault(_currRates);

var _mutationObserver = __webpack_require__(7);

var _mutationObserver2 = _interopRequireDefault(_mutationObserver);

var _style = __webpack_require__(8);

var _style2 = _interopRequireDefault(_style);

var _replacePrices = __webpack_require__(5);

var _replacePrices2 = _interopRequireDefault(_replacePrices);

var _refreshPrices = __webpack_require__(4);

var _refreshPrices2 = _interopRequireDefault(_refreshPrices);

var _resetPrices = __webpack_require__(6);

var _resetPrices2 = _interopRequireDefault(_resetPrices);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var started = false;
var observer = (0, _mutationObserver2.default)(_replacePrices2.default);

var start = () => {
  if (started) return;

  started = true;

  observer.observe();

  if (_preferences2.default.get('style')) _style2.default.add();

  (0, _replacePrices2.default)();
};

var stop = () => {
  if (!started) return;

  started = false;

  observer.disconnect();

  _style2.default.remove();

  (0, _resetPrices2.default)();
};

_preferences2.default.onChange(newPrefs => {
  if (!newPrefs.enabled || !newPrefs.toCurr) {
    stop();
    return;
  }

  if (started) {
    if (newPrefs.style) _style2.default.add();else _style2.default.remove();

    (0, _refreshPrices2.default)();
  } else start();
});

_currRates2.default.onChange((newCurrRates, hasNew) => {
  if (!started) return;

  (0, _refreshPrices2.default)();
  if (hasNew) (0, _replacePrices2.default)();
});

/***/ })
/******/ ]);