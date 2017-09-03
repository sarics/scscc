export default (text, onClick) => {
  const rowElem = document.createElement('div');
  rowElem.className = 'row';

  const emplyColElem = document.createElement('div');
  emplyColElem.className = 'col';
  rowElem.appendChild(emplyColElem);

  const buttonColElem = document.createElement('div');
  buttonColElem.className = 'col';

  const buttonElem = document.createElement('button');
  buttonElem.textContent = text;
  buttonElem.addEventListener('click', onClick);

  buttonColElem.appendChild(buttonElem);
  rowElem.appendChild(buttonColElem);

  return rowElem;
};
