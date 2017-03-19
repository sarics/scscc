export default (currKey, currRate, updatedTxt) => {
  const [fromCurr, toCurr] = currKey.split('to');
  const rateLiElem = document.createElement('li');

  // span.curr - fromCurr to toCurr:
  const currSpanElem = document.createElement('span');
  currSpanElem.className = 'curr';
  currSpanElem.textContent = `${fromCurr} to ${toCurr}: `;
  rateLiElem.appendChild(currSpanElem);

  // strong - currRate
  const rateStrongElem = document.createElement('strong');
  rateStrongElem.textContent = currRate;
  rateLiElem.appendChild(rateStrongElem);

  rateLiElem.appendChild(document.createElement('br'));

  // span.upd - lastUpdate
  const updSpanElem = document.createElement('span');
  updSpanElem.className = 'upd';
  updSpanElem.textContent = `(updated ${updatedTxt} ago)`;
  rateLiElem.appendChild(updSpanElem);

  return rateLiElem;
};
