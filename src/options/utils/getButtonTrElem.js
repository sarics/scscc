export default (text, onClick) => {
  const trElem = document.createElement('tr');

  const emptyTdElem = document.createElement('td');
  trElem.appendChild(emptyTdElem);

  const buttonTdElem = document.createElement('td');

  const buttonElem = document.createElement('button');
  buttonElem.textContent = text;
  buttonElem.addEventListener('click', onClick);

  buttonTdElem.appendChild(buttonElem);
  trElem.appendChild(buttonTdElem);

  return trElem;
};
