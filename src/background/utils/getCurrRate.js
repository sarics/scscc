const requests = {};

const patterns = [
  /id=['"]?exchange_rate['"]?[^>]*value=['"]?(\d+\.\d+)['"]?/i,
  /id=['"]?knowledge-currency__tgt-input['"]?[^>]*value=['"]?(\d+\.\d+)['"]?/i,
];

const getTxtMatch = (txt) =>
  patterns.reduce((txtMatch, pattern) => {
    if (txtMatch) return txtMatch;

    const match = txt.match(pattern);
    if (match && match[1]) return match[1];
    return '';
  }, '');

// on getCurrRate request complete
const reqComplete = (request, currRates, reqKey) => {
  const currRate = currRates[reqKey] ? Object.assign({}, currRates[reqKey]) : {};

  if (request && request.status === 200) {
    currRate.updatedAt = Date.now();

    const txtMatch = getTxtMatch(request.responseText);
    const newValue = parseFloat(txtMatch);

    if (!Number.isNaN(newValue)) {
      currRate.value = newValue;
    } else if (!currRate.value) {
      // will try again if requested after 10 minues
      currRate.updatedAt = Date.now() - 3000000;
    }
  } else {
    // will try again if requested after 10 minues
    currRate.updatedAt = Date.now() - 3000000;
  }

  return currRate;
};

export default (currRates, fromCurr, toCurr) => {
  const reqKey = `${fromCurr}to${toCurr}`;

  if (!requests[reqKey]) {
    // if last update was within an hour, resolve
    if (currRates[reqKey] && currRates[reqKey].updatedAt && Date.now() - currRates[reqKey].updatedAt < 3600000) {
      return Promise.resolve(currRates[reqKey]);
    }

    requests[reqKey] = new Promise((resolve) => {
      // console.log(`SCsCC - get ${fromCurr} to ${toCurr}`);
      const req = new XMLHttpRequest();

      const onEnd = function listener(event) {
        const request = event ? event.target : null;
        const currRate = reqComplete(request, currRates, reqKey);

        resolve(currRate);
        requests[reqKey] = undefined;
      };

      req.addEventListener('load', onEnd);
      req.addEventListener('error', onEnd);

      req.open('GET', `https://www.google.com/search?q=1+${fromCurr}+to+${toCurr}&hl=en`, true);
      req.setRequestHeader('User-Agent', 'Mozilla/5.0 (X11; Linux x86_64; rv:55.0) Gecko/20100101 Firefox/55.0'); // to request desktop site
      req.send();
    });
  }

  return requests[reqKey];
};
