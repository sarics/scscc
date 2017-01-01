window.SCSCC = window.SCSCC || {};

(function SCSCC() {
  let started = false;
  let preferences = {};
  let currRates = {};
  const requests = {};
  let observer;
  let styleElem;

  const currPatts = [];
  const numPatt = '(((\\d{1,3}((,|\\.|\\s)\\d{3})+|(\\d+))((\\.|,)\\d{1,9})?)|(\\.\\d{1,9}))(,--)?';
  const symbPatts = {
    EUR: '(€|eur(os|o)?)',
    USD: '(\\$|usd)',
    GBP: '(£|gbp)',
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
    Object.keys(symbPatts).forEach((fromCurr) => {
      const beforePatt = new RegExp(`${symbPatts[fromCurr]}\\s?${numPatt}`, 'gi');
      const afterPatt = new RegExp(`${numPatt}\\s?${symbPatts[fromCurr]}`, 'gi');

      currPatts.push({ from: fromCurr, patt: beforePatt }, { from: fromCurr, patt: afterPatt });
    });

    chrome.runtime.sendMessage({ type: 'getStorage' }, (storage) => {
      preferences = storage.preferences;
      currRates = storage.currRates;

      if (preferences.enabled && preferences.toCurr) start();

      chrome.runtime.onMessage.addListener((data) => {
        if (data.preferences) {
          const newPrefs = data.preferences;
          let prefsChanged = false;

          Object.keys(newPrefs).forEach((prefName) => {
            if (!prefsChanged && newPrefs[prefName] !== preferences[prefName]) prefsChanged = true;
          });

          if (prefsChanged) refreshPrefs(newPrefs);
        }

        if (data.currRates) {
          const newCurrRates = data.currRates;
          let currRatesChanged = Object.keys(newCurrRates).length !== Object.keys(currRates).length;

          if (!currRatesChanged) {
            Object.keys(newCurrRates).forEach((currKey) => {
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
      subtree: true,
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

    const dataNodes = document.querySelectorAll('data.scscc');
    dataNodes.forEach((dataNode) => {
      const replTxtNode = document.createTextNode(dataNode.title);
      dataNode.parentNode.replaceChild(replTxtNode, dataNode);
    });
  }

  function checkMutations(mutlist) {
    const isDataScscc = function isDataScscc(node) {
      return /^data$/i.test(node.nodeName) && node.className === 'scscc';
    };

    mutlist.forEach((mut) => {
      mut.addedNodes.forEach((addedNode) => {
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
    const hasNewCurrRate = Object.keys(newCurrRates).length > Object.keys(currRates).length;
    currRates = newCurrRates;

    if (!started) return;

    refreshPrices();
    if (hasNewCurrRate) replacePrices();
  }


  function replacePrices(elem) {
    const rootElem = elem || document.body;

    const textNodes = getTextNodes(rootElem);
    if (!textNodes.length) return;

    const priceMatches = getPriceMatches(textNodes);
    if (!priceMatches.length) return;

    replacePriceMatches(priceMatches);
  }

  function refreshPrices() {
    const dataNodes = document.querySelectorAll('data.scscc');

    dataNodes.forEach((dataNode) => {
      const fromCurr = dataNode.dataset.curr;
      const currRate = getCurrRate(fromCurr);
      let replTxtNode;

      if (fromCurr === preferences.toCurr || !currRate) {
        replTxtNode = document.createTextNode(dataNode.title);
        dataNode.parentNode.replaceChild(replTxtNode, dataNode);
      } else {
        const newPrice = parseFloat(dataNode.value) * currRate;
        const replTxt = formatPrice(newPrice);

        if (dataNode.textContent !== newPrice) {
          replTxtNode = document.createTextNode(replTxt);
          dataNode.replaceChild(replTxtNode, dataNode.firstChild);
        }
      }
    });
  }


  // get all text nodes of a given node
  function getTextNodes(node) {
    const textNodes = [];
    const ignoreNodes = /^(script|style|pre)$/i;
    const patt = new RegExp(numPatt);

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
    const priceMatches = [];

    textNodes.forEach((textNode) => {
      const txt = textNode.nodeValue;
      const matches = {};

      currPatts.forEach((currPatt) => {
        if (currPatt.from === preferences.toCurr) return;

        const match = txt.match(currPatt.patt);
        if (match) {
          matches[currPatt.from] = (matches[currPatt.from] || []).concat(match);
        }
      });

      if (Object.keys(matches).length) {
        priceMatches.push({
          node: textNode,
          matches,
        });
      } else {
        const specMatches = checkSiblingMatches(textNode);

        if (Object.keys(specMatches).length) {
          priceMatches.push({
            node: textNode,
            matches: specMatches,
          });
        }
      }
    });

    return priceMatches;
  }

  // check if currency symbol is in an other sibling node
  function checkSiblingMatches(textNode) {
    const chckTxt = {};
    const matches = {};
    const txt = textNode.nodeValue;

    const match = txt.match(new RegExp(numPatt, 'g'));
    if (match.length !== 1 || match[0] !== txt.trim()) return matches;

    const prevSibling = textNode.previousSibling;
    const parentPrevSibling = textNode.parentNode.previousSibling;
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

    const nextSibling = textNode.nextSibling;
    const parentNextSibling = textNode.parentNode.nextSibling;
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

    Object.keys(chckTxt).forEach((pos) => {
      if (!chckTxt[pos].length) return;

      Object.keys(symbPatts).forEach((fromCurr) => {
        if (fromCurr === preferences.toCurr) return;

        // let symbPatt;
        // if (pos === 'prev') symbPatt = new RegExp(`${symbPatts[fromCurr]}$`, 'gi');
        // else symbPatt = new RegExp(`^${symbPatts[fromCurr]}`, 'gi');
        const symbPatt = new RegExp(`^${symbPatts[fromCurr]}$`, 'gi');

        if (symbPatt.test(chckTxt[pos])) {
          matches[fromCurr] = match;
        }
      });
    });

    return matches;
  }


  function replacePriceMatches(priceMatches) {
    priceMatches.forEach((priceMatch) => {
      const dataNodes = getDataNodes(priceMatch.node, priceMatch.matches);
      if (!dataNodes.length) return;

      replaceText(priceMatch.node, dataNodes);
    });
  }


  // find and convert the prices in the text, and return them as data nodes
  function getDataNodes(node, matches) {
    const txt = node.nodeValue;
    const dataNodes = [];

    Object.keys(matches).forEach((fromCurr) => {
      const currRate = getCurrRate(fromCurr);
      if (!currRate) return;

      matches[fromCurr].forEach((match) => {
        const dataNode = document.createElement('data');
        dataNode.className = 'scscc';
        dataNode.dataset.curr = fromCurr;

        let replTxt;
        if (txt.trim() !== match) {
          replTxt = checkSpecCases(txt, match, fromCurr);
        } else {
          replTxt = match;
        }
        if (!replTxt) return;

        dataNode.title = replTxt;

        const price = cleanPrice(replTxt);
        dataNode.value = price;

        const newPrice = parseFloat(price) * currRate;
        dataNode.textContent = formatPrice(newPrice);

        dataNodes.push(dataNode);
      });
    });

    return dataNodes;
  }

  function getCurrRate(fromCurr) {
    const reqKey = `${fromCurr}to${preferences.toCurr}`;
    const currRate = currRates[reqKey] ? currRates[reqKey].value : null;

    if (!requests[reqKey]) {
      requests[reqKey] = true;

      chrome.runtime.sendMessage({ type: 'getCurrRate', data: { from: fromCurr, to: preferences.toCurr } }, () => {
        requests[reqKey] = false;
      });
    }

    return currRate;
  }

  function checkSpecCases(txt, match, from) {
    let chckchar;
    const charind = txt.indexOf(match);
    let checkedMatch = match;

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
    const sind = match.search(/eur|usd|gbp/i);
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
    let cleanedPrice = repl.replace(/€|eur(os|o)?|\$|usd|£|gbp|,--|\s/ig, '');

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
  function formatPrice(price) {
    // set rounding
    let formattedPrice = (preferences.round) ? price.toFixed(0) : price.toFixed(2);

    // set decimal separator
    if (preferences.sepDec !== '.') formattedPrice = formattedPrice.replace('.', preferences.sepDec);

    // set thousand separator
    if (preferences.sepTho !== '') {
      for (let i = ((preferences.round) ? formattedPrice.length : formattedPrice.indexOf(preferences.sepDec)) - 3; i > 0; i -= 3) {
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
    const parentNode = node.parentNode;
    const tmpDivElem = document.createElement('div');
    tmpDivElem.appendChild(node.cloneNode());

    dataNodes.forEach((dataNode) => {
      const replTxt = dataNode.title;
      let replaced = false;

      tmpDivElem.childNodes.forEach((childNode) => {
        if (replaced || childNode.nodeType !== 3) return;

        const nodeTxt = childNode.nodeValue;
        const matchInd = nodeTxt.indexOf(replTxt);

        if (matchInd === -1) return;

        let tmpTxt;
        let tmpTxtNode;
        const replDivElem = document.createElement('div');

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
