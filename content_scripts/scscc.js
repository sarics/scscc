window.SCSCC = window.SCSCC || {};

(function SCSCC() {
  var started = false;
  var preferences = {};
  var currRates = {};
  var requests = {};
  var observer;
  var styleElem;

  var currPatts = [];
  var numPatt = '(((\\d{1,3}((,|\\.|\\s)\\d{3})+|(\\d+))((\\.|,)\\d{1,9})?)|(\\.\\d{1,9}))(,--)?';
  var symbPatts = {
    EUR: '(€|eur(os|o)?)',
    USD: '(\\$|usd)',
    GBP: '(£|gbp)'
  };

  this.init = function init() {
    observer = new MutationObserver(checkMutations);

    styleElem = document.createElement('style');
    styleElem.textContent =
      'data.scscc {\n' +
      '  padding: 0 2px !important;\n' +
      '  color: inherit !important;\n' +
      '  white-space: pre !important;\n' +
      '  border-width: 0 1px !important;\n' +
      '  border-style: dotted !important;\n' +
      '  border-color: inherit !important;\n' +
      '  cursor: help !important;\n' +
      '}\n' +
      'data.scscc:hover {\n' +
      '  background-color: red !important;\n' +
      '  color: white !important;\n' +
      '}';

    // build currPatts
    Object.keys(symbPatts).forEach(function eachSymbPatt(fromCurr) {
      var beforePatt = new RegExp(symbPatts[fromCurr] + '\\s?' + numPatt, 'gi');
      var afterPatt = new RegExp(numPatt + '\\s?' + symbPatts[fromCurr], 'gi');

      currPatts.push({ from: fromCurr, patt: beforePatt }, { from: fromCurr, patt: afterPatt });
    });

    chrome.runtime.sendMessage({ type: 'getStorage' }, function callback(storage) {
      preferences = storage.preferences;
      currRates = storage.currRates;

      if (preferences.enabled && preferences.toCurr) start();

      chrome.runtime.onMessage.addListener(function onMessage(data) {
        console.log('onMessage', data);
        if (data.preferences) {
          var newPrefs = data.preferences;
          var prefsChanged = false;

          Object.keys(newPrefs).forEach(function eachPrefName(prefName) {
            if (!prefsChanged && newPrefs[prefName] !== preferences[prefName]) prefsChanged = true;
          });

          if (prefsChanged) refreshPrefs(newPrefs);
        }

        if (data.currRates) {
          var newCurrRates = data.currRates;
          var currRatesChanged = Object.keys(newCurrRates).length !== Object.keys(currRates).length;

          if (!currRatesChanged) {
            Object.keys(newCurrRates).forEach(function eachCurrKey(currKey) {
              if (!currRatesChanged && (!currRates[currKey] || newCurrRates[currKey].value !== currRates[currKey].value)) currRatesChanged = true;
            });
          }

          if (currRatesChanged) refreshCurrRates(newCurrRates);
        }
      });
    });
  };

  function start() {
    if (started) return;

    started = true;

    // start the observer
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // add style
    if (preferences.style && !styleElem.parentNode) document.head.appendChild(styleElem);

    replacePrices();
  }

  function stop() {
    if (!started) return;

    started = false;

    observer.disconnect();

    if (styleElem.parentNode) styleElem.parentNode.removeChild(styleElem);

    var dataNodes = document.querySelectorAll('data.scscc');
    dataNodes.forEach(function eachDataNode(dataNode) {
      var replTxtNode = document.createTextNode(dataNode.title);
      dataNode.parentNode.replaceChild(replTxtNode, dataNode);
    });
  }

  function checkMutations(mutlist) {
    var isDataScscc = function isDataScscc(node) {
      return /^data$/i.test(node.nodeName) && node.className === 'scscc';
    };

    mutlist.forEach(function eachMut(mut) {
      mut.addedNodes.forEach(function eachAddedNode(addedNode) {
        if (!addedNode.parentNode || isDataScscc(addedNode) || (addedNode.nodeType === 3 && isDataScscc(addedNode.parentNode))) return;

        replacePrices(addedNode);
      });
    });
  }


  function refreshPrefs(newPrefs) {
    preferences = newPrefs;

    if (!preferences.enabled || !preferences.toCurr) {
      stop();
      return;
    }

    if (!preferences.style && styleElem.parentNode) styleElem.parentNode.removeChild(styleElem);
    else if (preferences.style && !styleElem.parentNode) document.head.appendChild(styleElem);

    if (started) refreshPrices();
    else start();
  }

  function refreshCurrRates(newCurrRates) {
    console.log('refreshCurrRates');
    var hasNewCurrRate = Object.keys(newCurrRates).length > Object.keys(currRates).length;
    currRates = newCurrRates;

    if (!started) return;

    refreshPrices();
    if (hasNewCurrRate) replacePrices();
  }


  function replacePrices(elem) {
    var rootElem = elem || document.body;

    var textNodes = getTextNodes(rootElem);
    if (!textNodes.length) return;

    var priceMatches = getPriceMatches(textNodes);
    if (!priceMatches.length) return;

    replacePriceMatches(priceMatches);
  }

  function refreshPrices() {
    var dataNodes = document.querySelectorAll('data.scscc');

    dataNodes.forEach(function eachDataNode(dataNode) {
      var fromCurr = dataNode.dataset.curr;
      var currRate = getCurrRate(fromCurr);
      var replTxtNode;

      if (fromCurr === preferences.toCurr || !currRate) {
        replTxtNode = document.createTextNode(dataNode.title);
        dataNode.parentNode.replaceChild(replTxtNode, dataNode);
      } else {
        var newPrice = parseFloat(dataNode.value) * currRate;
        var replTxt = formatPrice(newPrice);

        if (dataNode.textContent !== newPrice) {
          replTxtNode = document.createTextNode(replTxt);
          dataNode.replaceChild(replTxtNode, dataNode.firstChild);
        }
      }
    });
  }


  // get all text nodes of a given node
  function getTextNodes(node) {
    var textNodes = [];
    var ignoreNodes = /^(script|style|pre)$/i;
    var patt = new RegExp(numPatt);

    function getChildTextNodes(n) {
      if (ignoreNodes.test(n.nodeName) || n.className === 'scscc') return;

      if (n.nodeType === 3 && patt.test(n.nodeValue)) {
        textNodes.push(n);
      } else if (n.nodeType !== 3) {
        n.childNodes.forEach(getChildTextNodes);
      }
    }

    getChildTextNodes(node);

    return textNodes;
  }


  // check if there is any pattern match in a text node and return the matches
  function getPriceMatches(textNodes) {
    var priceMatches = [];

    textNodes.forEach(function eachTextNode(textNode) {
      var txt = textNode.nodeValue;
      var matches = {};

      currPatts.forEach(function eachCurrPatt(currPatt) {
        if (currPatt.from === preferences.toCurr) return;

        var match = txt.match(currPatt.patt);
        if (match) {
          matches[currPatt.from] = (matches[currPatt.from] || []).concat(match);
        }
      });

      if (Object.keys(matches).length) {
        priceMatches.push({
          node: textNode,
          matches: matches
        });
      }
      // else {
      //   var specMatches = checkSiblings(textNode);
      //
      //   if (Object.keys(specMatches).length) {
      //     priceMatches.push({
      //       node: textNode,
      //       matches: specMatches
      //     });
      //   }
      // }
    });

    return priceMatches;
  }

  // check if currency symbol is in an other node
  // function checkSiblings(textNode) {
  //   var chckTxt = {};
  //   var matches = {};
  //   var txt = textNode.nodeValue;
  //
  //   var match = txt.match(new RegExp(numPatt, 'g'));
  //   if (match.length !== 1 || match[0] !== txt.trim()) return matches;
  //
  //   // check previous sibling of
  //   if (textNode.previousSibling && textNode.previousSibling.lastChild && textNode.previousSibling.lastChild.nodeType === 3) {
  //     // this node -> check sibling's last child
  //     chckTxt.prev = textNode.previousSibling.lastChild.nodeValue.trim();
  //   } else if (textNode.parentNode.previousSibling) {
  //     // parent node
  //     if (textNode.parentNode.previousSibling.nodeType === 3) {
  //       // if text node
  //       chckTxt.prev = textNode.parentNode.previousSibling.nodeValue.trim();
  //     } else if (textNode.parentNode.previousSibling.lastChild && textNode.parentNode.previousSibling.lastChild.nodeType === 3) {
  //       // if not text node -> check last child
  //       chckTxt.prev = textNode.parentNode.previousSibling.lastChild.nodeValue.trim();
  //     }
  //   }
  //
  //   // check next sibling of
  //   if (textNode.nextSibling && textNode.nextSibling.firstChild && textNode.nextSibling.firstChild.nodeType === 3) {
  //     // this node -> check sibling's first child
  //     chckTxt.next = textNode.nextSibling.firstChild.nodeValue.trim();
  //   } else if (textNode.parentNode.nextSibling) {
  //     // parent node
  //     if (textNode.parentNode.nextSibling.nodeType === 3) {
  //       // if text node
  //       chckTxt.next = textNode.parentNode.nextSibling.nodeValue.trim();
  //     } else if (textNode.parentNode.nextSibling.firstChild && textNode.parentNode.nextSibling.firstChild.nodeType === 3) {
  //       // if not text node -> check first child
  //       chckTxt.next = textNode.parentNode.nextSibling.firstChild.nodeValue.trim();
  //     }
  //   }
  //
  //   Object.keys(chckTxt).forEach(function eachPos(pos) {
  //     if (!chckTxt[pos]) return;
  //
  //     Object.keys(symbPatts).forEach(function eachFromCurr(fromCurr) {
  //       if (fromCurr === preferences.toCurr) return;
  //
  //       var symbPatt;
  //       if (pos === 'prev') symbPatt = new RegExp(symbPatts[fromCurr] + '$', 'gi');
  //       else symbPatt = new RegExp('^' + symbPatts[fromCurr], 'gi');
  //
  //       if (symbPatt.test(chckTxt[pos])) {
  //         matches[fromCurr] = match;
  //       }
  //     });
  //   });
  //
  //   return matches;
  // }


  function replacePriceMatches(priceMatches) {
    priceMatches.forEach(function eachCurrMatch(currMatch) {
      var dataNodes = getDataNodes(currMatch.node, currMatch.matches);
      if (!dataNodes.length) return;

      replaceText(currMatch.node, dataNodes);
    });
  }


  // find and convert the prices in the text, and return them as data nodes
  function getDataNodes(node, matches) {
    var txt = node.nodeValue;
    var dataNodes = [];

    Object.keys(matches).forEach(function eachFromCurr(fromCurr) {
      var currRate = getCurrRate(fromCurr);
      if (!currRate) return;

      matches[fromCurr].forEach(function eachMatch(match) {
        var repl;
        var dataNode = document.createElement('data');
        dataNode.className = 'scscc';
        dataNode.dataset.curr = fromCurr;

        if (txt.trim() !== match) {
          repl = checkSpecCases(txt, match, fromCurr);
          if (!repl) return;
        } else {
          repl = match;
        }

        dataNode.title = repl;

        repl = cleanPrice(repl);
        dataNode.value = repl;

        repl = parseFloat(repl) * currRate;
        repl = formatPrice(repl);
        dataNode.textContent = repl;

        dataNodes.push(dataNode);
      });
    });

    return dataNodes;
  }

  function getCurrRate(fromCurr) {
    var reqKey = fromCurr + 'to' + preferences.toCurr;
    var currRate = currRates[reqKey] ? currRates[reqKey].value : null;

    if (!requests[reqKey]) {
      requests[reqKey] = true;

      chrome.runtime.sendMessage({ type: 'getCurrRate', data: { from: fromCurr, to: preferences.toCurr } }, function callback() {
        requests[reqKey] = false;
      });
    }

    return currRate;
  }

  function checkSpecCases(txt, match, from) {
    var chckchar;
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
    if (from === 'USD' && match.charAt(0) === '$') {
      chckchar = txt.charAt(charind - 1);
      if (
        /\w/.test(chckchar) &&
        /(A|Bds|BZ|B|CA|CI|EC|FJ|G|HK|J|L|LD|N|NZ|S|SI|NT|TT|TV|Z|CLP|COL|RD|Mex|C|R)$/.test(txt.slice(0, charind))
      ) return null;
    }

    // in case text is like: masseur 1234
    // or
    // in case text is like: 1234 europe
    var sind = match.search(/eur|usd|gbp/i);
    if (sind !== -1) {
      if (sind === 0) { // starts with eur(os)/usd/gbp
        // if there is any word character before it, skip it
        chckchar = txt.charAt(charind - 1);
        if (/\w/.test(chckchar)) return null;
      } else { // ends with eur(os)/usd/gbp
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
        checkedMatch = match.replace(/^\d+\s/, '');  // convert only 234 $
      }
    }

    return checkedMatch;
  }

  // make price computer-readable: remove price symbols, and replace/remove separators
  function cleanPrice(repl) {
    // remove currency symbols and spaces
    var cleanedPrice = repl.replace(/€|eur(os|o)?|\$|usd|£|gbp|,--|\s/ig, '');

    // if no decimal separator
    // remove possible "." or "," thousand separators
    if (cleanedPrice.search(/(\.|,)\d{1,2}$/) === -1) cleanedPrice = cleanedPrice.replace(/\.|,/g, '');
    // if decimal separator is "."
    // remove possible "," thousand separators
    else if (repl.search(/\.\d{1,2}$/) !== -1) cleanedPrice = cleanedPrice.replace(/,/g, '');
    // if decimal separptor is ","
    else {
      // remove possible "." thousand separators
      cleanedPrice = cleanedPrice.replace(/\./g, '');
      // replace dec separator to "."
      cleanedPrice = cleanedPrice.replace(/,/g, '.');
    }

    return cleanedPrice;
  }

  // format the price according to user prefs
  function formatPrice(repl) {
    // set rounding
    var formattedPrice = (preferences.round) ? repl.toFixed(0) : repl.toFixed(2);

    // set decimal separator
    if (preferences.sepDec !== '.') formattedPrice = formattedPrice.replace('.', preferences.sepDec);

    // set thousand separator
    if (preferences.sepTho !== '') {
      for (var i = ((preferences.round) ? formattedPrice.length : formattedPrice.indexOf(preferences.sepDec)) - 3; i > 0; i -= 3) {
        formattedPrice = formattedPrice.slice(0, i) + preferences.sepTho + formattedPrice.slice(i);
      }
    }

    // add symbol
    if (preferences.symbPos === 'a') {
      formattedPrice = formattedPrice + ((preferences.symbSep) ? ' ' : '') + preferences.symbol;
    } else {
      formattedPrice = preferences.symbol + ((preferences.symbSep) ? ' ' : '') + formattedPrice;
    }

    return formattedPrice;
  }


  // replace the prices in the text node with the converted data nodes
  function replaceText(node, dataNodes) {
    var parentNode = node.parentNode;
    var tmpDivElem = document.createElement('div');
    tmpDivElem.appendChild(node.cloneNode());

    dataNodes.forEach(function eachDataNode(dataNode) {
      var replTxt = dataNode.title;
      var replaced = false;

      tmpDivElem.childNodes.forEach(function eachChildNode(childNode) {
        if (replaced || childNode.nodeType !== 3) return;

        var nodeTxt = childNode.nodeValue;
        var matchInd = nodeTxt.indexOf(replTxt);

        if (matchInd === -1) return;

        var tmpTxt;
        var tmpTxtNode;
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
  }
}).apply(window.SCSCC);

window.SCSCC.init();
