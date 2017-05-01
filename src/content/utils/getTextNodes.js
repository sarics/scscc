export default (node, patts, ignore = ['script', 'style', 'pre', 'code']) => {
  const textNodes = [];
  const ignoreNodes = new RegExp(`^(${ignore.join('|')})$`, 'i');
  const patt = new RegExp(patts.numPatt);

  const getChildTextNodes = (n) => {
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
