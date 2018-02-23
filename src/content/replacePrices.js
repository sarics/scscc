import preferences from './storage/preferences';
import currRates from './storage/currRates';
import getTextNodes from './utils/getTextNodes';
import getPriceMatches from './utils/getPriceMatches';
import getDataNode from './utils/getDataNode';
import * as patts from './utils/patts';
import { checkPriceSpecCases, cleanPrice, formatPrice } from './utils/priceUtils';

// find and convert the prices in the text, and return them as data nodes
const getDataNodes = (node, matches) => {
  const txt = node.nodeValue;
  const dataNodes = [];

  Object.keys(matches).forEach((fromCurr) => {
    const currRate = currRates.get(fromCurr, preferences.get('toCurr'));
    if (!currRate) return;

    matches[fromCurr].forEach((match) => {
      let origTxt;
      if (txt.trim() !== match) {
        origTxt = checkPriceSpecCases(txt, match, fromCurr);
      } else {
        origTxt = match;
      }
      if (!origTxt) return;

      const origVal = cleanPrice(origTxt);
      const formattedVal = formatPrice(parseFloat(origVal) * currRate, preferences.get());

      dataNodes.push(getDataNode(fromCurr, origTxt, origVal, formattedVal));
    });
  });

  return dataNodes;
};

// replace the prices in the text node with the converted data nodes
const replaceText = ({ node, matches }) => {
  const dataNodes = getDataNodes(node, matches);
  if (!dataNodes.length) return;

  const { parentNode } = node;

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
};

export default (elem = document.body) => {
  const textNodes = getTextNodes(elem, patts);
  if (!textNodes.length) return;

  const priceMatches = getPriceMatches(textNodes, preferences.get('toCurr'), patts);
  if (!priceMatches.length) return;

  priceMatches.forEach(replaceText);
};
