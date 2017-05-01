const getCssPseudoContent = (node, place) => {
  const style = window.getComputedStyle(node, `:${place}`);
  if (style && style.content !== 'none') {
    const contentMatch = style.content.match(/^"(.*)"$/);
    if (contentMatch && contentMatch[1]) {
      return contentMatch[1].trim();
    }
  }

  return '';
};

// check if currency symbol is in an other sibling node
const checkSiblingMatches = (textNode, toCurr, { numPatt, symbPatts }) => {
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

  chckTxt.before = getCssPseudoContent(textNode.parentNode, 'before');
  chckTxt.after = getCssPseudoContent(textNode.parentNode, 'after');

  Object.keys(chckTxt).forEach((pos) => {
    if (!chckTxt[pos].length) return;

    Object.keys(symbPatts).forEach((fromCurr) => {
      if (fromCurr === toCurr) return;

      const symbPatt = new RegExp(`^${symbPatts[fromCurr]}$`, 'gi');

      if (symbPatt.test(chckTxt[pos])) {
        matches[fromCurr] = match;
      }
    });
  });

  return matches;
};


// check if there is any pattern match in a text node and return the matches
export default (textNodes, toCurr, patts) => {
  const priceMatches = [];
  const { currPatts } = patts;

  textNodes.forEach((textNode) => {
    const txt = textNode.nodeValue;
    const matches = {};

    currPatts.forEach((currPatt) => {
      if (currPatt.from === toCurr) return;

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
      const specMatches = checkSiblingMatches(textNode, toCurr, patts);

      if (Object.keys(specMatches).length) {
        priceMatches.push({
          node: textNode,
          matches: specMatches,
        });
      }
    }
  });

  return priceMatches;
};
