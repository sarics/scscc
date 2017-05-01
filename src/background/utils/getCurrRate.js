const requests = {};

// on getCurrRate request complete
const reqComplete = (request, currRates, reqKey) => {
  const currRate = currRates[reqKey] ? Object.assign({}, currRates[reqKey]) : {};

  if (request && request.status === 200) {
    currRate.updatedAt = Date.now();

    const txtMatch = request.responseText.match(/id=['"]?exchange_rate['"]?(?:\s+type=['"]?hidden['"]?)?\s+value=['"]?(\d+\.\d+)/i);

    if (txtMatch && txtMatch[1]) {
      const newValue = parseFloat(txtMatch[1]);

      if (!Number.isNaN(newValue) && newValue !== currRate.value) {
        currRate.value = newValue;
      }
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
    if (currRates[reqKey] && currRates[reqKey].value && currRates[reqKey].updatedAt && Date.now() - currRates[reqKey].updatedAt < 3600000) {
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
      req.send();
    });
  }

  return requests[reqKey];
};