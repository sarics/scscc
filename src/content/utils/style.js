const styleElem = document.createElement('style');
styleElem.textContent = 'data.scscc {\n'
  + '  padding: 0 2px !important;\n'
  + '  color: inherit !important;\n'
  + '  white-space: pre !important;\n'
  + '  border-width: 0 1px !important;\n'
  + '  border-style: dotted !important;\n'
  + '  border-color: inherit !important;\n'
  + '  cursor: help !important;\n'
  + '}\n'
  + 'data.scscc:hover {\n'
  + '  background-color: red !important;\n'
  + '  color: white !important;\n'
  + '}';

export default {
  add: () => {
    if (!styleElem.parentNode) document.head.appendChild(styleElem);
  },
  remove: () => {
    if (styleElem.parentNode) styleElem.parentNode.removeChild(styleElem);
  },
};
